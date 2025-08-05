// app/api/courses/[courseId]/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CourseService } from "@/lib/services/courseService";

// POST /api/courses/[courseId]/publish - Publish a course
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to publish courses (ADMIN or MANAGER)
    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions to publish courses" },
        { status: 403 }
      );
    }

    const { courseId } = await params;

    // Check if course exists
    const course = await CourseService.getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user owns the course (unless they're an admin)
    if (session.user.role !== "ADMIN" && course.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only publish your own courses" },
        { status: 403 }
      );
    }

    // Validate course can be published (has modules and topics)
    if (!course.modules || course.modules.length === 0) {
      return NextResponse.json(
        { error: "Course must have at least one module to be published" },
        { status: 400 }
      );
    }

    // Check if all modules have topics
    const modulesWithoutTopics = course.modules.filter(
      (module) => !module.topics || module.topics.length === 0
    );

    if (modulesWithoutTopics.length > 0) {
      return NextResponse.json(
        { error: "All modules must have at least one topic to publish the course" },
        { status: 400 }
      );
    }

    // Check if course is already published
    if (course.status === "PUBLISHED") {
      return NextResponse.json(
        { error: "Course is already published" },
        { status: 400 }
      );
    }

    // Update course status to published
    const updatedCourse = await CourseService.updateCourse(courseId, {
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    return NextResponse.json({
      message: "Course published successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("POST /api/courses/[courseId]/publish error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[courseId]/publish - Unpublish a course (set to draft)
export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to unpublish courses (ADMIN or MANAGER)
    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions to unpublish courses" },
        { status: 403 }
      );
    }

    const { courseId } = await params;

    // Check if course exists
    const course = await CourseService.getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user owns the course (unless they're an admin)
    if (session.user.role !== "ADMIN" && course.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only unpublish your own courses" },
        { status: 403 }
      );
    }

    // Check if course is published
    if (course.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Course is not currently published" },
        { status: 400 }
      );
    }

    // Update course status to draft
    const updatedCourse = await CourseService.updateCourse(courseId, {
      status: "DRAFT",
    });

    return NextResponse.json({
      message: "Course unpublished successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("PUT /api/courses/[courseId]/publish error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}