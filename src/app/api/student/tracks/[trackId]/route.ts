// app/api/student/tracks/[trackId]/route.ts
// Student-facing endpoint: returns track details + their personal enrollment progress
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackId } = await params;

    const [track, enrollment, allAccessPlans, activeCourse, activeTrack] = await Promise.all([
      prisma.track.findUnique({
        where: { id: trackId, isPublished: true },
        include: {
          plans: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              interval: true,
              features: true,
            },
          },
          courses: {
            orderBy: { order: "asc" },
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  thumbnail: true,
                  difficulty: true,
                  duration: true,
                },
              },
            },
          },
        },
      }),
      prisma.trackEnrollment.findUnique({
        where: { userId_trackId: { userId: session.user.id, trackId } },
        select: {
          id: true,
          completedCourses: true,
          currentCourseId: true,
          status: true,
        },
      }),
      prisma.plan.findMany({
        where: { isActive: true, trackId: null },
        select: {
          id: true,
          name: true,
          price: true,
          interval: true,
          features: true,
        },
      }),
      prisma.enrollment.findFirst({
        where: { userId: session.user.id, status: "ACTIVE" },
        select: { course: { select: { title: true } } },
      }),
      prisma.trackEnrollment.findFirst({
        where: { userId: session.user.id, status: "ACTIVE", NOT: { trackId } },
        select: { track: { select: { title: true } } },
      }),
    ]);

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const isActiveEnrollment = enrollment && ["ACTIVE", "COMPLETED"].includes(enrollment.status);

    let activeJourneyMessage: string | null = null;
    if (activeCourse) {
      activeJourneyMessage = `Focus Check: You are currently active in the course "${activeCourse.course.title}". To commit to this Career Path, you must either complete it or forfeit/drop it from your dashboard.`;
    } else if (activeTrack) {
      activeJourneyMessage = `Focus Check: You are already committed to the "${activeTrack.track.title}" Career Path. You must either complete it or forfeit your progress by dropping it before starting a new one.`;
    }

    return NextResponse.json({
      ...track,
      enrollment: isActiveEnrollment ? enrollment : null,
      allAccessPlans,
      activeJourneyMessage,
    });
  } catch (error: any) {
    logger.error("student:tracks:trackId", "GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/student/tracks/[trackId] — forfeit / drop a career path enrollment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackId } = await params;

    const enrollment = await prisma.trackEnrollment.findUnique({
      where: { userId_trackId: { userId: session.user.id, trackId } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "No active enrollment found for this path" }, { status: 404 });
    }

    if (enrollment.status === "DROPPED") {
      return NextResponse.json({ error: "Enrollment already forfeited" }, { status: 409 });
    }

    await prisma.trackEnrollment.update({
      where: { userId_trackId: { userId: session.user.id, trackId } },
      data: { status: "DROPPED" },
    });

    logger.info("student:tracks:forfeit", `User ${session.user.id} forfeited track ${trackId}`);

    return NextResponse.json({ success: true, message: "Career path forfeited successfully" });
  } catch (error: any) {
    logger.error("student:tracks:trackId", "DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
