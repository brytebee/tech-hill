import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PlanService } from "@/lib/services/planService";
import { z } from "zod";
import { logger } from "@/lib/logger";

const planSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative"),
  currency: z.enum(["NGN", "USD"]).default("NGN"),
  interval: z.enum(["MONTHLY", "YEARLY", "LIFETIME"]),
  isActive: z.boolean().default(true),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  paystackPlanCode: z.string().optional().nullable(),
  stripePriceId: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get('active') !== 'false'; // Default true unless explicitly false

    const plans = await PlanService.getAllPlans(!onlyActive ? false : true);
    
    // Ensure all plan prices are serialized and format matches original modal requirements
    const formattedPlans = plans.map(p => ({
      ...p,
      price: Number(p.price)
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error: any) {
    logger.error("admin:plans:get", "[FETCH_PLANS_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = planSchema.parse(body);

    const plan = await PlanService.createPlan({
      ...validatedData,
      paystackPlanCode: validatedData.paystackPlanCode ?? undefined,
      stripePriceId: validatedData.stripePriceId ?? undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Plan created successfully",
      plan: {
        ...plan,
        price: Number(plan.price)
      }
    });
  } catch (error: any) {
    logger.error("admin:plans:post", "[CREATE_PLAN_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to create plan" },
      { status: 500 }
    );
  }
}
