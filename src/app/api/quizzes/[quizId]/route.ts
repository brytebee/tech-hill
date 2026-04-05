import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";

const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  timeLimit: z.number().min(1).optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  showFeedback: z.boolean().optional(),
  allowReview: z.boolean().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  maxAttempts: z.number().min(1).optional(),
  adaptiveDifficulty: z.boolean().optional(),
  requireMastery: z.boolean().optional(),
  practiceMode: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/quizzes/[quizId] - Get quiz details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        topic: true,
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error: any) {
    logger.error("quizzes:quizId", "GET /api/quizzes/[quizId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/quizzes/[quizId] - Update quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and managers can update quizzes
    if (session.user.role === "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { quizId } = await params;
    const body = await request.json();
    const validatedData = updateQuizSchema.parse(body);

    // Verify quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: validatedData,
    });

    return NextResponse.json(updatedQuiz);
  } catch (error: any) {
    logger.error("quizzes:quizId", "PUT /api/quizzes/[quizId] error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[quizId] - Delete quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and managers can delete quizzes
    if (session.user.role === "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { quizId } = await params;

    // Verify quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error: any) {
    logger.error("quizzes:quizId", "DELETE /api/quizzes/[quizId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
