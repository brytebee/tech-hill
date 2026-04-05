import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/notifications/stream
 * Server-Sent Events stream.  
 * Pushes new unread notifications to the client in real-time 
 * without the overhead of WebSockets.
 *
 * The client keeps this connection alive; whenever a new notification 
 * is written to the DB the next poll (every 5 s) picks it up and 
 * pushes it down the wire.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  const encoder = new TextEncoder();
  let lastSeenId: string | null = null;
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to push an SSE frame
      const send = (event: string, data: unknown) => {
        if (isClosed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          isClosed = true;
        }
      };

      // Send the initial unread count immediately on connect
      try {
        const unreadCount = await prisma.notification.count({
          where: { userId, isRead: false },
        });
        send("connected", { unreadCount });
      } catch (err) {
        logger.error("SSEStream", "Failed initial unread count fetch", err);
      }

      // Poll every 5 seconds for new notifications
      const interval = setInterval(async () => {
        if (isClosed) {
          clearInterval(interval);
          return;
        }

        try {
          const where = {
            userId,
            isRead: false,
            ...(lastSeenId ? { id: { gt: lastSeenId } } : {}),
          };

          const newNotifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: "asc" },
            take: 20,
          });

          if (newNotifications.length > 0) {
            lastSeenId = newNotifications[newNotifications.length - 1].id;
            const unreadCount = await prisma.notification.count({
              where: { userId, isRead: false },
            });
            send("notifications", { notifications: newNotifications, unreadCount });
          }
        } catch (err) {
          logger.error("SSEStream", "Failed to poll notifications", err);
        }
      }, 5000);

      // Clean up when connection closes
      req.signal.addEventListener("abort", () => {
        isClosed = true;
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disables nginx buffering for Vercel/proxy deploys
    },
  });
}
