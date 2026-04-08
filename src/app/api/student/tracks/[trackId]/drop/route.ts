import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackId } = await params;
    const userId = session.user.id;

    // Verify the track enrollment belongs to this user and is currently ACTIVE
    const enrollment = await prisma.trackEnrollment.findUnique({
      where: { userId_trackId: { userId, trackId } },
      select: { id: true, userId: true, status: true, track: { select: { title: true } } },
    } as any) as { id: string; userId: string; status: string; track: { title: string } } | null;

    if (!enrollment) {
      return NextResponse.json({ error: "Track enrollment not found." }, { status: 404 });
    }

    if (enrollment.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Cannot drop a career path with status "${enrollment.status}".` },
        { status: 409 }
      );
    }

    // Drop it — reset progress so a future re-enroll starts clean
    await (prisma.trackEnrollment as any).update({
      where: { id: enrollment.id },
      data: {
        status: "DROPPED",
        completedCourses: [],
        currentCourseId: null,
        completedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `You have forfeited your progress in the "${enrollment.track.title}" Career Path. You may now start a new course or career path.`,
    });
  } catch (error) {
    console.error("[DROP_TRACK]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
