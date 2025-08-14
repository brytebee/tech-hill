// app/(dashboard)/admin/quizzes/[quizId]/questions/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import { QuestionForm } from "@/components/forms/question-form";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

interface CreateQuestionPageProps {
  params: {
    quizId: string;
  };
}

export default async function CreateQuestionPage({
  params,
}: CreateQuestionPageProps) {
  const { quizId } = await params;

  // Fetch all questions for a quiz
  const questions = await prisma.question.findMany({
    where: { quizId },
    include: {
      quiz: {
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
        },
      },
      // _count: {
      //   select: {
      //     questions: true
      //   }
      // }
    },
  });

  if (!questions) {
    notFound();
  }

  if (questions.length === 0) {
    redirect(`/admin/quizzes${quizId}/builder`);
  }

  return (
    <AdminLayout
      title={`${questions[0].quiz.title} Questions`}
      description={`All questions for "${questions[0].quiz.title}" quiz`}
      // breadcrumbs={[
      //   { label: "Courses", href: "/admin/courses" },
      //   {
      //     label: quiz.topic.module.course.title,
      //     href: `/admin/courses/${quiz.topic.module.course.id}`
      //   },
      //   {
      //     label: quiz.topic.module.title,
      //     href: `/admin/courses/${quiz.topic.module.course.id}/modules/${quiz.topic.module.id}`
      //   },
      //   {
      //     label: quiz.topic.title,
      //     href: `/admin/topics/${quiz.topic.id}`
      //   },
      //   {
      //     label: quiz.title,
      //     href: `/admin/quizzes/${quiz.id}/questions`
      //   },
      //   { label: "Create Question" },
      // ]}
    >
      <p>Hi there!</p>
      {/* TODO: Convert the QuestionForm below to a question list */}
      {/* <QuestionForm quizId={quizId} quiz={quiz} /> */}
    </AdminLayout>
  );
}
