import { prisma } from "@/lib/db";
import { DiscountType } from "@prisma/client";

export class CouponService {
  /**
   * Validate a coupon code for a specific user and plan context.
   * Throws an error if invalid, otherwise returns the discount details.
   */
  static async validateCoupon(
    code: string,
    userId: string,
    planId?: string,
    courseId?: string,
  ) {
    // 1. Find the coupon
    const coupon = (await prisma.coupon.findUnique({
      where: { code },
      include: {
        restrictedToPlans: { select: { planId: true } },
        restrictedToCourses: { select: { courseId: true } },
      },
    })) as any;

    if (!coupon) {
      throw new Error("Invalid coupon code");
    }

    // 2. Check if active and not expired
    if (!coupon.isActive) {
      throw new Error("This coupon is no longer active");
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new Error("This coupon has expired");
    }

    // 3. Check global usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new Error("This coupon has reached its maximum usage limit");
    }

    // 4. Check per-user usage
    const userUsageCount = await prisma.couponUsage.count({
      where: {
        userId,
        couponId: coupon.id,
      },
    });

    const maxUsesPerUser = coupon.maxUsesPerUser || 1;
    if (userUsageCount >= maxUsesPerUser) {
      throw new Error(
        "You have already reached the usage limit for this coupon",
      );
    }

    // 5. Check Plan Restrictions
    if (coupon.restrictedToPlans.length > 0) {
      if (!planId) {
        throw new Error("This coupon requires a subscription plan selection");
      }
      const isAllowed = coupon.restrictedToPlans.some(
        (p: { planId: string }) => p.planId === planId,
      );
      if (!isAllowed) {
        throw new Error("This coupon cannot be applied to the selected plan");
      }
    }

    // 6. Check Course Restrictions
    if (coupon.restrictedToCourses.length > 0) {
      if (!courseId) {
        throw new Error("This coupon is restricted to specific courses");
      }
      const isAllowed = coupon.restrictedToCourses.some(
        (c: { courseId: string }) => c.courseId === courseId,
      );
      if (!isAllowed) {
        throw new Error("This coupon cannot be applied to the selected course");
      }
    }

    return {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      maxDiscountAmount: coupon.maxDiscountAmount
        ? Number(coupon.maxDiscountAmount)
        : null,
      description: coupon.description,
    };
  }

  /**
   * Apply a coupon to a transaction amount.
   * Returns the final amount (0 if free) and the discount amount.
   */
  static calculateDiscount(
    amount: number,
    discountType: DiscountType,
    discountValue: number,
  ) {
    let discountAmount = 0;

    if (discountType === "PERCENTAGE") {
      discountAmount = amount * (discountValue / 100);
    } else {
      discountAmount = discountValue;
    }

    // Ensure we don't discount more than the total price
    if (discountAmount > amount) {
      discountAmount = amount;
    }

    const finalAmount = amount - discountAmount;

    return {
      originalAmount: amount,
      discountAmount, // The amount saved
      finalAmount, // The amount to pay
    };
  }

  /**
   * Record the usage of a coupon after a successful transaction.
   */
  static async recordUsage(couponId: string, userId: string, orderId?: string) {
    return await prisma.$transaction([
      prisma.couponUsage.create({
        data: {
          couponId,
          userId,
          orderId,
        },
      }),
      prisma.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: { increment: 1 },
        },
      }),
    ]);
  }
}
