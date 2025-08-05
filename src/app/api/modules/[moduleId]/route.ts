// app/api/modules/[moduleId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ModuleService } from "@/lib/services/moduleService";

// GET /api/modules/[moduleId] - Get module by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moduleId } = await params;
    const module = await ModuleService.getModuleById(moduleId);

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error("GET /api/modules/[moduleId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/modules/[moduleId] - Update module
export async function PUT(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { moduleId } = await params;
    const body = await request.json();

    // Check if module exists and user has access
    const existingModule = await ModuleService.getModuleById(moduleId);
    if (!existingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && existingModule.course.creator.id !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit modules for your own courses" },
        { status: 403 }
      );
    }

    const module = await ModuleService.updateModule(moduleId, body);

    return NextResponse.json(module);
  } catch (error) {
    console.error("PUT /api/modules/[moduleId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[moduleId] - Delete module
export async function DELETE(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { moduleId } = await params;

    // Check if module exists and user has access
    const existingModule = await ModuleService.getModuleById(moduleId);
    if (!existingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && existingModule.course.creator.id !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete modules for your own courses" },
        { status: 403 }
      );
    }

    // Check if other modules depend on this one
    if (existingModule.dependentModules.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete module that is a prerequisite for other modules" },
        { status: 400 }
      );
    }

    await ModuleService.deleteModule(moduleId);

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/modules/[moduleId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
