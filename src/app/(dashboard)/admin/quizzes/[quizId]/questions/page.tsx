// app/(dashboard)/admin/quizzes/[quizId]/questions/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import { QuestionList } from "@/components/questions/question-list";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

interface QuestionsPageProps {
  params: {
    quizId: string;
  };
}

export default async function QuestionsPage({ params }: QuestionsPageProps) {
  const { quizId } = await params;

  // Fetch quiz with questions and all related data
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
          // Don't filter by isActive here - admin should see all questions
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

  // If no questions exist, redirect to question builder/creator
  if (quiz.questions.length === 0) {
    redirect(`/admin/quizzes/${quizId}/builder`);
  }

  // Format questions to match the component interface
  const formattedQuestions = quiz.questions.map((question) => ({
    ...question,
    quiz: {
      id: quiz.id,
      title: quiz.title,
      topic: quiz.topic,
    },
  }));

  return (
    <AdminLayout
      title={`${quiz.title} Questions`}
      description={`Manage questions for "${quiz.title}" quiz`}
    >
      <QuestionList questions={formattedQuestions} quizId={quizId} />
    </AdminLayout>
  );
}
