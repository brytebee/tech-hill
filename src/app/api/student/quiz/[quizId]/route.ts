// app/api/student/quiz/[quizId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/student/quiz/[quizId] - Get quiz data for student
export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;
    const url = new URL(request.url);
    const topicId = url.searchParams.get('topicId');

    // Fetch quiz with all related data
    const quiz = await prisma.quiz.findUnique({
      where: { 
        id: quizId,
        isActive: true 
      },
      include: {
        topic: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        questions: {
          where: {
            isActive: true
          },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' }
            },
          },
          orderBy: { orderIndex: 'asc' }
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: quiz.topic.module.course.id
        },
        status: "ACTIVE"
      }
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    // Get student's previous attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId,
        userId: session.user.id,
        isPractice: false
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check if student can take the quiz
    const canTakeQuiz = quiz.maxAttempts ? attempts.length < quiz.maxAttempts : true;
    const hasPassedQuiz = attempts.some(attempt => attempt.passed);

    // Get topic progress to check prerequisites
    let topicProgress = null;
    if (topicId) {
      topicProgress = await prisma.topicProgress.findUnique({
        where: {
          userId_topicId: {
            userId: session.user.id,
            topicId
          }
        }
      });
    }

    // Format questions for frontend (hide correct answers)
    const formattedQuestions = quiz.questions.map(question => ({
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      points: question.points,
      hint: question.hint,
      timeLimit: question.timeLimit,
      allowPartialCredit: question.allowPartialCredit,
      caseSensitive: question.caseSensitive,
      orderIndex: question.orderIndex,
      tags: question.tags,
      options: question.options.map(option => ({
        id: option.id,
        text: option.text,
        orderIndex: option.orderIndex
        // Don't send isCorrect to frontend
      }))
    }));

    // Shuffle questions if required
    const questionsToSend = quiz.shuffleQuestions 
      ? shuffleArray(formattedQuestions)
      : formattedQuestions;

    // Shuffle options within each question if required
    if (quiz.shuffleOptions) {
      questionsToSend.forEach(question => {
        if (question.options) {
          question.options = shuffleArray(question.options);
        }
      });
    }

    const response = {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        allowReview: quiz.allowReview,
        showFeedback: quiz.showFeedback,
        maxAttempts: quiz.maxAttempts,
        shuffleQuestions: quiz.shuffleQuestions,
        shuffleOptions: quiz.shuffleOptions,
        topic: {
          id: quiz.topic.id,
          title: quiz.topic.title,
          module: {
            id: quiz.topic.module.id,
            title: quiz.topic.module.title,
            course: {
              id: quiz.topic.module.course.id,
              title: quiz.topic.module.course.title,
            }
          }
        },
        questions: questionsToSend
      },
      attempts: attempts.map(attempt => ({
        id: attempt.id,
        score: attempt.score,
        passed: attempt.passed,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        timeSpent: attempt.timeSpent
      })),
      canTakeQuiz,
      hasPassedQuiz,
      topicProgress,
      metadata: {
        totalQuestions: quiz.questions.length,
        totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
        attemptNumber: attempts.length + 1,
        attemptsRemaining: quiz.maxAttempts ? quiz.maxAttempts - attempts.length : null
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/student/quiz/[quizId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/student/quiz/[quizId] - Submit quiz attempt
export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;
    const body = await request.json();
    const { answers, timeSpent, topicId } = body;

    // Fetch quiz with questions and correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { 
        id: quizId,
        isActive: true 
      },
      include: {
        questions: {
          where: { isActive: true },
          include: {
            options: true
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if student can still take this quiz
    const existingAttempts = await prisma.quizAttempt.count({
      where: {
        quizId,
        userId: session.user.id,
        isPractice: false
      }
    });

    if (quiz.maxAttempts && existingAttempts >= quiz.maxAttempts) {
      return NextResponse.json({ error: "Maximum attempts exceeded" }, { status: 403 });
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    let questionsCorrect = 0;
    const detailedAnswers = [];

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const studentAnswer = answers[question.id];
      
      if (!studentAnswer) {
        detailedAnswers.push({
          questionId: question.id,
          selectedOptions: [],
          textAnswer: null,
          isCorrect: false,
          points: 0,
          timeSpent: null
        });
        continue;
      }

      let isCorrect = false;
      let pointsEarned = 0;

      // Grade based on question type
      switch (question.questionType) {
        case 'MULTIPLE_CHOICE':
        case 'TRUE_FALSE':
          const correctOption = question.options.find(opt => opt.isCorrect);
          isCorrect = studentAnswer === correctOption?.id;
          pointsEarned = isCorrect ? question.points : 0;
          break;

        case 'MULTIPLE_SELECT':
          const correctOptionIds = question.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.id)
            .sort();
          const selectedIds = Array.isArray(studentAnswer) ? studentAnswer.sort() : [];
          isCorrect = JSON.stringify(correctOptionIds) === JSON.stringify(selectedIds);
          
          if (question.allowPartialCredit && !isCorrect) {
            const correctSelected = selectedIds.filter(id => correctOptionIds.includes(id)).length;
            const incorrectSelected = selectedIds.filter(id => !correctOptionIds.includes(id)).length;
            const missedCorrect = correctOptionIds.filter(id => !selectedIds.includes(id)).length;
            
            // Partial credit formula: (correct - incorrect) / total_correct
            const partialScore = Math.max(0, (correctSelected - incorrectSelected) / correctOptionIds.length);
            pointsEarned = Math.round(partialScore * question.points);
          } else {
            pointsEarned = isCorrect ? question.points : 0;
          }
          break;

        case 'SHORT_ANSWER':
        case 'LONG_ANSWER':
          // For text answers, we'll mark as correct for now (needs manual grading)
          // In a real system, you might want to implement fuzzy matching or keyword checking
          isCorrect = studentAnswer && studentAnswer.trim().length > 0;
          pointsEarned = isCorrect ? question.points : 0;
          break;
      }

      if (isCorrect) questionsCorrect++;
      earnedPoints += pointsEarned;

      detailedAnswers.push({
        questionId: question.id,
        selectedOptions: Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer],
        textAnswer: typeof studentAnswer === 'string' ? studentAnswer : null,
        isCorrect,
        points: pointsEarned,
        timeSpent: null // Could be tracked per question
      });
    }

    const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercentage >= quiz.passingScore;

    // Create quiz attempt record
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        score: scorePercentage,
        passed,
        timeSpent,
        questionsCorrect,
        questionsTotal: quiz.questions.length,
        questionsSkipped: quiz.questions.length - Object.keys(answers).length,
        isPractice: false,
        completedAt: new Date(),
      }
    });

    // Create answer records
    const answerRecords = detailedAnswers.map(answer => ({
      attemptId: quizAttempt.id,
      questionId: answer.questionId,
      selectedOptions: answer.selectedOptions,
      textAnswer: answer.textAnswer,
      isCorrect: answer.isCorrect,
      points: answer.points,
      timeSpent: answer.timeSpent
    }));

    await prisma.answer.createMany({
      data: answerRecords
    });

    // Update topic progress if topicId provided
    if (topicId && passed) {
      await prisma.topicProgress.upsert({
        where: {
          userId_topicId: {
            userId: session.user.id,
            topicId
          }
        },
        create: {
          userId: session.user.id,
          topicId,
          status: 'COMPLETED',
          bestScore: scorePercentage,
          averageScore: scorePercentage,
          attemptCount: 1,
          completedAt: new Date(),
          masteryAchieved: scorePercentage >= 90
        },
        update: {
          status: 'COMPLETED',
          bestScore: {
            set: Math.max(scorePercentage, 0) // Will be updated by DB if current bestScore is higher
          },
          attemptCount: {
            increment: 1
          },
          completedAt: new Date(),
          masteryAchieved: scorePercentage >= 90,
          lastAccessAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      attempt: {
        id: quizAttempt.id,
        score: scorePercentage,
        passed,
        earnedPoints,
        totalPoints,
        questionsCorrect,
        questionsTotal: quiz.questions.length,
        timeSpent,
        completedAt: quizAttempt.completedAt
      }
    });
  } catch (error) {
    console.error("POST /api/student/quiz/[quizId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
