import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ message: "Verification token is required" }, { status: 400 });
    }

    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationRecord) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    if (verificationRecord.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ message: "Verification token has expired. Please register again or request a new link." }, { status: 400 });
    }

    // Find the user by the identifier (email)
    const user = await prisma.user.findUnique({
      where: { email: verificationRecord.identifier },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.status === UserStatus.ACTIVE) {
      // Already verified, just clean up the token
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ message: "Account is already verified", alreadyVerified: true }, { status: 200 });
    }

    // Update user status and delete token transactionally
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { status: UserStatus.ACTIVE },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    return NextResponse.json({ message: "Account successfully verified" }, { status: 200 });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
