import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NotificationService } from "@/lib/services/notificationService";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const notification = await NotificationService.markAsRead(id, session.user.id);
    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    logger.error("notifications:id", "PATCH /api/notifications/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("unauthorized") ? 403 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("notifications:id", "DELETE /api/notifications/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
