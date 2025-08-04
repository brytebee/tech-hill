// app/(dashboard)/admin/courses/create/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CourseForm } from "@/components/forms/course-form";

export default function CreateCoursePage() {
  return (
    <AdminLayout
      title="Create Course"
      description="Add a new course to the platform"
    >
      <CourseForm />
    </AdminLayout>
  );
}
