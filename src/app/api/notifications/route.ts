import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NotificationService } from "@/lib/services/notificationService";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor") || undefined;

    const data = await NotificationService.getUserNotifications(
      session.user.id,
      limit,
      cursor
    );

    return NextResponse.json(data);
  } catch (error: any) {
    logger.error("notifications", "GET /api/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await NotificationService.markAllAsRead(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("notifications", "PUT /api/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
