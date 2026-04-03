Please show only code changes to the file I have provided as they are lengthy. Only provide full code for new file if any.

## ** Day 4: Quiz System & Progress Logic **
### Morning (4 hours)
- [ ] Complete quiz timer functionality


### **End of Day 4 Checklist:**
- [ ] ✅ Complete quiz system with timer works
- [ ] ✅ Complete quiz timer functionality with time limits
- [ ] ✅ Timer counts down with warnings

Please help me implement the quiz timer, when a arrives this page, I want to present instructions to the student. Which includes:
- Their internet connection must be stable.
- Their surounding environment must be quiet and conducive for them to take the quiz.
- Their full attention is needed
- They cannot close the tab or window while the test is ongoing.
- If the quiz time runs out without them finishing, their progress would automatically submit.
- Add other known instruction for online quizzes and assessments

You can chose the most modern way to present this.

Update the time to meet the requirement of Day 4.
The timer currently counts down, it should auto trigger submission when it elapses.
Page refresh should trigger a warning. Do not worry about tab switching though, it should just be in the instructions but we are not implementing it now.

// app/(dashboard)/student/quiz/[quizId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { QuizInterface } from "@/components/students/QuizInterface";
import { shuffleArray } from "@/lib/common/shuffler";

interface PageProps {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ topicId?: string }>;
}

// Fetch quiz data from API
async function getQuizData(quizId: string, topicId?: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = new URL(`/api/student/quiz/${quizId}`, baseUrl);

    if (topicId) {
      url.searchParams.set("topicId", topicId);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Cookie: "", // Session will be handled by getServerSession
      },
      cache: "no-store", // Ensure fresh data
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return null;
  }
}

export default async function QuizPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const { quizId } = await params;
  const { topicId } = await searchParams;

  // For server-side data fetching, we'll use Prisma directly
  // This is more efficient than making an API call to ourselves
  const { prisma } = await import("@/lib/db");

  try {
    // Fetch quiz with all related data
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        isActive: true,
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
            isActive: true,
          },
          include: {
            options: {
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!quiz) {
      notFound();
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: quiz.topic.module.course.id,
        },
        status: "ACTIVE",
      },
    });

    if (!enrollment) {
      redirect("/student/courses");
    }

    // Get student's previous attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId,
        userId: session.user.id,
        isPractice: false,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        score: true,
        passed: true,
        startedAt: true,
        completedAt: true,
        timeSpent: true,
        questionsCorrect: true,
        questionsTotal: true,
      },
    });

    // Check if student can take the quiz
    const canTakeQuiz = quiz.maxAttempts
      ? attempts.length < quiz.maxAttempts
      : true;
    const hasPassedQuiz = attempts.some((attempt) => attempt.passed);

    if (!canTakeQuiz && !hasPassedQuiz) {
      redirect(`/student/quiz/${quizId}/results`);
    }

    // Get topic progress to check prerequisites
    let topicProgress = null;
    if (topicId) {
      topicProgress = await prisma.topicProgress.findUnique({
        where: {
          userId_topicId: {
            userId: session.user.id,
            topicId,
          },
        },
      });
    }

    // Format questions for frontend (hide correct answers)
    let formattedQuestions = quiz.questions.map((question) => ({
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      points: question.points,
      hint: question.hint,
      timeLimit: question.timeLimit,
      allowPartialCredit: question.allowPartialCredit,
      caseSensitive: question.caseSensitive,
      orderIndex: question.orderIndex,
      required: true, // Assume all questions are required for now
      options:
        question.options?.map((option) => ({
          id: option.id,
          text: option.text,
          orderIndex: option.orderIndex,
          // Don't send isCorrect to frontend
        })) || [],
    }));

    // Shuffle questions if required
    if (quiz.shuffleQuestions) {
      formattedQuestions = shuffleArray(formattedQuestions);
    }

    // // Shuffle options within each question if required
    if (quiz.shuffleOptions) {
      formattedQuestions.forEach((question) => {
        if (question.options.length > 0) {
          question.options = shuffleArray(question.options);
        }
      });
    }

    const quizData = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      allowRetakes: quiz.maxAttempts ? quiz.maxAttempts > 1 : true,
      maxAttempts: quiz.maxAttempts,
      shuffleQuestions: quiz.shuffleQuestions,
      showResults: quiz.showFeedback,
      topic: {
        id: quiz.topic.id,
        title: quiz.topic.title,
        module: {
          id: quiz.topic.module.id,
          title: quiz.topic.module.title,
          course: {
            id: quiz.topic.module.course.id,
            title: quiz.topic.module.course.title,
          },
        },
      },
      questions: formattedQuestions,
    };

    const metadata = {
      totalQuestions: quiz.questions.length,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      attemptNumber: attempts.length + 1,
      attemptsRemaining: quiz.maxAttempts
        ? quiz.maxAttempts - attempts.length
        : null,
      hasPassedQuiz,
    };

    return (
      <StudentLayout>
        <QuizInterface
          quiz={quizData}
          attempts={attempts}
          userId={session.user.id}
          topicId={topicId}
          metadata={metadata}
        />
      </StudentLayout>
    );
  } catch (error) {
    console.error("Error loading quiz:", error);
    notFound();
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


Summary of Changes
The implementation includes:
✅ Day 4 Checklist Complete:

Complete quiz timer functionality ✅
Timer counts down with warnings ✅
Auto-submit when time expires ✅

Key Features Added:

Quiz Instructions Component:

Modern card-based layout with icons
Connection stability test
Comprehensive quiz guidelines
Required acknowledgment system
Connection test functionality


Enhanced Timer Functionality:

Auto-submission when timer expires
Warning notifications at 5 minutes and 1 minute
Prevents starting timer until instructions are acknowledged
Visual time warnings with color changes


Page Protection:

Browser refresh/close warning (beforeunload event)
Instructions clearly state not to close tab/window


Instructions Include:

Stable internet connection requirement
Quiet environment necessity
Full attention requirement
No tab/window closing warning
Auto-submit information
Additional standard online assessment guidelines


User Experience:

Connection test with real-time feedback
Required vs optional instruction differentiation
Clear quiz metadata display
Modern, accessible design



The quiz now provides a comprehensive pre-quiz setup experience that ensures students understand all requirements before beginning their assessment.