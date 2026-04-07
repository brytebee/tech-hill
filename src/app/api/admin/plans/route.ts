import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/plans
 * Returns all active Plans for the admin subscription override modal.
 * Restricted to ADMIN role only.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      interval: true,
    },
    orderBy: { price: "asc" },
  });

  return NextResponse.json({ plans });
}
