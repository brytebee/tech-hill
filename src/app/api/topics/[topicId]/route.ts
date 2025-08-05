// app/api/topics/[topicId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TopicService } from "@/lib/services/topicService";

// GET /api/topics/[topicId] - Get topic by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topicId } = await params;
    const topic = await TopicService.getTopicById(topicId);

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error("GET /api/topics/[topicId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/topics/[topicId] - Update topic
export async function PUT(
  request: NextRequest,
  { params }: { params: { topicId: string } }
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

    const { topicId } = await params;
    const body = await request.json();

    // Check if topic exists and user has access
    const existingTopic = await TopicService.getTopicById(topicId);
    if (!existingTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && existingTopic.module.course.creator.id !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit topics for your own courses" },
        { status: 403 }
      );
    }

    const topic = await TopicService.updateTopic(topicId, body);

    return NextResponse.json(topic);
  } catch (error) {
    console.error("PUT /api/topics/[topicId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/topics/[topicId] - Delete topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: { topicId: string } }
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

    const { topicId } = await params;

    // Check if topic exists and user has access
    const existingTopic = await TopicService.getTopicById(topicId);
    if (!existingTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && existingTopic.module.course.creator.id !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete topics for your own courses" },
        { status: 403 }
      );
    }

    // Check if other topics depend on this one
    if (existingTopic.dependentTopics.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete topic that is a prerequisite for other topics" },
        { status: 400 }
      );
    }

    await TopicService.deleteTopic(topicId);

    return NextResponse.json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/topics/[topicId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
