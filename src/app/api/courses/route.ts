// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CourseService } from '@/lib/services/courseService'
import { z } from 'zod'

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().optional(),
  thumbnail: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  price: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  syllabus: z.string().optional(),
  learningOutcomes: z.array(z.string()).optional(),
})

// Updated schema to handle null values properly
const getCoursesSchema = z.object({
  page: z.string().nullable().optional(),
  limit: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).nullable().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().optional(),
  creatorId: z.string().nullable().optional(),
  search: z.string().nullable().optional(),
})

// GET /api/courses - Get courses with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = getCoursesSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      difficulty: searchParams.get('difficulty'),
      creatorId: searchParams.get('creatorId'),
      search: searchParams.get('search'),
    })

    // Convert strings to numbers with defaults, handle null values
    const page = params.page ? parseInt(params.page) : 1
    const limit = params.limit ? parseInt(params.limit) : 10
    
    const filters = {
      status: params.status || undefined,
      difficulty: params.difficulty || undefined,
      creatorId: params.creatorId || undefined,
      search: params.search || undefined,
    }

    // Students can only see published courses
    if (session.user.role === 'STUDENT') {
      filters.status = 'PUBLISHED'
    }

    // Managers can only see their own courses (unless admin)
    if (session.user.role === 'MANAGER') {
      filters.creatorId = session.user.id
    }

    const result = await CourseService.getCourses(filters, page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/courses error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can create courses
    if (session.user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)

    const courseData = {
      ...validatedData,
      creatorId: session.user.id,
    }

    const course = await CourseService.createCourse(courseData)

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('POST /api/courses error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}