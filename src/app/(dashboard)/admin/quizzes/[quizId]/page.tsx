// app/(dashboard)/admin/quizzes/[quizId]/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import { QuizOverview } from "@/components/quiz/quiz-overview";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface QuizPageProps {
  params: {
    quizId: string;
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId } = await params;

  // Fetch quiz with all related data
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
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
        include: {
          options: {
            orderBy: { orderIndex: "asc" },
          },
          _count: {
            select: {
              answers: true,
            },
          },
        },
        where: {
          isActive: true,
        },
        orderBy: { orderIndex: "asc" },
      },
      attempts: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10, // Recent attempts
      },
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  const serializeQuiz = {
    ...quiz,
    topic: {
      module: { course: { price: Number(quiz.topic.module.course.price) } },
    },
  };

  return (
    <AdminLayout
      title={quiz.title}
      description={quiz.description || "Quiz details and management"}
      // breadcrumbs={[
      //   { label: "Courses", href: "/admin/courses" },
      //   {
      //     label: quiz.topic.module.course.title,
      //     href: `/admin/courses/${quiz.topic.module.course.id}`,
      //   },
      //   {
      //     label: quiz.topic.module.title,
      //     href: `/admin/courses/${quiz.topic.module.course.id}/modules/${quiz.topic.module.id}`,
      //   },
      //   {
      //     label: quiz.topic.title,
      //     href: `/admin/topics/${quiz.topic.id}`,
      //   },
      //   { label: quiz.title },
      // ]}
    >
      <QuizOverview quiz={serializeQuiz} />
    </AdminLayout>
  );
}
