// app/(dashboard)/manager/courses/create/page.tsx
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import { CourseForm } from "@/components/forms/course-form";

export default function CreateCoursePage() {
  return (
    <ManagerLayout
      title="Create Course"
      description="Add a new course to the platform"
    >
      <CourseForm />
    </ManagerLayout>
  );
}
