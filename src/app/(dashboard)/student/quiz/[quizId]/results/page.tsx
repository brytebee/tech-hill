// app/(dashboard)/student/quiz/[quizId]/results/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { QuizResults } from "@/components/students/QuizResults";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ attempt?: string; topicId?: string }>;
}

// Mock quiz results data
async function getQuizResultsData(
  quizId: string,
  userId: string,
  attemptId?: string
) {
  try {
    // Fetch quiz attempt data
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        attempts: {
          include: {
            answers: {
              include: {
                question: {
                  select: {
                    id: true,
                    questionText: true,
                    questionType: true,
                    points: true,
                    options: true,
                  },
                },
              },
            },
          },
        },
        topic: {
          include: {
            module: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return null;
    }

    const attempt = quiz.attempts.filter((att) => att.id === attemptId)[0];

    // Process the answers to include correct answer texts
    const processAttempt = {
      ...attempt,
      answers: attempt.answers.map((answer) => {
        const question = answer.question;
        const correctOptions = question.options.filter((opt) => opt.isCorrect);
        const correctAnswerTexts = correctOptions.map((opt) => opt.text);

        return {
          ...answer,
          question: {
            ...question,
            correctAnswers: correctAnswerTexts, // Add correct answer texts
          },
        };
      }),
    };

    return {
      attempt: processAttempt,
      quiz: quiz,
      allAttempts: quiz.attempts,
    };
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return null;
  }
}

export default async function QuizResultsPage({
  params,
  searchParams,
}: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { quizId } = await params;
  const { attempt: attemptParam, topicId } = await searchParams;

  const data = await getQuizResultsData(quizId, session.user.id, attemptParam);

  if (!data) {
    notFound();
  }

  const { attempt, quiz, allAttempts } = data;

  return (
    <StudentLayout>
      <QuizResults
        attempt={attempt}
        quiz={quiz}
        allAttempts={allAttempts}
        userId={session.user.id}
        topicId={topicId}
      />
    </StudentLayout>
  );
}
