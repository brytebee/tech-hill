import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PlanService } from "@/lib/services/planService";
import { z } from "zod";
import { logger } from "@/lib/logger";

const planUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.enum(["NGN", "USD"]).optional(),
  interval: z.enum(["MONTHLY", "YEARLY", "LIFETIME"]).optional(),
  isActive: z.boolean().optional(),
  features: z.array(z.string()).min(1).optional(),
  paystackPlanCode: z.string().optional().nullable(),
  stripePriceId: z.string().optional().nullable(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  let planId = "";
  try {
    planId = (await params).planId;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = planUpdateSchema.parse(body);

    const planData = {
      ...validatedData,
      ...(validatedData.paystackPlanCode !== undefined && { paystackPlanCode: validatedData.paystackPlanCode || undefined }),
      ...(validatedData.stripePriceId !== undefined && { stripePriceId: validatedData.stripePriceId || undefined }),
    };

    const updatedPlan = await PlanService.updatePlan(planId, planData as any);

    return NextResponse.json({
      success: true,
      plan: {
        ...updatedPlan,
        price: Number(updatedPlan.price)
      }
    });
  } catch (error: any) {
    logger.error("admin:plans:put", "[UPDATE_PLAN_ERROR]", { error, planId });
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to update plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // We do soft delete (disable) to preserve records
    await PlanService.disablePlan(planId);

    return NextResponse.json({ success: true, message: "Plan disabled successfully" });
  } catch (error: any) {
    logger.error("admin:plans:delete", "[DISABLE_PLAN_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to disable plan" },
      { status: 500 }
    );
  }
}
