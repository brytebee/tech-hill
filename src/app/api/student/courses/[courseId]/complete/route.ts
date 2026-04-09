// app/api/student/courses/[courseId]/complete/route.ts
// Validates all required topics are complete then marks enrollment COMPLETED.
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    // Fetch enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
    });

    if (!enrollment || enrollment.status === "COMPLETED") {
      return NextResponse.json(
        { error: enrollment?.status === "COMPLETED" ? "Already completed" : "Not enrolled" },
        { status: 400 }
      );
    }

    // Fetch all required topics for this course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            topics: {
              where: { isRequired: true },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const requiredTopicIds = course.modules.flatMap((m: any) =>
      m.topics.map((t: any) => t.id)
    );

    // Check that all required topics are completed
    const completedCount = await prisma.topicProgress.count({
      where: {
        userId: session.user.id,
        topicId: { in: requiredTopicIds },
        status: "COMPLETED",
      },
    });

    if (completedCount < requiredTopicIds.length) {
      return NextResponse.json(
        {
          error: "Not all required topics are complete",
          completed: completedCount,
          required: requiredTopicIds.length,
        },
        { status: 422 }
      );
    }

    // Mark enrollment as COMPLETED
    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        overallProgress: 100,
        lastAccessAt: new Date(),
      },
    });

    logger.info(
      "student:courses:complete",
      `User ${session.user.id} completed course ${courseId}`
    );

    return NextResponse.json({ success: true, enrollment: updated });
  } catch (error: any) {
    logger.error(
      "student:courses:complete",
      "POST /api/student/courses/[courseId]/complete error:",
      error
    );
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
