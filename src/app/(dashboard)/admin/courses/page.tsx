// app/(dashboard)/admin/courses/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, MoreHorizontal, Eye } from 'lucide-react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface Course {
  id: string
  title: string
  description: string
  status: string
  difficulty: string
  duration: number
  price: number
  createdAt: string
  publishedAt: string | null
  creator: {
    id: string
    firstName: string
    lastName: string
  }
  _count: {
    enrollments: number
    modules: number
  }
}

const courseColumns: ColumnDef<Course>[] = [
  {
    accessorKey: 'title',
    header: 'Course Title',
    cell: ({ row }) => {
      const course = row.original
      return (
        <div>
          <div className="font-medium">{course.title}</div>
          <div className="text-sm text-gray-500">
            {course.description.substring(0, 60)}...
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'creator',
    header: 'Creator',
    cell: ({ row }) => {
      const creator = row.original.creator
      return `${creator.firstName} ${creator.lastName}`
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const variant = status === 'PUBLISHED' ? 'default' : status === 'DRAFT' ? 'secondary' : 'destructive'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: 'difficulty',
    header: 'Difficulty',
    cell: ({ row }) => {
      const difficulty = row.getValue('difficulty') as string
      const variant = difficulty === 'BEGINNER' ? 'secondary' : difficulty === 'INTERMEDIATE' ? 'default' : 'destructive'
      return <Badge variant={variant}>{difficulty}</Badge>
    },
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
    cell: ({ row }) => `${row.getValue('duration')}h`,
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      return price > 0 ? `$${price}` : 'Free'
    },
  },
  {
    accessorKey: '_count.enrollments',
    header: 'Enrollments',
    cell: ({ row }) => row.original._count.enrollments,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const course = row.original
      return <CourseActions course={course} />
    },
  },
]

function CourseActions({ course }: { course: Course }) {
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: 'Success',
        description: 'Course deleted successfully',
      })

      // Refresh the page
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/courses/${course.id}/publish`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: 'Success',
        description: 'Course published successfully',
      })

      window.location.reload()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/courses/${course.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/courses/${course.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        {course.status === 'DRAFT' && (
          <DropdownMenuItem onClick={handlePublish}>
            <Plus className="h-4 w-4 mr-2" />
            Publish
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses?limit=50')
        if (!response.ok) throw new Error('Failed to fetch courses')
        const data = await response.json()
        setCourses(data.courses)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  if (loading) {
    return (
      <AdminLayout title="Courses" description="Manage all courses">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading courses...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Courses" description="Manage all courses">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">All Courses</h2>
            <p className="text-gray-600">Manage course content and settings</p>
          </div>
          <Link href="/admin/courses/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>

        <DataTable
          columns={courseColumns}
          data={courses}
          searchKey="title"
          searchPlaceholder="Search courses..."
        />
      </div>
    </AdminLayout>
  )
}
