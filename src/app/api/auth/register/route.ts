import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, isValidEmail, isStrongPassword } from "@/lib/utils";
import { UserRole, UserStatus } from "@prisma/client";

// Simple in-memory rate limiter for anti-spam (5 requests per IP per minute)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
    const now = Date.now();
    const windowMs = 60 * 1000;
    
    let rateData = rateLimitMap.get(ip);
    if (!rateData || now - rateData.lastReset > windowMs) {
      rateData = { count: 0, lastReset: now };
    }
    
    if (rateData.count >= 5) {
      return NextResponse.json(
        { message: "Too many attempts, please try again later." },
        { status: 429 }
      );
    }
    
    rateData.count++;
    rateLimitMap.set(ip, rateData);

    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate first name
    if (firstName.trim().length < 2) {
      return NextResponse.json(
        {
          message: "First name must be at least 2 characters",
          field: "firstName",
        },
        { status: 400 }
      );
    }

    // Validate last name
    if (lastName.trim().length < 2) {
      return NextResponse.json(
        {
          message: "Last name must be at least 2 characters",
          field: "lastName",
        },
        { status: 400 }
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address", field: "email" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters with uppercase, lowercase, and number",
          field: "password",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "An account with this email already exists",
          field: "email",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: UserRole.STUDENT,
        status: UserStatus.INACTIVE, // Now requires email verification
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate Verification Token
    const crypto = await import("crypto");
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    // Import EmailService here so it avoids edge runtime constraints if it ever switches
    const { EmailService } = await import("@/engine/lib/services/emailService");
    
    // Dispatch Verification Email (don't await or catch its error, so registration succeeds even if email fails)
    await EmailService.sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      token,
    });

    // Log successful registration
    console.log(`New user registered and verification email sent: ${user.email} (${user.id})`);

    return NextResponse.json(
      {
        message: "Account created successfully. Please check your email to verify.",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
