Note: The system is built with NextJS 15 

// Enhanced Quiz System
model Quiz {
  id          String   @id @default(cuid())
  topicId     String
  title       String
  description String?
  
  // Quiz Configuration
  timeLimit   Int?     // Minutes (null = no time limit)
  shuffleQuestions Boolean @default(false)
  shuffleOptions Boolean @default(false)
  showFeedback Boolean @default(true) // Show correct answers after
  allowReview Boolean @default(true) // Allow reviewing answers
  passingScore Int     @default(80) // Percentage to pass
  maxAttempts Int?     // Null = unlimited
  
  // Advanced Features
  adaptiveDifficulty Boolean @default(false) // Adjust based on performance
  requireMastery Boolean @default(false) // Must get all questions right
  practiceMode Boolean @default(false) // Doesn't count toward progress
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  topic     Topic         @relation(fields: [topicId], references: [id], onDelete: Cascade)
  questions Question[]
  attempts  QuizAttempt[]

  @@map("quizzes")
}

// Enhanced Question System
model Question {
  id            String       @id @default(cuid())
  quizId        String
  questionText  String       @db.Text
  questionType  QuestionType @default(MULTIPLE_CHOICE)
  orderIndex    Int
  points        Int          @default(1)
  explanation   String?      @db.Text // Detailed explanation shown after answering
  hint          String?      // Optional hint for students
  difficulty    QuestionDifficulty @default(MEDIUM)
  tags          String[]     // For categorization and analytics
  
  // Advanced Question Features
  timeLimit     Int?         // Seconds for this question
  allowPartialCredit Boolean @default(false)
  caseSensitive Boolean     @default(false) // For text answers
  
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  quiz    Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  options Option[]
  answers Answer[]

  @@map("questions")
}

enum QuestionType {
  MULTIPLE_CHOICE
  MULTIPLE_SELECT  // Multiple correct answers
  TRUE_FALSE
  SHORT_ANSWER
  LONG_ANSWER
  MATCHING
  ORDERING
}

enum QuestionDifficulty {
  EASY
  MEDIUM
  HARD
}

// Enhanced Answer Options
model Option {
  id         String  @id @default(cuid())
  questionId String
  text       String  @db.Text
  isCorrect  Boolean @default(false)
  orderIndex Int
  explanation String? // Why this option is right/wrong

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  answers  Answer[]

  @@map("options")
}

// Detailed Module Progress Tracking
enum ProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  NEEDS_REVIEW
  FAILED
}

enum MasteryLevel {
  NOVICE
  DEVELOPING
  PROFICIENT
  ADVANCED
  EXPERT
}

// Enhanced Quiz Attempts with Detailed Analytics
model QuizAttempt {
  id          String    @id @default(cuid())
  userId      String
  quizId      String
  
  // Performance Metrics
  score       Int       // Percentage score
  passed      Boolean   @default(false)
  isPractice  Boolean   @default(false) // Practice vs real attempt
  
  // Timing Analytics
  startedAt   DateTime  @default(now())
  completedAt DateTime?
  timeSpent   Int?      // Seconds spent on quiz
  
  // Detailed Analytics
  questionsCorrect Int   @default(0)
  questionsTotal   Int   @default(0)
  averageTimePerQuestion Int? // Seconds per question
  
  // Behavioral Analytics
  questionsSkipped Int   @default(0)
  questionsReviewed Int  @default(0)
  hintsUsed       Int    @default(0)
  
  // Learning Insights
  difficultyAreas Json?  // Topics/skills where student struggled
  strengthAreas   Json?  // Topics/skills where student excelled
  recommendedReview String[] // Topics to review
  
  createdAt   DateTime  @default(now())

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz    Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  answers Answer[]

  @@map("quiz_attempts")
}

// Enhanced Answer Tracking
model Answer {
  id            String  @id @default(cuid())
  attemptId     String
  questionId    String
  
  // Answer Data
  selectedOption String? // For multiple choice (option ID)
  selectedOptions String[] // For multiple select
  textAnswer    String? // For text answers
  
  // Performance Data
  isCorrect     Boolean @default(false)
  points        Int     @default(0)
  partialCredit Int?    // Partial points awarded
  
  // Timing & Behavior
  timeSpent     Int?    // Seconds on this question
  attemptCount  Int     @default(1) // How many times they changed answer
  usedHint      Boolean @default(false)
  flaggedForReview Boolean @default(false)
  
  createdAt     DateTime @default(now())

  attempt  QuizAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)
  option   Option?     @relation(fields: [selectedOption], references: [id])

  @@map("answers")
}

// Enhanced Submissions for Assignments
enum SubmissionStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  GRADED
  RETURNED
  RESUBMITTED
}

model Submission {
  id          String           @id @default(cuid())
  userId      String
  topicId     String
  
  content     String           @db.Text
  attachments String[]         // File URLs
  
  // Grading
  score       Int?
  maxScore    Int              @default(100)
  feedback    String?          @db.Text
  rubricScores Json?           // Detailed rubric scoring
  
  status      SubmissionStatus @default(DRAFT)
  attemptNumber Int            @default(1)
  
  // Timestamps
  submittedAt DateTime?
  gradedAt    DateTime?
  returnedAt  DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  topic Topic @relation(fields: [topicId], references: [id], onDelete: Cascade)

  @@map("submissions")
}

NOTE: DO NOT responde with the full Code, just code changes.

Please pay special attention to the attributes of each table in solving this:

Notice how the quiz is setup. Some question could have multiselect answer which is an array of answers. ATM, the storage saves the id of the selected option which is rendered to the user instead of the actual answer(s) the selected.
I want you to use an efficient way to fix the storage of the answers text so that they can be easily rendered in the results page.I will provide the quiz page, the storage API and the result page.

Please show only code changes to solve this as I have the bulk of the code already.

// POST /api/student/quiz/[quizId]/route.ts - Submit quiz attempt
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
        isActive: true,
      },
      include: {
        questions: {
          where: { isActive: true },
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if student can still take this quiz
    const existingAttempts = await prisma.quizAttempt.count({
      where: {
        quizId,
        userId: session.user.id,
        isPractice: false,
      },
    });

    if (quiz.maxAttempts && existingAttempts >= quiz.maxAttempts) {
      return NextResponse.json(
        { error: "Maximum attempts exceeded" },
        { status: 403 }
      );
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
          timeSpent: null,
        });
        continue;
      }

      let isCorrect = false;
      let pointsEarned = 0;

      // Grade based on question type
      switch (question.questionType) {
        case "MULTIPLE_CHOICE":
        case "TRUE_FALSE":
          const correctOption = question.options.find((opt) => opt.isCorrect);
          isCorrect = studentAnswer === correctOption?.id;
          pointsEarned = isCorrect ? question.points : 0;
          break;

        case "MULTIPLE_SELECT":
          const correctOptionIds = question.options
            .filter((opt) => opt.isCorrect)
            .map((opt) => opt.id)
            .sort();
          const selectedIds = Array.isArray(studentAnswer)
            ? studentAnswer.sort()
            : [];
          isCorrect =
            JSON.stringify(correctOptionIds) === JSON.stringify(selectedIds);

          if (question.allowPartialCredit && !isCorrect) {
            const correctSelected = selectedIds.filter((id) =>
              correctOptionIds.includes(id)
            ).length;
            const incorrectSelected = selectedIds.filter(
              (id) => !correctOptionIds.includes(id)
            ).length;
            const missedCorrect = correctOptionIds.filter(
              (id) => !selectedIds.includes(id)
            ).length;

            // Partial credit formula: (correct - incorrect) / total_correct
            const partialScore = Math.max(
              0,
              (correctSelected - incorrectSelected) / correctOptionIds.length
            );
            pointsEarned = Math.round(partialScore * question.points);
          } else {
            pointsEarned = isCorrect ? question.points : 0;
          }
          break;

        case "SHORT_ANSWER":
        case "LONG_ANSWER":
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
        selectedOptions: Array.isArray(studentAnswer)
          ? studentAnswer
          : [studentAnswer],
        textAnswer: typeof studentAnswer === "string" ? studentAnswer : null,
        isCorrect,
        points: pointsEarned,
        timeSpent: null, // Could be tracked per question
      });
    }

    const scorePercentage =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
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
      },
    });

    // Create answer records
    const answerRecords = detailedAnswers.map((answer) => ({
      attemptId: quizAttempt.id,
      questionId: answer.questionId,
      selectedOptions: answer.selectedOptions,
      textAnswer: answer.textAnswer,
      isCorrect: answer.isCorrect,
      points: answer.points,
      timeSpent: answer.timeSpent,
    }));

    await prisma.answer.createMany({
      data: answerRecords,
    });

    // Update topic progress if topicId provided
    if (topicId && passed) {
      await prisma.topicProgress.upsert({
        where: {
          userId_topicId: {
            userId: session.user.id,
            topicId,
          },
        },
        create: {
          userId: session.user.id,
          topicId,
          status: "COMPLETED",
          bestScore: scorePercentage,
          averageScore: scorePercentage,
          attemptCount: 1,
          completedAt: new Date(),
          masteryAchieved: scorePercentage >= 90,
        },
        update: {
          status: "COMPLETED",
          bestScore: {
            set: Math.max(scorePercentage, 0), // Will be updated by DB if current bestScore is higher
          },
          attemptCount: {
            increment: 1,
          },
          completedAt: new Date(),
          masteryAchieved: scorePercentage >= 90,
          lastAccessAt: new Date(),
        },
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
        completedAt: quizAttempt.completedAt,
      },
    });
  } catch (error) {
    console.error("POST /api/student/quiz/[quizId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// components/students/QuizInterface.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  FileText,
  Award,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Save,
  Send,
  Timer,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface QuizOption {
  id: string;
  text: string;
  orderIndex: number;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType:
    | "MULTIPLE_CHOICE"
    | "MULTIPLE_SELECT"
    | "TRUE_FALSE"
    | "SHORT_ANSWER"
    | "LONG_ANSWER"
    | "MATCHING"
    | "ORDERING";
  points: number;
  required: boolean;
  options: QuizOption[];
  hint?: string;
  timeLimit?: number;
  allowPartialCredit?: boolean;
  caseSensitive?: boolean;
  orderIndex: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  allowRetakes: boolean;
  maxAttempts?: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  topic: {
    id: string;
    title: string;
    module: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
  questions: QuizQuestion[];
}

interface AttemptData {
  id: string;
  score: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date | null;
  timeSpent: number | null;
  questionsCorrect: number;
  questionsTotal: number;
}

interface QuizMetadata {
  totalQuestions: number;
  totalPoints: number;
  attemptNumber: number;
  attemptsRemaining: number | null;
  hasPassedQuiz: boolean;
}

interface QuizInterfaceProps {
  quiz: Quiz;
  attempts: AttemptData[];
  userId: string;
  topicId?: string;
  metadata: QuizMetadata;
}

type Answer = string | string[];

export function QuizInterface({
  quiz,
  attempts,
  userId,
  topicId,
  metadata,
}: QuizInterfaceProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [timeLeft, setTimeLeft] = useState(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [quizStartTime] = useState(Date.now());

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-save answers periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        // Auto-save logic could be implemented here
        console.log("Auto-saving answers...", answers);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [answers]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answer: Answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getProgressPercentage = () => {
    return Math.round((getAnsweredCount() / quiz.questions.length) * 100);
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000); // Convert to seconds

      const submitData = {
        answers,
        timeSpent,
        topicId,
      };

      const response = await fetch(`/api/student/quiz/${quiz.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit quiz");
      }

      const result = await response.json();

      toast.success("Quiz submitted successfully!");

      // Redirect to results page
      router.push(
        `/student/quiz/${quiz.id}/results?attempt=${result.attempt.id}`
      );
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit quiz"
      );
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    const requiredQuestions = quiz.questions.filter((q) => q.required);
    const answeredRequired = requiredQuestions.filter(
      (q) =>
        answers[q.id] &&
        (typeof answers[q.id] === "string"
          ? answers[q.id].trim() !== ""
          : Array.isArray(answers[q.id]) && answers[q.id].length > 0)
    ).length;
    return answeredRequired === requiredQuestions.length;
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const answer = answers[question.id];

    switch (question.questionType) {
      case "MULTIPLE_CHOICE":
      case "TRUE_FALSE":
        return (
          <div className="space-y-3">
            <RadioGroup
              value={(answer as string) || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label
                    htmlFor={option.id}
                    className="flex-1 cursor-pointer py-2"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "MULTIPLE_SELECT":
        const selectedOptions = (answer as string[]) || [];
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">Select all that apply:</p>
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-3">
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswerChange(question.id, [
                        ...selectedOptions,
                        option.id,
                      ]);
                    } else {
                      handleAnswerChange(
                        question.id,
                        selectedOptions.filter((id) => id !== option.id)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={option.id}
                  className="flex-1 cursor-pointer py-2"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        );

      case "SHORT_ANSWER":
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Enter your answer..."
              value={(answer as string) || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="min-h-[100px]"
            />
            {question.caseSensitive && (
              <p className="text-xs text-amber-600">
                Note: This answer is case-sensitive
              </p>
            )}
          </div>
        );

      case "LONG_ANSWER":
        const wordCount = (((answer as string) || "").match(/\S+/g) || [])
          .length;
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Write your detailed answer here..."
              value={(answer as string) || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Word count: {wordCount}</span>
              <span className="text-blue-600">
                Detailed answers may be manually graded
              </span>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-red-500">
            Unsupported question type: {question.questionType}
          </div>
        );
    }
  };

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {quiz.topic.module.course.title}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {quiz.questions.length} questions
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {quiz.passingScore}% to pass
                </span>
                {metadata.totalPoints && (
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {metadata.totalPoints} points
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              {timeLeft !== null && (
                <div
                  className={`flex items-center gap-2 text-lg font-mono ${
                    timeLeft < 300
                      ? "text-red-600 animate-pulse"
                      : "text-gray-700"
                  }`}
                >
                  <Timer className="h-5 w-5" />
                  {formatTime(timeLeft)}
                  {timeLeft < 300 && (
                    <span className="text-xs text-red-600 ml-2">
                      TIME RUNNING OUT!
                    </span>
                  )}
                </div>
              )}
              {attempts.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Attempt {metadata.attemptNumber} of {quiz.maxAttempts || "∞"}
                </p>
              )}
              {metadata.attemptsRemaining !== null && (
                <p className="text-sm text-amber-600 mt-1">
                  {metadata.attemptsRemaining} attempts remaining
                </p>
              )}
            </div>
          </div>

          {quiz.description && (
            <p className="text-gray-600 mt-3">{quiz.description}</p>
          )}
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Quiz Progress</span>
            <span className="text-sm text-gray-600">
              {getAnsweredCount()} of {quiz.questions.length} answered
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {currentQ.points} points
              </Badge>
              {currentQ.required && <Badge variant="secondary">Required</Badge>}
              {currentQ.timeLimit && (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {currentQ.timeLimit}s
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {answers[currentQ.id] && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          <CardTitle className="text-lg leading-relaxed mt-4">
            {currentQ.questionText}
          </CardTitle>

          {currentQ.hint && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Hint:</span> {currentQ.hint}
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent>{renderQuestion(currentQ, currentQuestion)}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? "bg-blue-600 text-white"
                  : answers[quiz.questions[index].id]
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <Button
            onClick={() =>
              setCurrentQuestion((prev) =>
                Math.min(quiz.questions.length - 1, prev + 1)
              )
            }
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <AlertDialog
            open={showSubmitDialog}
            onOpenChange={setShowSubmitDialog}
          >
            <AlertDialogTrigger asChild>
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={!canSubmit()}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Quiz
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    You have answered {getAnsweredCount()} out of{" "}
                    {quiz.questions.length} questions.
                  </p>
                  {!canSubmit() && (
                    <div className="text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Please answer all required questions before submitting.
                    </div>
                  )}
                  <p>
                    Once submitted, you cannot change your answers. Are you sure
                    you want to submit?
                  </p>
                  {timeLeft !== null && timeLeft < 60 && (
                    <div className="text-amber-600 flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      Less than 1 minute remaining!
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>
                  Review Answers
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSubmitQuiz}
                  disabled={!canSubmit() || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Auto-save indicator */}
      <div className="text-center">
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <Save className="h-3 w-3" />
          Answers are saved automatically as you type
        </p>
      </div>

      {/* Quiz Stats */}
      {attempts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">Previous Attempts</h3>
            <div className="space-y-2">
              {attempts.slice(0, 3).map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>Attempt {attempts.length - index}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={attempt.passed ? "default" : "destructive"}>
                      {attempt.score}%
                    </Badge>
                    <span className="text-gray-500">
                      {attempt.questionsCorrect}/{attempt.questionsTotal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// students/QuizResults.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  BookOpen,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Trophy,
  AlertCircle,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  questionText: string;
  questionType: string;
}
interface QuizAnswer {
  question: Question;
  questionId: string;
  points: number;
  earnedPoints: number;
  textAnswer: string;
  isCorrect: boolean;
  feedback?: string;
}

interface QuizAttempt {
  id: string;
  score: number;
  questionsTotal: number;
  questionsCorrect: number;
  passed: boolean;
  completedAt: Date;
  timeSpent: number;
  answers: QuizAnswer[];
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  allowRetakes: boolean;
  maxAttempts?: number;
  topic: {
    id: string;
    title: string;
    module: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
}

interface QuizResultsProps {
  attempt: QuizAttempt;
  quiz: Quiz;
  allAttempts: QuizAttempt[];
  userId: string;
  topicId?: string;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function getScoreColor(score: number, passingScore: number) {
  if (score >= passingScore) {
    return "text-green-600";
  } else if (score >= passingScore * 0.7) {
    return "text-yellow-600";
  } else {
    return "text-red-600";
  }
}

function getScoreBadgeStyle(passed: boolean) {
  if (passed) {
    return "bg-green-100 text-green-800 border-green-200";
  } else {
    return "bg-red-100 text-red-800 border-red-200";
  }
}

function QuestionReview({
  answer,
  index,
}: {
  answer: QuizAnswer;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderAnswer = (answerData: string | string[]) => {
    if (Array.isArray(answerData)) {
      return answerData.join(", ");
    }
    return answerData;
  };

  return (
    <Card
      className={`border-l-4 ${
        answer.isCorrect ? "border-l-green-500" : "border-l-red-500"
      }`}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {answer.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">
                    Question {index + 1}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {answer.question.questionText.length > 80
                      ? `${answer.question.questionText.substring(0, 80)}...`
                      : answer.question.questionText}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {answer.earnedPoints}/{answer.points} pts
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {answer.question.questionType
                      .toLowerCase()
                      .replace("_", " ")}
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                <p className="text-gray-700">{answer.question.questionText}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Your Answer:
                  </h4>
                  <div
                    className={`p-3 rounded-lg border ${
                      answer.isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <p className="text-sm">{renderAnswer(answer.textAnswer)}</p>
                  </div>
                </div>

                {!answer.isCorrect && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Correct Answer:
                    </h4>
                    <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                      <p className="text-sm">
                        {renderAnswer(answer.textAnswer)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {answer.feedback && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Feedback:</h4>
                  <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-800">{answer.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function QuizResults({
  attempt,
  quiz,
  allAttempts,
  userId,
  topicId,
}: QuizResultsProps) {
  const router = useRouter();
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const handleRetakeQuiz = () => {
    router.push(
      `/student/quiz/${quiz.id}${topicId ? `?topicId=${topicId}` : ""}`
    );
  };

  const canRetake =
    quiz.allowRetakes &&
    (!quiz.maxAttempts || allAttempts.length < quiz.maxAttempts);

  const correctAnswers = attempt.answers.filter((a) => a.isCorrect).length;
  const incorrectAnswers = attempt.answers.length - correctAnswers;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link
          href={`/student/courses/${quiz.topic.module.course.id}`}
          className="hover:text-gray-700"
        >
          {quiz.topic.module.course.title}
        </Link>
        <span>/</span>
        <Link
          href={`/student/topics/${quiz.topic.id}`}
          className="hover:text-gray-700"
        >
          {quiz.topic.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Quiz Results</span>
      </nav>

      {/* Results Header */}
      <Card
        className={`border-t-4 ${
          attempt.passed ? "border-t-green-500" : "border-t-red-500"
        }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                {attempt.passed ? (
                  <Trophy className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                )}
                Quiz {attempt.passed ? "Passed!" : "Not Passed"}
              </CardTitle>
              <p className="text-gray-600 mt-1">{quiz.title}</p>
            </div>
            <Badge className={getScoreBadgeStyle(attempt.passed)}>
              {attempt.passed ? "PASSED" : "FAILED"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* Score Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${getScoreColor(
                  attempt.score,
                  quiz.passingScore
                )}`}
              >
                {attempt.score}%
              </div>
              <p className="text-sm text-gray-600">Final Score</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">
                {attempt.questionsCorrect}/{attempt.questionsTotal}
              </div>
              <p className="text-sm text-gray-600">Points Earned</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {correctAnswers}/{attempt.answers.length}
              </div>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">
                {formatTime(attempt.timeSpent)}
              </div>
              <p className="text-sm text-gray-600">Time Spent</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Score Breakdown</span>
              <span className="text-sm text-gray-600">
                Passing Score: {quiz.passingScore}%
              </span>
            </div>
            <div className="relative">
              <Progress value={attempt.score} className="h-3" />
              <div
                className="absolute top-0 h-3 w-0.5 bg-red-500 rounded"
                style={{ left: `${quiz.passingScore}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="text-red-600">
                ← {quiz.passingScore}% required
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Correct: {correctAnswers}</span>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">
                  Incorrect: {incorrectAnswers}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-medium">
                  Completed: {attempt.completedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              {!attempt.passed ? (
                <p className="text-sm text-gray-600 mb-2">
                  Don't worry! You can review your answers and try again.
                </p>
              ) : (
                <p className="text-sm text-gray-600 mb-2">
                  Congratulations! You've successfully completed this quiz.
                </p>
              )}
              {allAttempts.length > 0 && (
                <p className="text-xs text-gray-500">
                  Attempt {allAttempts.length} of {quiz.maxAttempts || "∞"}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {canRetake && (
                <Button onClick={handleRetakeQuiz} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
              )}

              <Link
                href={
                  topicId
                    ? `/student/topics/${topicId}`
                    : `/student/courses/${quiz.topic.module.course.id}`
                }
              >
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {topicId ? "Back to Topic" : "Back to Course"}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Question Review
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllQuestions(!showAllQuestions)}
            >
              {showAllQuestions ? "Hide" : "Show"} All Questions
            </Button>
          </CardTitle>
        </CardHeader>

        {showAllQuestions && (
          <CardContent>
            <div className="space-y-4">
              {attempt.answers.map((answer, index) => (
                <QuestionReview
                  key={answer.questionId}
                  answer={answer}
                  index={index}
                />
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Previous Attempts (if any) */}
      {allAttempts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Attempt History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allAttempts.map((pastAttempt, index) => (
                <div
                  key={pastAttempt.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    pastAttempt.id === attempt.id
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Attempt {index + 1}</Badge>
                    <span className="text-sm">
                      {pastAttempt.completedAt.toLocaleDateString()}
                    </span>
                    {pastAttempt.id === attempt.id && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-medium ${getScoreColor(
                        pastAttempt.score,
                        quiz.passingScore
                      )}`}
                    >
                      {pastAttempt.score}%
                    </span>
                    <Badge className={getScoreBadgeStyle(pastAttempt.passed)}>
                      {pastAttempt.passed ? "PASSED" : "FAILED"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
