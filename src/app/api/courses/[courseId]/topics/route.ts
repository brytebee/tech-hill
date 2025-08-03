
// app/api/courses/[courseId]/topics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TopicService } from '@/lib/services/topicService'
import { CourseService } from '@/lib/services/courseService'
import { z } from 'zod'

const createTopicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  orderIndex: z.number().min(0),
  duration: z.number().min(0).optional(),
  topicType: z.enum(['LESSON', 'PRACTICE', 'ASSESSMENT', 'RESOURCE']).optional(),
  videoUrl: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  isRequired: z.boolean().optional(),
  allowSkip: z.boolean().optional(),
  prerequisiteTopicId: z.string().optional(),
  moduleId: z.string().min(1, 'Module ID is required'),
})

// GET /api/courses/[courseId]/topics - Get topics for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = params

    // Check if course exists and user has permission
    const course = await CourseService.getCourseById(courseId)
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Students can only view published courses
    if (session.user.role === 'STUDENT' && course.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Course not available' }, { status: 403 })
    }

    // Managers can only view their own courses (unless admin)
    if (session.user.role === 'MANAGER' && course.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all topics for all modules in this course
    const topics = []
    for (const module of course.modules) {
      const moduleTopics = await TopicService.getTopicsByModule(module.id)
      topics.push(...moduleTopics)
    }

    return NextResponse.json({ topics })
  } catch (error) {
    console.error('GET /api/courses/[courseId]/topics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[courseId]/topics - Create a new topic
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can create topics
    if (session.user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { courseId } = params

    // Check if course exists and user has permission
    const course = await CourseService.getCourseById(courseId)
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Managers can only create topics for their own courses
    if (session.user.role === 'MANAGER' && course.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createTopicSchema.parse(body)

    const topic = await TopicService.createTopic(validatedData)

    return NextResponse.json(topic, { status: 201 })
  } catch (error) {
    console.error('POST /api/courses/[courseId]/topics error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Topic slug already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
