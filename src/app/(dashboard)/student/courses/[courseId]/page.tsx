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
  const enrollment = course.enrollments?.find(
    (enrol: any) => enrol.userId === session.user.id,
  );

  // Check if the user has an active subscription (used to bypass checkout modal)
  const hasSubscription = !!(await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      OR: [
        { endDate: null },
        { endDate: { gt: new Date() } },
      ],
    },
  }));

  // Fetch dynamic pricing (sales/discounts)
  const pricing = await PromotionService.getCurrentPrice(courseId);

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
        basePath="/student"
      />
    </StudentLayout>
  );
}
