// app/api/topics/[topicId]/quizzes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  timeLimit: z.number().min(1).optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  showFeedback: z.boolean().optional(),
  allowReview: z.boolean().optional(),
  passingScore: z.number().min(0).max(100, 'Passing score must be between 0 and 100'),
  maxAttempts: z.number().min(1).optional(),
  adaptiveDifficulty: z.boolean().optional(),
  requireMastery: z.boolean().optional(),
  practiceMode: z.boolean().optional(),
})

// POST /api/topics/[topicId]/quizzes - Create a new quiz
export async function POST(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can create quizzes
    if (session.user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { topicId } = params

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createQuizSchema.parse(body)

    const quiz = await prisma.quiz.create({
      data: {
        ...validatedData,
        topicId,
      },
      include: {
        topic: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(quiz, { status: 201 })
  } catch (error) {
    console.error('POST /api/topics/[topicId]/quizzes error:', error)
    
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

// GET /api/topics/[topicId]/quizzes - Get all quizzes for a topic
export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topicId } = params

    const quizzes = await prisma.quiz.findMany({
      where: { topicId },
      include: {
        topic: true,
        questions: {
          include: {
            options: true
          }
        },
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error('GET /api/topics/[topicId]/quizzes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
