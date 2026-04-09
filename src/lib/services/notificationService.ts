import { prisma } from "@/lib/db";
import { NotificationType } from "@prisma/client";
import { logger } from "@/lib/logger";

export class NotificationService {
  /**
   * Retrieves paginated notifications for a specific user
   */
  static async getUserNotifications(userId: string, limit = 20, cursor?: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (notifications.length > limit) {
      const nextItem = notifications.pop();
      nextCursor = nextItem?.id;
    }

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      unreadCount,
      nextCursor,
    };
  }

  /**
   * Creates a new notification for a specific user
   */
  static async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    linkUrl?: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        linkUrl: data.linkUrl,
      },
    });
  }

  /**
   * Marks a specific notification as read
   */
  static async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or unauthorized access to notification");
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Marks all notifications as read for a specific user
   */
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
