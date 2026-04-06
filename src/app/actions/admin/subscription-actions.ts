"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

/**
 * Admin Server Action: Grant or extend a subscription for any user.
 *
 * - Cancels any existing ACTIVE subscription for the user first.
 * - Creates a fresh ACTIVE subscription linked to the specified plan.
 * - endDate: pass null for LIFETIME plans, otherwise a concrete Date.
 * - Recorded with provider "MANUAL_OVERRIDE" so it's auditable.
 */
export async function grantSubscriptionOverride(
  userId: string,
  planId: string,
  endDate: string | null  // ISO string or null (lifetime)
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  // Validate plan exists and is active
  const plan = await prisma.plan.findFirst({
    where: { id: planId, isActive: true },
  });

  if (!plan) {
    throw new Error("Plan not found or is inactive.");
  }

  // Validate target user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  // Cancel all existing ACTIVE / PAST_DUE subscriptions for the user
  await prisma.subscription.updateMany({
    where: {
      userId,
      status: { in: ["ACTIVE", "PAST_DUE"] },
    },
    data: { status: "CANCELLED" },
  });

  // Create the new manual override subscription
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : null,
      nextBillingDate: null,          // No billing cycle for manual grants
      provider: "MANUAL_OVERRIDE",
      providerSubId: `ADMIN:${session.user.id}:${Date.now()}`,
    },
  });

  logger.info(
    "admin:subscription",
    `Subscription override granted for user ${userId} by admin ${session.user.id}. Plan: ${plan.name}, Ends: ${endDate ?? "LIFETIME"}`
  );

  revalidatePath(`/admin/users/${userId}`);
  return { success: true, subscription };
}

/**
 * Admin Server Action: Revoke an active subscription immediately.
 */
export async function revokeSubscription(
  subscriptionId: string,
  userId: string
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "CANCELLED" },
  });

  logger.info(
    "admin:subscription",
    `Subscription ${subscriptionId} revoked by admin ${session.user.id}.`
  );

  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}
