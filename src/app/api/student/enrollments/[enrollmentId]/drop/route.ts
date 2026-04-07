import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { enrollmentId } = await params;

    // Verify the enrollment belongs to this user and is currently ACTIVE
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { id: true, userId: true, status: true, course: { select: { title: true } } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found." }, { status: 404 });
    }

    if (enrollment.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (enrollment.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Cannot drop an enrollment with status "${enrollment.status}".` },
        { status: 409 }
      );
    }

    // Drop it: forfeits all in-progress topic/module progress tied to this enrollment
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: "DROPPED" },
    });

    return NextResponse.json({
      success: true,
      message: `You have forfeited your progress in "${enrollment.course.title}". You may now start a new course or career path.`,
    });
  } catch (error) {
    console.error("[DROP_ENROLLMENT]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
