import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { quizId } = await params;
    const body = await req.json();
    const { attemptId, answers } = body;

    if (!attemptId || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify attempt ownership and existence
    const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
    });

    if (!attempt || attempt.userId !== session.user.id || attempt.quizId !== quizId) {
        return NextResponse.json(
            { error: "Attempt not found or unauthorized" },
            { status: 404 }
        );
    }

    // Only save draft if attempt is not completed
    if (attempt.completedAt) {
      return NextResponse.json(
        { error: "Attempt already completed" },
        { status: 400 }
      );
    }

    await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
            draftAnswers: answers,
        }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving draft answers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
