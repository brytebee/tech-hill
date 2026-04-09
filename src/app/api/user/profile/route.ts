import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      firstName,
      lastName,
      phoneNumber,
      address,
      dateOfBirth,
      profileImage,
    } = body;

    // Validate minimum required fields if they are submitted
    if (firstName !== undefined && !firstName.trim()) {
       return NextResponse.json({ error: "First name is required" }, { status: 400 });
    }
    if (lastName !== undefined && !lastName.trim()) {
       return NextResponse.json({ error: "Last name is required" }, { status: 400 });
    }

    // Build update data safely
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber.trim() || null;
    if (address !== undefined) updateData.address = address.trim() || null;
    
    // Convert date string if provided
    if (dateOfBirth !== undefined) {
       updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage || null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          address: true,
          dateOfBirth: true,
          profileImage: true,
      }
    });

    logger.info("auth:profile_update", `User ${userId} updated their profile settings`);

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error: any) {
    logger.error("api:user:profile", "PATCH error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          address: true,
          dateOfBirth: true,
          profileImage: true,
      }
    });

    if (!user) {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    logger.error("api:user:profile", "GET error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
