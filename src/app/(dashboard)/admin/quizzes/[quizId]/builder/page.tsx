// app/(dashboard)/admin/quizzes/[quizId]/builder/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import { QuizBuilder } from "@/components/quiz/quiz-builder";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface QuizBuilderPageProps {
  params: {
    quizId: string;
  };
}

export default async function QuizBuilderPage({ params }: QuizBuilderPageProps) {
  const { quizId } = params;

  // Fetch quiz with existing questions
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
            orderBy: { orderIndex: 'asc' }
          }
        },
        where: {
          isActive: true
        },
        orderBy: { orderIndex: 'asc' }
      }
    },
  });

  if (!quiz) {
    notFound();
  }

  return (
    <AdminLayout
      title={`Quiz Builder: ${quiz.title}`}
      description="Create and manage quiz questions"
      breadcrumbs={[
        { label: "Courses", href: "/admin/courses" },
        { 
          label: quiz.topic.module.course.title, 
          href: `/admin/courses/${quiz.topic.module.course.id}` 
        },
        { 
          label: quiz.topic.module.title, 
          href: `/admin/courses/${quiz.topic.module.course.id}/modules/${quiz.topic.module.id}` 
        },
        { 
          label: quiz.topic.title, 
          href: `/admin/topics/${quiz.topic.id}` 
        },
        { 
          label: quiz.title, 
          href: `/admin/quizzes/${quiz.id}` 
        },
        { label: "Builder" },
      ]}
    >
      <QuizBuilder quiz={quiz} />
    </AdminLayout>
  );
}
