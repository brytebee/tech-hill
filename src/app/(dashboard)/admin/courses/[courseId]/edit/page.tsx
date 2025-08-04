// app/(dashboard)/admin/courses/[courseId]/edit/page.tsx
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CourseForm } from "@/components/forms/course-form";
import { CourseService } from "@/lib/services/courseService";

async function getCourse(courseId: string) {
  try {
    const course = await CourseService.getCourseById(courseId);
    if (!course) return null;

    // Convert Decimal to number for client component compatibility
    return {
      ...course,
      price: course.price ? Number(course.price) : 0,
    };
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}

interface EditCoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  // Await the params before using them
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

  return (
    <AdminLayout
      title="Edit Course"
      description="Update course information and settings"
    >
      <CourseForm course={course} isEdit={true} />
    </AdminLayout>
  );
}
