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

    const [track, enrollment] = await Promise.all([
      prisma.track.findUnique({
        where: { id: trackId, isPublished: true },
        include: {
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
          completedCourses: true,
          currentCourseId: true,
          status: true,
        },
      }),
    ]);

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    return NextResponse.json({ ...track, enrollment });
  } catch (error: any) {
    logger.error("student:tracks:trackId", "GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
