// app/api/student/tracks/route.ts
// Public-to-students endpoint for listing published tracks.
// Separate from /api/admin/tracks which requires ADMIN role.
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tracks = await prisma.track.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        thumbnail: true,
        price: true,
        isPublished: true,
        createdAt: true,
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
          include: {
            course: {
              select: {
                id: true,
                title: true,
                duration: true,
                difficulty: true,
                thumbnail: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            courses: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Attach enrollment status for this student
    const trackIds = tracks.map((t: any) => t.id);
    const studentEnrollments = await prisma.trackEnrollment.findMany({
      where: {
        userId: session.user.id,
        trackId: { in: trackIds },
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
      select: { id: true, trackId: true, status: true, completedCourses: true },
    });
    const enrollmentMap = new Map(
      studentEnrollments.map((e: any) => [
        e.trackId,
        { status: e.status, id: e.id, completedCoursesCount: e.completedCourses.length },
      ])
    );

    const enriched = tracks.map((track: any) => ({
      ...track,
      enrollmentStatus:      enrollmentMap.get(track.id)?.status            ?? null,
      trackEnrollmentId:     enrollmentMap.get(track.id)?.id                ?? null,
      completedCoursesCount: enrollmentMap.get(track.id)?.completedCoursesCount ?? 0,
    }));

    // Fetch subscription, all-access plans, and active enrollments concurrently to avoid waterfall
    const [activeSubscription, allAccessPlans, activeCourse, activeTrack] = await Promise.all([
      prisma.subscription.findFirst({
        where: {
          userId: session.user.id,
          status: "ACTIVE",
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } },
          ],
        },
        select: { id: true },
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
        where: { userId: session.user.id, status: "ACTIVE" },
        select: { track: { select: { title: true } } },
      }),
    ]);

    let activeJourneyMessage: string | null = null;
    if (activeCourse) {
      activeJourneyMessage = `Focus Check: You are currently active in the course "${activeCourse.course.title}". To commit to a Career Path, you must either complete it or forfeit/drop it from your dashboard.`;
    } else if (activeTrack) {
      activeJourneyMessage = `Focus Check: You are already committed to the "${activeTrack.track.title}" Career Path. You must either complete it or forfeit your progress by dropping it before starting a new one.`;
    }

    return NextResponse.json({
      tracks: enriched,
      hasSubscription: !!activeSubscription,
      allAccessPlans,
      activeJourneyMessage,
    });
  } catch (error: any) {
    logger.error("student:tracks", "GET /api/student/tracks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
