// app/api/modules/[moduleId]/topics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TopicService } from "@/lib/services/topicService";
import { ModuleService } from "@/lib/services/moduleService";

// GET /api/modules/[moduleId]/topics - Get all topics for a module
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
    const topics = await TopicService.getTopicsByModule(moduleId);

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("GET /api/modules/[moduleId]/topics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/modules/[moduleId]/topics - Create a new topic
export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
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

    const { moduleId } = await params;
    const body = await request.json();

    // Validate module exists and user has access
    const module = await ModuleService.getModuleById(moduleId);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && module.course.creator.id !== session.user.id) {
      return NextResponse.json(
        { error: "You can only create topics for your own courses" },
        { status: 403 }
      );
    }

    // Get next order index
    const existingTopics = await TopicService.getTopicsByModule(moduleId);
    const nextOrderIndex = Math.max(...existingTopics.map(t => t.orderIndex), 0) + 1;

    // Generate slug from title if not provided
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const topicData = {
      ...body,
      moduleId,
      slug,
      orderIndex: nextOrderIndex,
      topicType: body.topicType || 'LESSON',
    };

    const topic = await TopicService.createTopic(topicData);

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error("POST /api/modules/[moduleId]/topics error:", error);
    
    // Handle unique constraint violation for slug
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return NextResponse.json(
        { error: "A topic with this slug already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
