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
      select: { trackId: true, status: true },
    });
    const enrollmentMap = new Map(
      studentEnrollments.map((e: any) => [e.trackId, e.status])
    );

    const enriched = tracks.map((track: any) => ({
      ...track,
      enrollmentStatus: enrollmentMap.get(track.id) ?? null,
    }));

    // Add subscription status to let the client skip any payment UI
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      select: { id: true },
    });

    return NextResponse.json({ tracks: enriched, hasSubscription: !!activeSubscription });
  } catch (error: any) {
    logger.error("student:tracks", "GET /api/student/tracks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
