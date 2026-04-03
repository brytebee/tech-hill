import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { CourseService } from "@/lib/services/courseService";
import { PromotionService } from "@/lib/services/promotionService";
import { CourseDetailsView } from "@/components/courses/course-details-view";
import { PublicHeader } from "@/components/layout/PublicHeader";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function PublicCoursePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const { courseId } = await params;

  const course = await CourseService.getCourseById(courseId);

  if (!course || course.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch dynamic pricing (sales/discounts)
  const pricing = await PromotionService.getCurrentPrice(courseId);

  // Serialize the course data
  const serializedCourse = {
    ...course,
    createdAt: course.createdAt?.toISOString(),
    updatedAt: course.updatedAt?.toISOString(),
    publishedAt: course.publishedAt?.toISOString(),
    price: pricing.currentPrice,
    originalPrice: Number(course.price),
    activeFlashSale: pricing.activeFlashSale,
    certificatePrice: course.certificatePrice ? Number(course.certificatePrice) : 2000,
  };

  const enrollment = session ? course.enrollments?.find(
    (enrol: any) => enrol.userId === session.user.id,
  ) : null;

  return (
    <div className="dark min-h-screen bg-[#080e1a] text-white selection:bg-blue-500/30 antialiased">
      <PublicHeader />
      
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <CourseDetailsView
          course={serializedCourse}
          currentUser={session ? {
            id: session.user.id,
            role: session.user.role as any,
            firstName: session.user.firstName,
            lastName: session.user.lastName,
          } : undefined}
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
          basePath="/student"
        />
      </main>

      <footer className="border-t border-slate-800/80 py-12 bg-slate-950/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Tech Hill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
