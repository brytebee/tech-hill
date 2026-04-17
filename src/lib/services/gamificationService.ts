import { prisma } from "@/lib/db";
import { BadgeCategory } from "@prisma/client";
import { logger } from "@/lib/logger";

export class GamificationService {
  /**
   * Updates the user's daily streak.
   * - If activity today: no change.
   * - If activity yesterday: +1 streak.
   * - If no activity yesterday or today: reset to 1.
   */
  static async updateDailyStreak(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streakDays: true, lastActivityDate: true },
      });

      if (!user) return null;

      const now = new Date();
      // Normalize to midnight UTC to cleanly compare days without time variances
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let newStreak = user.streakDays || 0;
      const lastActivity = user.lastActivityDate
        ? new Date(
            user.lastActivityDate.getFullYear(),
            user.lastActivityDate.getMonth(),
            user.lastActivityDate.getDate()
          )
        : null;

      if (!lastActivity) {
        // First activity ever
        newStreak = 1;
      } else {
        const diffTime = today.getTime() - lastActivity.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

        if (diffDays === 0) {
          // Already active today, streak maintained. Update lastActivityDate timestamp only.
          await prisma.user.update({
            where: { id: userId },
            data: { lastActivityDate: now },
          });
          return newStreak;
        } else if (diffDays === 1) {
          // Continuous 
          newStreak += 1;
        } else {
          // Streak broken
          newStreak = 1;
        }
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          streakDays: newStreak,
          lastActivityDate: now,
        },
      });

      // Issue milestone streak notifications
      if ([3, 7, 30, 100, 365].includes(newStreak)) {
        await prisma.notification.create({
          data: {
            userId,
            title: `${newStreak}-Day Streak! 🔥`,
            message: `Unstoppable momentum! You've maintained your learning streak for ${newStreak} consecutive days. Keep building!`,
            type: "ACHIEVEMENT" as any, // fallback to SYSTEM if ACHIEVEMENT isn't in Enum
          },
        });
      }

      return newStreak;
    } catch (error) {
      logger.error("gamification", "Failed to update daily streak", { userId, error });
      return null;
    }
  }

  /**
   * Awards XP to a user and automatically unlocks any eligible threshold badges.
   */
  static async awardXP(userId: string, amount: number, reason: string) {
    if (amount <= 0) return null;

    try {
      // 1. Increment User XP
      const user = await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: amount } },
        select: { id: true, xp: true },
      });

      // Log the award (could be moved to an independent UserActivity table later)
      logger.info("gamification", `Awarded ${amount} XP`, { userId, reason, totalXp: user.xp });

      // 2. Evaluate Badge Thresholds
      // Find all badges the user qualifies for by XP threshold...
      const eligibleBadges = await prisma.identityBadge.findMany({
        where: {
          xpThreshold: { lte: user.xp, not: null },
        },
      });

      // ...and filter out ones they already have
      const existingUserBadges = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true },
      });
      const existingBadgeIds = new Set(existingUserBadges.map((b) => b.badgeId));

      const badgesToAward = eligibleBadges.filter((b) => !existingBadgeIds.has(b.id));

      // 3. Award New Badges
      for (const badge of badgesToAward) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });

        // Fire notification for new badge
        await prisma.notification.create({
          data: {
            userId,
            title: `Badge Unlocked: ${badge.title} 🏆`,
            message: `You earned a new identity badge: ${badge.title}. ${badge.description}`,
            type: "SYSTEM",
          },
        });
      }

      return {
        previousXp: user.xp - amount,
        newXp: user.xp,
        awardedAmount: amount,
        badgesUnlocked: badgesToAward.length,
      };
    } catch (error) {
      logger.error("gamification", "Failed to award XP", { userId, amount, error });
      return null;
    }
  }

  /**
   * Specifically awards a badge by its unique title (non-XP based badges).
   */
  static async awardBadgeByTitle(userId: string, badgeTitle: string) {
    try {
      const badge = await prisma.identityBadge.findUnique({
        where: { title: badgeTitle },
      });

      if (!badge) {
        logger.warn("gamification", `Attempted to award non-existent badge: ${badgeTitle}`);
        return false;
      }

      // Upsert to handle unique constraint safely
      const existing = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badge.id,
          },
        },
      });

      if (!existing) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });

        await prisma.notification.create({
          data: {
            userId,
            title: `Special Badge Unlocked: ${badge.title} 🌟`,
            message: badge.description,
            type: "SYSTEM",
          },
        });
        return true;
      }

      return false; // Already had the badge
    } catch (error) {
      logger.error("gamification", "Failed to award badge", { userId, badgeTitle, error });
      return false;
    }
  }
}
