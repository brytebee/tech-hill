// app/(dashboard)/student/courses/[courseId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { CourseService } from "@/lib/services/courseService";
import { StudentCourseOverview } from "@/components/students/StudentCourseOverview";
import { ProgressService } from "@/lib/services/progressService";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

async function getCourseData(courseId: string, userId: string) {
  try {
    const [course, progressData] = await Promise.all([
      CourseService.getCourseById(courseId),
      ProgressService.getCourseProgressData(userId, courseId),
    ]);

    if (!course) {
      return null;
    }

    // Only allow access to published courses for students
    if (course.status !== "PUBLISHED") {
      return null;
    }

    return {
      course,
      progressData,
    };
  } catch (error) {
    console.error("Error fetching course data:", error);
    return null;
  }
}

export default async function StudentCourseDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId } = await params;
  const data = await getCourseData(courseId, session.user.id);

  if (!data) {
    notFound();
  }

  const { course, progressData } = data;
  const enrollment = course.enrollments.find(
    (enrol) => enrol.userId === session.user.id
  );

  if (!course || !enrollment) {
    redirect("/student");
  }
  // Check if user is enrolled
  if (!enrollment || enrollment.status !== "ACTIVE") {
    redirect(`/student/courses?enroll=${courseId}`);
  }

  // Serialize the course data to handle Decimal and Date objects
  const serializedCourse = {
    ...course,
    createdAt: course.createdAt?.toISOString(),
    updatedAt: course.updatedAt?.toISOString(),
    publishedAt: course.publishedAt?.toISOString(),
  };

  // Serialize the enrollment data
  const serializedEnrollment = {
    ...enrollment,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    completedAt: enrollment.completedAt?.toISOString(),
    lastAccessAt: enrollment.lastAccessAt?.toISOString(),
  };

  return (
    <StudentLayout
      title={serializedCourse.title}
      description={serializedCourse.shortDescription as string}
    >
      <StudentCourseOverview
        course={serializedCourse}
        enrollment={serializedEnrollment}
        userId={session.user.id}
        progressData={progressData}
      />
    </StudentLayout>
  );
}
