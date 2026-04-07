import { AdminLayout } from "@/components/layout/AdminLayout";
import { CourseImportTool } from "@/components/admin/courses/CourseImportTool";

export default function AdminCourseImportPage() {
  return (
    <AdminLayout
      title="Import Course"
      description="Create a course with modules, topics, and quizzes from a CSV file."
    >
      <div className="max-w-4xl mx-auto py-8">
        <CourseImportTool />
      </div>
    </AdminLayout>
  );
}
