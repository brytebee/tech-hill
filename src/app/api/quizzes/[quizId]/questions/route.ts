// app/api/quizzes/[quizId]/questions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const optionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
  explanation: z.string().optional(),
})

const createQuestionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  questionType: z.enum([
    'MULTIPLE_CHOICE',
    'MULTIPLE_SELECT',
    'TRUE_FALSE',
    'SHORT_ANSWER',
    'LONG_ANSWER',
    'MATCHING',
    'ORDERING'
  ]).default('MULTIPLE_CHOICE'),
  points: z.number().min(1, 'Points must be at least 1').default(1),
  explanation: z.string().optional(),
  hint: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  tags: z.array(z.string()).optional(),
  timeLimit: z.number().min(1).optional(),
  allowPartialCredit: z.boolean().default(false),
  caseSensitive: z.boolean().default(false),
  options: z.array(optionSchema).optional(),
})

// POST /api/quizzes/[quizId]/questions - Create a new question
export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can create questions
    if (session.user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { quizId } = params

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
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

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createQuestionSchema.parse(body)

    // Get the next order index
    const lastQuestion = await prisma.question.findFirst({
      where: { quizId },
      orderBy: { orderIndex: 'desc' }
    })

    const orderIndex = (lastQuestion?.orderIndex ?? -1) + 1

    // Validate question type requirements
    const requiresOptions = ['MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'MATCHING', 'ORDERING']
    if (requiresOptions.includes(validatedData.questionType) && (!validatedData.options || validatedData.options.length === 0)) {
      return NextResponse.json(
        { error: `Question type ${validatedData.questionType} requires at least one option` },
        { status: 400 }
      )
    }

    // For TRUE_FALSE, ensure only 2 options
    if (validatedData.questionType === 'TRUE_FALSE' && validatedData.options && validatedData.options.length !== 2) {
      return NextResponse.json(
        { error: 'True/False questions must have exactly 2 options' },
        { status: 400 }
      )
    }

    // For multiple choice, ensure at least one correct answer
    if (['MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE'].includes(validatedData.questionType)) {
      const hasCorrectAnswer = validatedData.options?.some(option => option.isCorrect)
      if (!hasCorrectAnswer) {
        return NextResponse.json(
          { error: 'Question must have at least one correct answer' },
          { status: 400 }
        )
      }
    }

    // For single answer questions, ensure only one correct answer
    if (validatedData.questionType === 'MULTIPLE_CHOICE' || validatedData.questionType === 'TRUE_FALSE') {
      const correctAnswers = validatedData.options?.filter(option => option.isCorrect) || []
      if (correctAnswers.length > 1) {
        return NextResponse.json(
          { error: 'Single answer questions can only have one correct answer' },
          { status: 400 }
        )
      }
    }

    const { options, ...questionData } = validatedData

    const question = await prisma.question.create({
      data: {
        ...questionData,
        quizId,
        orderIndex,
        options: options ? {
          create: options.map((option, index) => ({
            ...option,
            orderIndex: index
          }))
        } : undefined
      },
      include: {
        options: true,
        quiz: {
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
        }
      }
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('POST /api/quizzes/[quizId]/questions error:', error)
    
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

// GET /api/quizzes/[quizId]/questions - Get all questions for a quiz
export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizId } = params

    const questions = await prisma.question.findMany({
      where: { 
        quizId,
        isActive: true 
      },
      include: {
        options: {
          orderBy: { orderIndex: 'asc' }
        },
        quiz: {
          include: {
            topic: true
          }
        }
      },
      orderBy: { orderIndex: 'asc' }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('GET /api/quizzes/[quizId]/questions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
