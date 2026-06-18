// app/(dashboard)/student/courses/[courseId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { CourseService } from "@/lib/services/courseService";
import {
  StudentCourseOverview,
  Course,
  Enrollment,
} from "@/components/students/StudentCourseOverview";
import { CourseDetailsView } from "@/components/courses/course-details-view";
import { ProgressService } from "@/lib/services/progressService";
import { PromotionService } from "@/lib/services/promotionService";

interface PageProps {
  params: Promise<{ courseId: string }>;
  searchParams?: Promise<{ trackId?: string }>;
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
  } catch (error: any) {
    console.error("Error fetching course data:", error);
    return null;
  }
}

export default async function StudentCourseDetailsPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId } = await params;
  const resolvedSearch = await searchParams;
  const trackId = resolvedSearch?.trackId;
  // Parallelize independent queries to avoid database waterfalls and optimize page speed
  const [data, subscription, pricing, activeCourse, activeTrack] = await Promise.all([
    getCourseData(courseId, session.user.id),
    prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        OR: [
          { endDate: null },
          { endDate: { gt: new Date() } },
        ],
      },
      select: { id: true },
    }),
    PromotionService.getCurrentPrice(courseId),
    prisma.enrollment.findFirst({
      where: { userId: session.user.id, status: "ACTIVE", NOT: { courseId } },
      select: { course: { select: { title: true } } },
    }),
    prisma.trackEnrollment.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: { track: { select: { title: true } } },
    }),
  ]);

  if (!data) {
    notFound();
  }

  const { course, progressData } = data;
  const enrollment = course.enrollments?.find(
    (enrol: any) => enrol.userId === session.user.id,
  );

  const hasSubscription = !!subscription;

  let activeJourneyMessage: string | null = null;
  if (activeCourse) {
    activeJourneyMessage = `Focus Check: You are currently active in the course "${activeCourse.course.title}". To commit fully, you must either complete it or forfeit/drop it from your dashboard before starting a new journey.`;
  } else if (activeTrack) {
    activeJourneyMessage = `Focus Check: You are currently committed to the "${activeTrack.track.title}" Career Path. You must either complete it or forfeit your progress by dropping it before starting this course.`;
  }

  // Serialize the course data
  const serializedCourse = {
    ...course,
    createdAt: course.createdAt?.toISOString(),
    updatedAt: course.updatedAt?.toISOString(),
    publishedAt: course.publishedAt?.toISOString(),
    price: pricing.currentPrice, // Updated to use current price
    originalPrice: Number(course.price),
    activeFlashSale: pricing.activeFlashSale,
    certificatePrice: course.certificatePrice
      ? Number(course.certificatePrice)
      : null,
  };

  // Resolve track-level topic filter if student arrived from a track
  let includedTopicIds: string[] = [];
  if (trackId) {
    const trackCourse = await prisma.trackCourse.findFirst({
      where: { trackId, courseId },
      select: { includedTopicIds: true },
    });
    includedTopicIds = trackCourse?.includedTopicIds ?? [];
  }

  // If user is enrolled and active or completed, show the interactive overview
  if (enrollment && (enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED")) {
    const serializedEnrollment = {
      ...enrollment,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      completedAt: enrollment.completedAt?.toISOString(),
      lastAccessAt: enrollment.lastAccessAt?.toISOString(),
    } as unknown as Enrollment;

    return (
      <StudentLayout
        title={serializedCourse.title}
        description={serializedCourse.shortDescription as string}
      >
        <StudentCourseOverview
          course={serializedCourse as unknown as Course}
          enrollment={serializedEnrollment}
          userId={session.user.id}
          progressData={progressData}
          includedTopicIds={includedTopicIds}
        />
      </StudentLayout>
    );
  }

  // Otherwise, show the public details view with an enroll button.
  // Subscribed users get hasSubscription=true so the EnrollButton skips the checkout modal;
  // the backend EnrollmentService enforces Focus Check and all other business rules.
  return (
    <StudentLayout
      title={serializedCourse.title}
      description={serializedCourse.shortDescription as string}
    >
      <CourseDetailsView
        course={serializedCourse}
        currentUser={{
          id: session.user.id,
          role: session.user.role as any,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
        }}
        userEnrollment={
          enrollment
            ? {
                ...enrollment,
                enrolledAt: enrollment.enrolledAt.toISOString(),
                overallProgress: enrollment.overallProgress,
                completedAt: enrollment.completedAt?.toISOString(),
              }
            : null
        }
        hasSubscription={hasSubscription}
        activeJourneyMessage={activeJourneyMessage}
        basePath="/student"
      />
    </StudentLayout>
  );
}
