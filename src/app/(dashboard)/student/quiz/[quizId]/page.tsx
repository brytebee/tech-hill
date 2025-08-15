// app/(dashboard)/student/quiz/[quizId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { QuizInterface } from "@/components/students/QuizInterface";
import { shuffleArray } from "@/lib/common/shuffler";

interface PageProps {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ topicId?: string }>;
}

// Fetch quiz data from API
async function getQuizData(quizId: string, topicId?: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = new URL(`/api/student/quiz/${quizId}`, baseUrl);

    if (topicId) {
      url.searchParams.set("topicId", topicId);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Cookie: "", // Session will be handled by getServerSession
      },
      cache: "no-store", // Ensure fresh data
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return null;
  }
}

export default async function QuizPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const { quizId } = await params;
  const { topicId } = await searchParams;

  // For server-side data fetching, we'll use Prisma directly
  // This is more efficient than making an API call to ourselves
  const { prisma } = await import("@/lib/db");

  try {
    // Fetch quiz with all related data
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        isActive: true,
      },
      include: {
        topic: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        questions: {
          where: {
            isActive: true,
          },
          include: {
            options: {
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!quiz) {
      notFound();
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: quiz.topic.module.course.id,
        },
        status: "ACTIVE",
      },
    });

    if (!enrollment) {
      redirect("/student/courses");
    }

    // Get student's previous attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId,
        userId: session.user.id,
        isPractice: false,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        score: true,
        passed: true,
        startedAt: true,
        completedAt: true,
        timeSpent: true,
        questionsCorrect: true,
        questionsTotal: true,
      },
    });

    // Check if student can take the quiz
    const canTakeQuiz = quiz.maxAttempts
      ? attempts.length < quiz.maxAttempts
      : true;
    const hasPassedQuiz = attempts.some((attempt) => attempt.passed);

    if (!canTakeQuiz && !hasPassedQuiz) {
      redirect(`/student/quiz/${quizId}/results`);
    }

    // Get topic progress to check prerequisites
    let topicProgress = null;
    if (topicId) {
      topicProgress = await prisma.topicProgress.findUnique({
        where: {
          userId_topicId: {
            userId: session.user.id,
            topicId,
          },
        },
      });
    }

    // Format questions for frontend (hide correct answers)
    let formattedQuestions = quiz.questions.map((question) => ({
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      points: question.points,
      hint: question.hint,
      timeLimit: question.timeLimit,
      allowPartialCredit: question.allowPartialCredit,
      caseSensitive: question.caseSensitive,
      orderIndex: question.orderIndex,
      required: true, // Assume all questions are required for now
      options:
        question.options?.map((option) => ({
          id: option.id,
          text: option.text,
          orderIndex: option.orderIndex,
          // Don't send isCorrect to frontend
        })) || [],
    }));

    // Shuffle questions if required
    if (quiz.shuffleQuestions) {
      formattedQuestions = shuffleArray(formattedQuestions);
    }

    // // Shuffle options within each question if required
    if (quiz.shuffleOptions) {
      formattedQuestions.forEach((question) => {
        if (question.options.length > 0) {
          question.options = shuffleArray(question.options);
        }
      });
    }

    const quizData = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      allowRetakes: quiz.maxAttempts ? quiz.maxAttempts > 1 : true,
      maxAttempts: quiz.maxAttempts,
      shuffleQuestions: quiz.shuffleQuestions,
      showResults: quiz.showFeedback,
      topic: {
        id: quiz.topic.id,
        title: quiz.topic.title,
        module: {
          id: quiz.topic.module.id,
          title: quiz.topic.module.title,
          course: {
            id: quiz.topic.module.course.id,
            title: quiz.topic.module.course.title,
          },
        },
      },
      questions: formattedQuestions,
    };

    const metadata = {
      totalQuestions: quiz.questions.length,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      attemptNumber: attempts.length + 1,
      attemptsRemaining: quiz.maxAttempts
        ? quiz.maxAttempts - attempts.length
        : null,
      hasPassedQuiz,
    };

    return (
      <StudentLayout>
        <QuizInterface
          quiz={quizData}
          attempts={attempts}
          userId={session.user.id}
          topicId={topicId}
          metadata={metadata}
        />
      </StudentLayout>
    );
  } catch (error) {
    console.error("Error loading quiz:", error);
    notFound();
  }
}
