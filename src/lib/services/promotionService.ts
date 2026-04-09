import { prisma } from "@/lib/db";
import { Course, FlashSale } from "@prisma/client";

export class PromotionService {
  /**
   * Calculates the current effective price of a course based on active flash sales.
   */
  static async getCurrentPrice(courseId: string): Promise<{
    originalPrice: number;
    currentPrice: number;
    discountPercentage: number;
    activeFlashSale: FlashSale | null;
  }> {
    const course = (await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        flashSales: {
          where: {
            isActive: true,
            startTime: { lte: new Date() },
            endTime: { gte: new Date() },
          },
          orderBy: { discountPercentage: "desc" },
          take: 1,
        },
      },
    })) as any;

    if (!course) {
      throw new Error("Course not found");
    }

    const originalPrice = Number(course.price);
    const activeFlashSale = course.flashSales[0] || null;

    if (!activeFlashSale) {
      return {
        originalPrice,
        currentPrice: originalPrice,
        discountPercentage: 0,
        activeFlashSale: null,
      };
    }

    const discountPercentage = activeFlashSale.discountPercentage;
    const discountAmount = (originalPrice * discountPercentage) / 100;
    const currentPrice = originalPrice - discountAmount;

    return {
      originalPrice,
      currentPrice: Math.round(currentPrice * 100) / 100, // Round to 2 decimal places
      discountPercentage,
      activeFlashSale,
    };
  }

  /**
   * Validates a coupon code for a user and context
   */
  static async validateCoupon(
    code: string,
    userId: string,
    courseId?: string,
    planId?: string,
  ) {
    const coupon = (await prisma.coupon.findUnique({
      where: { code },
      include: {
        restrictedToCourses: true,
        restrictedToPlans: true,
      },
    })) as any;

    if (!coupon || !coupon.isActive) {
      return { isValid: false, reason: "Coupon not found or inactive" };
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { isValid: false, reason: "Coupon expired" };
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { isValid: false, reason: "Coupon usage limit reached" };
    }

    // Check course restriction
    if (coupon.restrictedToCourses.length > 0 && courseId) {
      const isAllowed = coupon.restrictedToCourses.some(
        (rc: any) => rc.courseId === courseId,
      );
      if (!isAllowed) {
        return { isValid: false, reason: "Coupon not valid for this course" };
      }
    }

    // Check plan restriction
    if (coupon.restrictedToPlans.length > 0 && planId) {
      const isAllowed = coupon.restrictedToPlans.some(
        (rp: any) => rp.planId === planId,
      );
      if (!isAllowed) {
        return { isValid: false, reason: "Coupon not valid for this plan" };
      }
    }

    // Check user usage limit
    if (coupon.maxUsesPerUser) {
      const userUsage = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: userId,
        },
      });

      if (userUsage >= coupon.maxUsesPerUser) {
        return { isValid: false, reason: "You have already used this coupon" };
      }
    }

    return { isValid: true, coupon };
  }
}
