// app/(dashboard)/admin/quizzes/[quizId]/questions/create/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import { QuestionForm } from "@/components/forms/question-form";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface CreateQuestionPageProps {
  params: {
    quizId: string;
  };
}

export default async function CreateQuestionPage({ params }: CreateQuestionPageProps) {
  const { quizId } = params;

  // Fetch quiz details for context
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
      _count: {
        select: {
          questions: true
        }
      }
    },
  });

  if (!quiz) {
    notFound();
  }

  return (
    <AdminLayout
      title="Create Question"
      description={`Add a new question to "${quiz.title}"`}
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
          href: `/admin/quizzes/${quiz.id}/questions` 
        },
        { label: "Create Question" },
      ]}
    >
      <QuestionForm quizId={quizId} quiz={quiz} />
    </AdminLayout>
  );
}
