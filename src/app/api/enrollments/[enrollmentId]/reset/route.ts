// app/api/enrollments/[enrollmentId]/reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProgressService } from "@/lib/services/progressService";

interface RouteContext {
  params: Promise<{ enrollmentId: string }>;
}

/**
 * POST /api/enrollments/:enrollmentId/reset
 *
 * Resets a student's course progress back to 0%.
 *
 * Auth rules:
 *  - ADMIN / MANAGER → can reset any enrollment.
 *  - STUDENT         → can only reset their own enrollment.
 *
 * The enrollment record itself is preserved (student stays enrolled
 * without needing to re-pay), but all TopicProgress, ModuleProgress,
 * and QuizAttempt records for the student in this course are deleted.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { enrollmentId } = await params;

  // Fetch the enrollment to check ownership / existence.
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, userId: true, courseId: true },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
  }

  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "MANAGER";
  const isSelf = enrollment.userId === session.user.id;

  // Students may only reset their own progress.
  if (!isAdmin && !isSelf) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updated = await (ProgressService as any).resetCourseProgress(
      enrollment.userId,
      enrollment.courseId
    );

    return NextResponse.json({
      success: true,
      message: "Course progress has been reset successfully.",
      enrollment: {
        id: updated.id,
        status: updated.status,
        overallProgress: updated.overallProgress,
        completedAt: updated.completedAt,
      },
    });
  } catch (error: any) {
    console.error("[reset-enrollment] Error:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to reset progress." },
      { status: 500 }
    );
  }
}
