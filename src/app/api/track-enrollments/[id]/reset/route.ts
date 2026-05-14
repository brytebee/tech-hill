// app/api/track-enrollments/[id]/reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProgressService } from "@/lib/services/progressService";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/track-enrollments/:id/reset
 *
 * Resets all course progress inside a Career Path and reopens the TrackEnrollment.
 * Auth: ADMIN/MANAGER = any enrollment; STUDENT = self only.
 */
export async function POST(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const te = await (prisma as any).trackEnrollment.findUnique({
    where: { id },
    select: { id: true, userId: true, trackId: true },
  });

  if (!te) return NextResponse.json({ error: "Track enrollment not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  const isSelf  = te.userId === session.user.id;

  if (!isAdmin && !isSelf)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await (ProgressService as any).resetTrackEnrollment(te.userId, te.trackId);
    return NextResponse.json({ success: true, message: "Career Path has been fully reset." });
  } catch (error: any) {
    console.error("[reset-track-enrollment]", error);
    return NextResponse.json({ error: error.message ?? "Reset failed." }, { status: 500 });
  }
}
