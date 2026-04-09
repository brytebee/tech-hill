import { prisma } from "@/lib/db";
import { BillingInterval, Currency } from "@prisma/client";

export interface CreatePlanData {
  name: string;
  description?: string;
  price: number;
  currency?: Currency;
  interval: BillingInterval;
  isActive?: boolean;
  features: string[];
  paystackPlanCode?: string;
  stripePriceId?: string;
}

export interface UpdatePlanData extends Partial<CreatePlanData> {}

export class PlanService {
  /**
   * Get all plans (both active and inactive)
   */
  static async getAllPlans(onlyActive = false) {
    return await prisma.plan.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [
        { isActive: 'desc' },
        { price: 'asc' }
      ],
      include: {
        _count: {
          select: { subscriptions: true }
        }
      }
    });
  }

  /**
   * Get a single plan by ID
   */
  static async getPlanById(id: string) {
    return await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true }
        }
      }
    });
  }

  /**
   * Create a new subscription plan
   */
  static async createPlan(data: CreatePlanData) {
    return await prisma.plan.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency || "NGN",
        interval: data.interval,
        isActive: data.isActive ?? true,
        features: data.features,
        paystackPlanCode: data.paystackPlanCode,
        stripePriceId: data.stripePriceId,
      },
    });
  }

  /**
   * Update an existing plan
   */
  static async updatePlan(id: string, data: UpdatePlanData) {
    // If setting to inactive, we don't delete it (to preserve subscription history)
    return await prisma.plan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price !== undefined ? data.price : undefined,
        currency: data.currency,
        interval: data.interval,
        isActive: data.isActive,
        features: data.features,
        paystackPlanCode: data.paystackPlanCode,
        stripePriceId: data.stripePriceId,
      },
    });
  }

  /**
   * Soft delete / Disable a plan
   */
  static async disablePlan(id: string) {
    return await prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
