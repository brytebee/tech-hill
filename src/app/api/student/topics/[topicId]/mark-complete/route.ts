// app/api/student/topics/[topicId]/mark-complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StudentCourseService } from "@/lib/services/student/courseService";

// POST /api/student/topics/[topicId]/mark-complete - Mark topic complete
export async function POST(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topicId } = params;

    const complete = await StudentCourseService.completeTopic(
      session.user.id,
      topicId
    );

    return NextResponse.json({ complete });
  } catch (error) {
    console.error(
      "POST /api/student/topics/[topicId]/mark-complete error:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
