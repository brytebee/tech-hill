// app/(dashboard)/admin/topics/[topicId]/quizzes/create/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import { QuizForm } from "@/components/forms/quiz-form";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface CreateQuizPageProps {
  params: {
    topicId: string;
  };
}

export default async function CreateQuizPage({ params }: CreateQuizPageProps) {
  const { topicId } = await params;

  // Fetch topic details for context
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!topic) {
    notFound();
  }

  const serializeTopic = {
    ...topic,
    module: { course: { price: Number(topic.module.course.price) } },
  };

  return (
    <AdminLayout
      title="Create Quiz"
      description={`Add a new quiz to ${topic.title}`}
      breadcrumbs={[
        { label: "Courses", href: "/admin/courses" },
        {
          label: topic.module.course.title,
          href: `/admin/courses/${topic.module.course.id}`,
        },
        {
          label: topic.module.title,
          href: `/admin/courses/${topic.module.course.id}/modules/${topic.module.id}`,
        },
        {
          label: topic.title,
          href: `/admin/topics/${topic.id}`,
        },
        { label: "Create Quiz" },
      ]}
    >
      <QuizForm topicId={topicId} topic={serializeTopic} />
    </AdminLayout>
  );
}
