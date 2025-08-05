// app/api/courses/[courseId]/modules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ModuleService } from "@/lib/services/moduleService";
import { CourseService } from "@/lib/services/courseService";

// GET /api/courses/[courseId]/modules - Get all modules for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const modules = await ModuleService.getModulesByCourse(courseId);

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("GET /api/courses/[courseId]/modules error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[courseId]/modules - Create a new module
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const body = await request.json();

    // Validate course exists and user has access
    const course = await CourseService.getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && course.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only create modules for your own courses" },
        { status: 403 }
      );
    }

    // Get next order number
    const existingModules = await ModuleService.getModulesByCourse(courseId);
    const nextOrder = Math.max(...existingModules.map(m => m.order), 0) + 1;

    const moduleData = {
      ...body,
      courseId,
      order: nextOrder,
    };

    const module = await ModuleService.createModule(moduleData);

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses/[courseId]/modules error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
