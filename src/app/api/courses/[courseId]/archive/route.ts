// app/api/courses/[courseId]/archive/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CourseService } from "@/lib/services/courseService";

// POST /api/courses/[courseId]/archive - Archive a course
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to archive courses (ADMIN or MANAGER)
    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions to archive courses" },
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
        { error: "You can only archive your own courses" },
        { status: 403 }
      );
    }

    // Check if course is already archived
    if (course.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "Course is already archived" },
        { status: 400 }
      );
    }

    // Update course status to archived
    const updatedCourse = await CourseService.updateCourse(courseId, {
      status: "ARCHIVED",
    });

    return NextResponse.json({
      message: "Course archived successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("POST /api/courses/[courseId]/archive error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[courseId]/archive - Unarchive a course (restore to previous status)
export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to unarchive courses (ADMIN or MANAGER)
    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions to unarchive courses" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const body = await request.json();
    const { restoreStatus } = body; // Expected: "DRAFT" or "PUBLISHED"

    // Validate restore status
    if (!restoreStatus || !["DRAFT", "PUBLISHED"].includes(restoreStatus)) {
      return NextResponse.json(
        { error: "Invalid restore status. Must be 'DRAFT' or 'PUBLISHED'" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await CourseService.getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user owns the course (unless they're an admin)
    if (session.user.role !== "ADMIN" && course.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only unarchive your own courses" },
        { status: 403 }
      );
    }

    // Check if course is archived
    if (course.status !== "ARCHIVED") {
      return NextResponse.json(
        { error: "Course is not currently archived" },
        { status: 400 }
      );
    }

    // If restoring to PUBLISHED, validate course requirements
    if (restoreStatus === "PUBLISHED") {
      if (!course.modules || course.modules.length === 0) {
        return NextResponse.json(
          { error: "Course must have at least one module to be published" },
          { status: 400 }
        );
      }

      const modulesWithoutTopics = course.modules.filter(
        (module) => !module.topics || module.topics.length === 0
      );

      if (modulesWithoutTopics.length > 0) {
        return NextResponse.json(
          { error: "All modules must have at least one topic to publish the course" },
          { status: 400 }
        );
      }
    }

    // Update course status
    const updateData: any = { status: restoreStatus };
    if (restoreStatus === "PUBLISHED" && !course.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedCourse = await CourseService.updateCourse(courseId, updateData);

    return NextResponse.json({
      message: `Course unarchived and restored to ${restoreStatus.toLowerCase()} successfully`,
      course: updatedCourse,
    });
  } catch (error) {
    console.error("PUT /api/courses/[courseId]/archive error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[courseId]/archive - Permanently delete an archived course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can permanently delete courses
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can permanently delete courses" },
        { status: 403 }
      );
    }

    const { courseId } = await params;

    // Check if course exists
    const course = await CourseService.getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if course is archived (safety check)
    if (course.status !== "ARCHIVED") {
      return NextResponse.json(
        { error: "Only archived courses can be permanently deleted" },
        { status: 400 }
      );
    }

    // Check if course has active enrollments
    if (course.enrollments && course.enrollments.length > 0) {
      const activeEnrollments = course.enrollments.filter(
        (enrollment) => enrollment.status === "ACTIVE"
      );

      if (activeEnrollments.length > 0) {
        return NextResponse.json(
          { error: "Cannot delete course with active enrollments" },
          { status: 400 }
        );
      }
    }

    // Delete the course (this will cascade delete modules, topics, etc.)
    // TODO: Ensure this service is available
    await CourseService.deleteCourse(courseId);

    return NextResponse.json({
      message: "Course permanently deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/courses/[courseId]/archive error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}