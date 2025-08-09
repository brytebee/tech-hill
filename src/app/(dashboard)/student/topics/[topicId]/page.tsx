// app/(dashboard)/student/topics/[topicId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { TopicService } from "@/lib/services/topicService";
import { EnrollmentService } from "@/lib/services/enrollmentService";
import { StudentTopicViewer } from "@/components/students/StudentTopicViewer";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

async function getTopicData(topicId: string, userId: string) {
  try {
    const topic = await TopicService.getTopicById(topicId);

    if (!topic) {
      return null;
    }

    // Check if user is enrolled in the course
    const enrollment = await EnrollmentService.getEnrollment(
      userId,
      topic.module.course.id
    );

    if (!enrollment || enrollment.status !== "ACTIVE") {
      return null;
    }

    // Check if topic is accessible (prerequisites met)
    // In real app, this would check TopicProgress for prerequisite completion
    const canAccess = true; // Simplified for now

    return {
      topic,
      enrollment,
      canAccess,
    };
  } catch (error) {
    console.error("Error fetching topic data:", error);
    return null;
  }
}

export default async function StudentTopicDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { topicId } = await params;
  const data = await getTopicData(topicId, session.user.id);

  if (!data || !data.canAccess) {
    notFound();
  }

  const { topic, enrollment } = data;

  return (
    <StudentLayout title={topic.title} description={`${topic.description}`}>
      <StudentTopicViewer
        topic={topic}
        enrollment={enrollment}
        userId={session.user.id}
      />
    </StudentLayout>
  );
}
