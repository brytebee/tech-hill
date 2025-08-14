// app/api/student/topics/[topicId]/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StudentCourseService } from '@/lib/services/student/course-services'
import { z } from 'zod'

const updateProgressSchema = z.object({
  action: z.enum(['start', 'complete']),
})

// POST /api/student/topics/[topicId]/progress - Update topic progress
export async function POST(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topicId } = await params
    const body = await request.json()
    const validatedData = updateProgressSchema.parse(body)

    let progress
    if (validatedData.action === 'start') {
      progress = await StudentCourseService.startTopic(session.user.id, topicId)
    } else if (validatedData.action === 'complete') {
      progress = await StudentCourseService.completeTopic(session.user.id, topicId)
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('POST /api/student/topics/[topicId]/progress error:', error)
    
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

// GET /api/student/topics/[topicId]/progress - Get topic progress and accessibility
export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topicId } = await params
    
    const accessibility = await StudentCourseService.getTopicAccessibility(
      session.user.id, 
      topicId
    )

    return NextResponse.json(accessibility)
  } catch (error) {
    console.error('GET /api/student/topics/[topicId]/progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
