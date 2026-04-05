import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/engine/lib/auth";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const passkeys = await prisma.passkeyCredential.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        deviceType: true,
        backedUp: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ passkeys });
  } catch (error) {
    logger.error("auth:passkeys:list", "List Passkeys Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
