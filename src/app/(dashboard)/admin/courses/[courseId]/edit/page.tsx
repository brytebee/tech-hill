// app/(dashboard)/admin/courses/[courseId]/edit/page.tsx
import { notFound } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { CourseForm } from '@/components/forms/course-form'
import { CourseService } from '@/lib/services/courseService'

async function getCourse(courseId: string) {
  try {
    const course = await CourseService.getCourseById(courseId)
    return course
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

interface EditCoursePageProps {
  params: {
    courseId: string
  }
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseId } = await params
  const course = await getCourse(courseId)


  if (!course) {
    notFound()
  }

  return (
    <AdminLayout 
      title="Edit Course"
      description="Update course information and settings"
    >
      <CourseForm course={course} isEdit={true} />
    </AdminLayout>
  )
}
