// app/(dashboard)/student/topics/[topicId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { TopicService } from "@/lib/services/topicService";
import { EnrollmentService } from "@/lib/services/enrollmentService";
import {
  StudentTopicViewer,
  Topic,
  Enrollment,
} from "@/components/students/StudentTopicViewer";
import { ProgressService } from "@/lib/services/progressService";

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
      topic.module.course.id,
    );

    // Allow access if user is enrolled OR if it's a preview topic
    const canAccess =
      !!(enrollment && enrollment.status === "ACTIVE") || !!topic.isPreview;

    if (!canAccess) {
      return null;
    }

    // Only track progress if enrolled
    if (enrollment && enrollment.status === "ACTIVE") {
      await ProgressService.getOrCreateTopicProgress(userId, topicId);
    }

    // Compute next and previous topics
    const courseId = topic.module.course.id;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            topics: {
              orderBy: { orderIndex: "asc" },
              select: { id: true },
            },
          },
        },
      },
    });

    let nextTopicId: string | undefined = undefined;
    let previousTopicId: string | undefined = undefined;
    let isLastTopicOfCourse = false;

    if (course) {
      const flatTopics = course.modules.flatMap((m) => m.topics.map((t) => t.id));
      const currentIndex = flatTopics.indexOf(topic.id);
      if (currentIndex !== -1) {
        if (currentIndex > 0) previousTopicId = flatTopics[currentIndex - 1];
        if (currentIndex < flatTopics.length - 1) {
          nextTopicId = flatTopics[currentIndex + 1];
        } else {
          isLastTopicOfCourse = true;
        }
      }
    }

    return {
      topic,
      enrollment,
      canAccess: true,
      nextTopicId,
      previousTopicId,
      isLastTopicOfCourse,
    };
  } catch (error: any) {
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
  return (
    <StudentLayout
      title={data.topic.title}
      description={`${data.topic.description}`}
    >
      <StudentTopicViewer
        topic={data.topic as unknown as Topic}
        enrollment={data.enrollment as unknown as Enrollment}
        userId={session.user.id}
        nextTopicId={data.nextTopicId}
        previousTopicId={data.previousTopicId}
        isLastTopicOfCourse={data.isLastTopicOfCourse}
      />
    </StudentLayout>
  );
}
