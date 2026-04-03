import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { paymentService } from "@/lib/payment/service";
import { PaystackService } from "@/lib/payment/paystack";
import { CouponService } from "@/lib/services/couponService";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, couponCode } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    // Fetch Plan
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Invalid Plan" }, { status: 404 });
    }

    // Apply coupon if provided
    let netAmount = Number(plan.price);
    let discountAmount = 0;
    let couponId: string | undefined;

    if (couponCode) {
      const coupon = await CouponService.validateCoupon(
        couponCode,
        session.user.id,
        plan.id,
      );
      const discount = CouponService.calculateDiscount(
        netAmount,
        coupon.discountType,
        Number(coupon.discountValue),
      );
      netAmount      = discount.finalAmount;
      discountAmount = discount.discountAmount;
      couponId       = coupon.id;
    }

    // ── FEE PASSTHROUGH ──────────────────────────────────────────────────────
    // Customer is responsible for Paystack's transaction fee.
    // We inflate the charged amount so the merchant receives `netAmount` exactly.
    const { grossAmount, fee } = PaystackService.calculateFeePassthrough(netAmount);
    // ─────────────────────────────────────────────────────────────────────────

    const reference = `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paymentResponse = await paymentService.initializeTransaction({
      email: session.user.email,
      amount: grossAmount, // charge inflated gross — customer pays the fee
      currency: "NGN",
      reference,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/callback?reference=${reference}`,
      metadata: {
        userId: session.user.id,
        planId: plan.id,
        type: "SUBSCRIPTION",
        couponId,
        couponCode,
        discountAmount,
        paystackFee: fee,
        netAmount,
        grossAmount,
      },
      // Only attach Paystack plan code when there is no coupon discount
      // (Paystack plan codes enforce their own amount for recurring billing)
      planCode: discountAmount > 0 ? undefined : plan.paystackPlanCode || undefined,
    });

    // Log the pending transaction — store net (what we earn), not gross
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount: netAmount,
        currency: "NGN",
        type: "SUBSCRIPTION_PURCHASE",
        status: "PENDING",
        reference,
        provider: "PAYSTACK",
        metadata: {
          ...paymentResponse,
          originalPrice: Number(plan.price),
          discountAmount,
          couponId,
          couponCode,
          paystackFee: fee,
          grossAmount,
        },
      },
    });

    return NextResponse.json({ url: paymentResponse.authorizationUrl });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
