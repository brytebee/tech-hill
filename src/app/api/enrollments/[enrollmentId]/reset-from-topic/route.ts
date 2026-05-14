// app/api/enrollments/[enrollmentId]/reset-from-topic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProgressService } from "@/lib/services/progressService";

interface RouteContext {
  params: Promise<{ enrollmentId: string }>;
}

/**
 * POST /api/enrollments/:enrollmentId/reset-from-topic
 * Body: { topicId: string }
 *
 * Partially resets a course from the given topic downward.
 * Earlier lessons are untouched.
 * Students can only reset their own enrollment.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enrollmentId } = await params;
  const body = await req.json().catch(() => ({}));
  const { topicId } = body as { topicId?: string };

  if (!topicId) return NextResponse.json({ error: "topicId is required" }, { status: 400 });

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, userId: true, courseId: true },
  });

  if (!enrollment) return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  const isSelf  = enrollment.userId === session.user.id;
  if (!isAdmin && !isSelf) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const updated = await (ProgressService as any).resetCourseProgressFromTopic(
      enrollment.userId,
      enrollment.courseId,
      topicId
    );
    return NextResponse.json({
      success: true,
      newProgress: updated.overallProgress,
      message: "Progress partially reset. Earlier lessons preserved.",
    });
  } catch (err: any) {
    console.error("[reset-from-topic]", err);
    return NextResponse.json({ error: err.message ?? "Reset failed." }, { status: 500 });
  }
}
