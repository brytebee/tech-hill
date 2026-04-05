import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PromotionService } from "@/lib/services/promotionService";
import { paymentService } from "@/lib/payment/service";
import { PaystackService } from "@/lib/payment/paystack";
import { TransactionType, Currency, Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { courseId, planId, couponCode } = await request.json();

    if (!courseId && !planId) {
      return NextResponse.json(
        { message: "Course or Plan is required" },
        { status: 400 },
      );
    }

    let amount = 0;
    let metadata: any = { userId: session.user.id };
    let transactionType: TransactionType = TransactionType.COURSE_PURCHASE;

    if (courseId) {
      const { currentPrice } = await PromotionService.getCurrentPrice(courseId);
      amount = currentPrice;
      metadata.courseId = courseId;
      transactionType = TransactionType.COURSE_PURCHASE;
    } else if (planId) {
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan)
        return NextResponse.json(
          { message: "Plan not found" },
          { status: 404 },
        );
      amount = Number(plan.price);
      metadata.planId = planId;
      transactionType = TransactionType.SUBSCRIPTION_PURCHASE;
    }

    // Apply coupon if provided
    if (couponCode) {
      const couponResult = await PromotionService.validateCoupon(
        couponCode,
        session.user.id,
        courseId,
        planId,
      );

      if (couponResult.isValid && couponResult.coupon) {
        const coupon = couponResult.coupon;
        let discount = 0;
        if (coupon.discountType === "PERCENTAGE") {
          discount = (amount * Number(coupon.discountValue)) / 100;
          if (coupon.maxDiscountAmount) {
            discount = Math.min(discount, Number(coupon.maxDiscountAmount));
          }
        } else {
          discount = Number(coupon.discountValue);
        }
        amount = Math.max(0, amount - discount);
        metadata.couponId = coupon.id;
        metadata.couponCode = couponCode;
      }
    }

    // ─── FREE ENROLLMENT SHORT-CIRCUIT ───────────────────────────────────────
    // Paystack rejects ₦0 transactions. When a course is free OR a 100% coupon
    // has been applied, we skip the payment gateway entirely and enroll directly.
    if (amount <= 0) {
      const reference = `FREE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await prisma.$transaction(async (tx) => {
        // Log a ₦0 transaction for auditing purposes
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            amount: new Prisma.Decimal(0),
            currency: Currency.NGN,
            status: "SUCCESS",
            type: transactionType,
            reference,
            provider: "FREE",
            metadata: metadata as Prisma.InputJsonValue,
            courseId: courseId ?? null,
          },
        });

        // Enroll in the course immediately
        if (courseId) {
          await tx.enrollment.upsert({
            where: { userId_courseId: { userId: session.user.id, courseId } },
            update: { status: "ACTIVE" },
            create: { userId: session.user.id, courseId, status: "ACTIVE" },
          });
        }

        // Mark coupon as used
        if (metadata.couponId) {
          await tx.coupon.update({
            where: { id: metadata.couponId },
            data: { usedCount: { increment: 1 } },
          });
          await tx.couponUsage.create({
            data: { userId: session.user.id, couponId: metadata.couponId },
          });
        }
      });

      return NextResponse.json({ free: true, enrolled: true });
    }
    // ─────────────────────────────────────────────────────────────────────────

    const reference = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // ── FEE PASSTHROUGH ─────────────────────────────────────────────────────
    // Customer pays the Paystack fee on top of the course/plan price.
    const { grossAmount, fee } = PaystackService.calculateFeePassthrough(amount);
    metadata.paystackFee    = fee;
    metadata.netAmount      = amount;
    metadata.grossAmount    = grossAmount;
    // ────────────────────────────────────────────────────────────────────────

    const payment = await paymentService.initializeTransaction({
      email: session.user.email!,
      amount: grossAmount,          // charge the inflated gross
      currency: "NGN",
      reference,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/callback`,
      metadata,
    });

    // Persist the net amount the merchant receives (not the gross)
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount: new Prisma.Decimal(amount),  // net — what we actually earn
        currency: Currency.NGN,
        status: "PENDING",
        type: transactionType,
        reference,
        provider: "PAYSTACK",
        metadata: metadata as Prisma.InputJsonValue,
        courseId: courseId ?? null,
      },
    });

    return NextResponse.json(payment);
  } catch (error: any) {
    logger.error("checkout:initialize", "Checkout initialization error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
