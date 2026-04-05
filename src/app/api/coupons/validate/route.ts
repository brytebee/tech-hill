import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PromotionService } from "@/lib/services/promotionService";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, planId, courseId } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 },
      );
    }

    const result = await PromotionService.validateCoupon(
      code,
      session.user.id,
      courseId,
      planId,
    );

    if (!result.isValid) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupon: result.coupon,
    });
  } catch (error: any) {
    logger.error("coupons:validate", "Coupon validation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
