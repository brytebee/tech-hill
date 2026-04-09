// app/api/admin/promotions/coupons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      maxUsesPerUser,
      expiresAt,
      minPurchaseAmount,
      maxDiscountAmount,
    } = body;

    if (!code || !discountType || discountValue == null) {
      return NextResponse.json({ error: "code, discountType and discountValue are required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description: description || null,
        discountType,
        discountValue,
        maxUses: maxUses ?? null,
        maxUsesPerUser: maxUsesPerUser ?? 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        minPurchaseAmount: minPurchaseAmount ?? null,
        maxDiscountAmount: maxDiscountAmount ?? null,
        isActive: true,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
    }
    logger.error("admin:promotions:coupons", "POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
