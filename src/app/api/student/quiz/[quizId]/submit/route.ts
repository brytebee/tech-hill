// app/api/student/quiz/[quizId]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StudentCourseService } from "@/lib/services/student/courseService";
import { z } from "zod";

const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  timeSpent: z.number().optional(),
  topicId: z.string().optional(),
});

// POST /api/student/quiz/[quizId]/submit - Submit quiz attempt
export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = params;
    const body = await request.json();
    const validatedData = submitQuizSchema.parse(body);

    const attempt = await StudentCourseService.submitQuizAttempt({
      userId: session.user.id,
      quizId,
      answers: validatedData.answers,
      timeSpent: validatedData.timeSpent,
      topicId: validatedData.topicId,
    });

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("POST /api/student/quiz/[quizId]/submit error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
