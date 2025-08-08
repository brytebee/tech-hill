// app/api/student/quiz/[quizId]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StudentCourseService } from '@/lib/services/student/course-services'
import { z } from 'zod'

const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  timeSpent: z.number().optional(),
  topicId: z.string().optional(),
})

// POST /api/student/quiz/[quizId]/submit - Submit quiz attempt
export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizId } = params
    const body = await request.json()
    const validatedData = submitQuizSchema.parse(body)

    const attempt = await StudentCourseService.submitQuizAttempt({
      userId: session.user.id,
      quizId,
      answers: validatedData.answers,
      timeSpent: validatedData.timeSpent,
      topicId: validatedData.topicId,
    })

    return NextResponse.json(attempt)
  } catch (error) {
    console.error('POST /api/student/quiz/[quizId]/submit error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// app/api/student/courses/[courseId]/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StudentCourseService } from '@/lib/services/student/course-actions'

// GET /api/student/courses/[courseId]/progress - Get detailed course progress
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = params
    
    const progress = await StudentCourseService.getCourseProgress(
      session.user.id,
      courseId
    )

    return NextResponse.json(progress)
  } catch (error) {
    console.error('GET /api/student/courses/[courseId]/progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// app/api/student/courses/[courseId]/next-topic/route.ts  
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StudentCourseService } from '@/lib/services/student/course-actions'

// GET /api/student/courses/[courseId]/next-topic - Get next available topic
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = params
    
    const nextTopic = await StudentCourseService.getNextTopic(
      session.user.id,
      courseId
    )

    return NextResponse.json({ nextTopic })
  } catch (error) {
    console.error('GET /api/student/courses/[courseId]/next-topic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
