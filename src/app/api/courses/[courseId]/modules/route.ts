// app/api/courses/[courseId]/modules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ModuleService } from "@/lib/services/moduleService";
import { CourseService } from "@/lib/services/courseService";
import { logger } from "@/lib/logger";

// GET /api/courses/[courseId]/modules - Get all modules for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const modules = await ModuleService.getModulesByCourse(courseId);

    return NextResponse.json({ modules });
  } catch (error: any) {
    logger.error("courses:courseId:modules", "GET /api/courses/[courseId]/modules error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[courseId]/modules - Create a new module
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
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
    const sortedModules = existingModules.sort((a: any, b: any) => a.order - b.order);
    const nextOrder = sortedModules.length > 0
      ? sortedModules[sortedModules.length - 1].order + 1
      : 1;

    // Auto-enforce sequential locking: unless the caller explicitly passes
    // prerequisiteModuleId: null to opt out, new modules always require
    // the completion of the immediately preceding module first.
    const lastModule = sortedModules.length > 0 ? sortedModules[sortedModules.length - 1] : null;
    const autoPrerequisiteId =
      lastModule && !Object.prototype.hasOwnProperty.call(body, "prerequisiteModuleId")
        ? lastModule.id
        : body.prerequisiteModuleId ?? null;

    const moduleData = {
      ...body,
      courseId,
      order: nextOrder,
      prerequisiteModuleId: autoPrerequisiteId,
    };

    const module = await ModuleService.createModule(moduleData);

    return NextResponse.json(module, { status: 201 });
  } catch (error: any) {
    logger.error("courses:courseId:modules", "POST /api/courses/[courseId]/modules error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
