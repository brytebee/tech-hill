// app/api/quizzes/[quizId]/questions/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
  explanation: z.string().optional(),
})

const questionSchema = z.object({
  id: z.string().optional(),
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
  orderIndex: z.number().optional(),
  isActive: z.boolean().default(true),
})

const bulkQuestionsSchema = z.object({
  questions: z.array(questionSchema),
})

// PUT /api/quizzes/[quizId]/questions/bulk - Update all questions for a quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can update questions
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
    const { questions } = bulkQuestionsSchema.parse(body)

    // Validate all questions
    const validationErrors: string[] = []
    
    questions.forEach((question, index) => {
      const requiresOptions = ['MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'MATCHING', 'ORDERING'].includes(question.questionType)
      
      if (requiresOptions && (!question.options || question.options.length === 0)) {
        validationErrors.push(`Question ${index + 1}: ${question.questionType} requires at least one option`)
      }

      if (question.questionType === 'TRUE_FALSE' && question.options && question.options.length !== 2) {
        validationErrors.push(`Question ${index + 1}: True/False questions must have exactly 2 options`)
      }

      if (requiresOptions && question.options) {
        const validOptions = question.options.filter(opt => opt.text.trim())
        const correctAnswers = validOptions.filter(opt => opt.isCorrect)
        
        if (correctAnswers.length === 0) {
          validationErrors.push(`Question ${index + 1}: Must have at least one correct answer`)
        }

        if ((question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') && correctAnswers.length > 1) {
          validationErrors.push(`Question ${index + 1}: Can only have one correct answer for ${question.questionType}`)
        }
      }
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get existing questions to determine what to update/create/delete
      const existingQuestions = await tx.question.findMany({
        where: { quizId },
        include: { options: true }
      })

      const updatedQuestions = []

      // Process each question
      for (let i = 0; i < questions.length; i++) {
        const questionData = questions[i]
        const { options, ...questionFields } = questionData
        
        // Set order index
        questionFields.orderIndex = i

        if (questionData.id) {
          // Update existing question
          const updatedQuestion = await tx.question.update({
            where: { id: questionData.id },
            data: questionFields,
            include: { options: true }
          })

          // Handle options for existing question
          if (options && options.length > 0) {
            // Delete existing options
            await tx.option.deleteMany({
              where: { questionId: questionData.id }
            })

            // Create new options
            await tx.option.createMany({
              data: options.map((option, optionIndex) => ({
                questionId: questionData.id!,
                text: option.text,
                isCorrect: option.isCorrect,
                explanation: option.explanation || null,
                orderIndex: optionIndex,
              }))
            })
          } else {
            // Remove all options if question type doesn't require them
            await tx.option.deleteMany({
              where: { questionId: questionData.id }
            })
          }

          updatedQuestions.push(updatedQuestion)
        } else {
          // Create new question
          const newQuestion = await tx.question.create({
            data: {
              ...questionFields,
              quizId,
              options: options && options.length > 0 ? {
                create: options.map((option, optionIndex) => ({
                  text: option.text,
                  isCorrect: option.isCorrect,
                  explanation: option.explanation || null,
                  orderIndex: optionIndex,
                }))
              } : undefined,
            },
            include: { options: true }
          })

          updatedQuestions.push(newQuestion)
        }
      }

      // Delete questions that are no longer in the list
      const questionIdsToKeep = questions
        .filter(q => q.id)
        .map(q => q.id!)
      
      const questionsToDelete = existingQuestions
        .filter(q => !questionIdsToKeep.includes(q.id))
        .map(q => q.id)

      if (questionsToDelete.length > 0) {
        // Delete options first (cascade should handle this, but being explicit)
        await tx.option.deleteMany({
          where: { questionId: { in: questionsToDelete } }
        })

        // Delete questions
        await tx.question.deleteMany({
          where: { id: { in: questionsToDelete } }
        })
      }

      return updatedQuestions
    })

    return NextResponse.json({
      success: true,
      questions: result,
      message: `Successfully saved ${result.length} questions`
    })

  } catch (error) {
    console.error('PUT /api/quizzes/[quizId]/questions/bulk error:', error)
    
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

// GET /api/quizzes/[quizId]/questions/bulk - Get all questions with full details
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
        }
      },
      orderBy: { orderIndex: 'asc' }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('GET /api/quizzes/[quizId]/questions/bulk error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
