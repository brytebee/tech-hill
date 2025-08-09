// app/api/student/courses/[courseId]/next-topic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StudentCourseService } from "@/lib/services/student/courseService";

// GET /api/student/courses/[courseId]/next-topic - Get next available topic
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = params;

    const nextTopic = await StudentCourseService.getNextTopic(
      session.user.id,
      courseId
    );

    return NextResponse.json({ nextTopic });
  } catch (error) {
    console.error(
      "GET /api/student/courses/[courseId]/next-topic error:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
