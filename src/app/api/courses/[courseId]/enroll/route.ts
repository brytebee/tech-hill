import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EnrollmentService } from "@/lib/services/enrollmentService";
import { CourseService } from "@/lib/services/courseService";
import { AppError } from "@/lib/errors";

// POST /api/courses/[courseId]/enroll - Enroll in a course
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

    // Check if course exists and is published
    const course = await CourseService.getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Course not available for enrollment" },
        { status: 400 }
      );
    }

    const enrollment = await EnrollmentService.createEnrollment({
      userId: session.user.id,
      courseId,
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/courses/[courseId]/enroll error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    if (
      error.message.includes("already enrolled in this course") ||
      error.message.includes("previous enrollment record")
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error.message.includes("currently enrolled in")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[courseId]/enroll - Unenroll from a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    await EnrollmentService.updateEnrollmentStatus(
      session.user.id,
      courseId,
      "DROPPED"
    );

    return NextResponse.json({
      message: "Successfully unenrolled from course",
    });
  } catch (error: any) {
    console.error("DELETE /api/courses/[courseId]/enroll error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
