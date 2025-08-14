Note: The system is built with NextJS 15 

// Course Structure
enum CourseStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

model Course {
  id            String         @id @default(cuid())
  title         String
  description   String         @db.Text
  shortDescription String?
  thumbnail     String?
  status        CourseStatus   @default(DRAFT)
  difficulty    DifficultyLevel @default(BEGINNER)
  duration      Int            // Duration in hours
  price         Decimal        @default(0) @db.Decimal(10, 2)
  tags          String[]
  prerequisites String[]
  
  // Content
  syllabus      String?        @db.Text
  learningOutcomes String[]
  
  // Assessment Requirements
  passingScore  Int            @default(80) // Overall course passing percentage
  requireSequentialCompletion Boolean @default(true) // Must complete modules in order
  allowRetakes  Boolean        @default(true)
  maxAttempts   Int?           // Null = unlimited attempts
  
  // Timestamps
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  publishedAt   DateTime?
  
  // Relations
  creatorId     String
  creator       User           @relation("CourseCreator", fields: [creatorId], references: [id])
  modules       Module[]
  enrollments   Enrollment[]
  certificates  Certificate[]
  
  @@map("courses")
}

// Enhanced Module with Assessment Requirements
model Module {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  order       Int
  duration    Int      // Duration in minutes
  
  // Assessment Requirements
  passingScore Int     @default(80) // Module passing percentage
  prerequisiteModuleId String? // Must complete this module first
  isRequired   Boolean @default(true) // Can skip if false
  unlockDelay  Int?    // Hours to wait before unlock (for spaced learning)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  prerequisiteModule Module? @relation("ModulePrerequisites", fields: [prerequisiteModuleId], references: [id])
  dependentModules Module[] @relation("ModulePrerequisites")
  topics      Topic[]
  progress    ModuleProgress[]
  
  @@map("modules")
}

// Topics (Individual learning units within modules)
model Topic {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique // URL-friendly identifier
  description String?    @db.Text
  content     String     @db.Text // Rich text content
  orderIndex  Int        // Sequence within module
  duration    Int?       // Duration in minutes
  
  // Topic Type & Content
  topicType   TopicType  @default(LESSON)
  videoUrl    String?    // For video topics
  attachments String[]   // File URLs for resources
  
  // Assessment Requirements
  passingScore Int       @default(80) // Topic passing percentage
  maxAttempts  Int?      // Per topic attempt limit
  isRequired   Boolean   @default(true)
  allowSkip    Boolean   @default(false) // Can skip if struggling
  
  // Prerequisites within module
  prerequisiteTopicId String?
  
  // Timestamps
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  // Relations
  moduleId    String
  module      Module     @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  prerequisiteTopic Topic? @relation("TopicPrerequisites", fields: [prerequisiteTopicId], references: [id])
  dependentTopics Topic[] @relation("TopicPrerequisites")
  
  quizzes     Quiz[]
  progress    TopicProgress[]
  submissions Submission[]
  
  @@map("topics")
}

enum TopicType {
  LESSON       // Text/video content
  PRACTICE     // Interactive exercises
  ASSESSMENT   // Graded quiz/test
  RESOURCE     // Downloadable materials
}

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

model ModuleProgress {
  id            String         @id @default(cuid())
  userId        String
  moduleId      String
  status        ProgressStatus @default(NOT_STARTED)
  
  // Progress Metrics
  progressPercentage Int         @default(0)
  currentScore  Int?            // Current average score
  bestScore     Int?            // Best attempt score
  attemptsUsed  Int            @default(0)
  timeSpent     Int            @default(0) // Minutes spent
  
  // Status Tracking
  startedAt     DateTime?
  completedAt   DateTime?
  lastAccessAt  DateTime?
  unlockedAt    DateTime?       // When module became available
  
  // Mastery Tracking
  masteryLevel  MasteryLevel   @default(NOVICE)
  strugglingAreas String[]      // Topics where student is struggling
  strongAreas   String[]       // Topics where student excels
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@unique([userId, moduleId])
  @@map("module_progress")
}

// Granular Topic Progress
model TopicProgress {
  id            String         @id @default(cuid())
  userId        String
  topicId       String
  status        ProgressStatus @default(NOT_STARTED)
  
  // Detailed Analytics
  attemptCount  Int            @default(0)
  bestScore     Int?           // Best quiz score as percentage
  averageScore  Int?           // Average across all attempts
  timeSpent     Int            @default(0) // Minutes spent on topic
  
  // Learning Analytics
  viewCount     Int            @default(0) // How many times viewed
  completionRate Int           @default(0) // Percentage of topic completed
  strugglingIndicator Boolean  @default(false) // Algorithm sets this
  masteryAchieved Boolean     @default(false)
  
  // Timestamps
  startedAt     DateTime?
  completedAt   DateTime?
  lastAccessAt  DateTime?
  
  // Spaced Repetition
  nextReviewAt  DateTime?      // When to review this topic again
  reviewCount   Int            @default(0)
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  topic Topic @relation(fields: [topicId], references: [id], onDelete: Cascade)

  @@unique([userId, topicId])
  @@map("topic_progress")
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


http://localhost:3000/admin/quizzes/cme9tre2x0005pp1fo6www1lc/questions
All questions of the quiz should be fetched and rendered. I added a component so you can take design cues from it, thank you.

// app/(dashboard)/admin/quizzes/[quizId]/questions/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
// example. import { QuestionList } from "@/components/questions/question-list";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

interface CreateQuestionPageProps {
  params: {
    quizId: string;
  };
}

export default async function CreateQuestionPage({
  params,
}: CreateQuestionPageProps) {
  const { quizId } = await params;

  // Fetch all questions for a quiz
  const questions = await prisma.question.findMany({
    where: { quizId },
    include: {
      quiz: {
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
        },
      },
    },
  });

  if (!questions) {
    notFound();
  }

  if (questions.length === 0) {
    redirect(`/admin/quizzes${quizId}/builder`);
  }

  return (
    <AdminLayout
      title={`${questions[0].quiz.title} Questions`}
      description={`All questions for "${questions[0].quiz.title}" quiz`}
    >
      <p>Hi there!</p>
      {/* TODO: Convert the QuestionForm below to a question list */}
      {/* List should be rendered here */}
    </AdminLayout>
  );
}


http://localhost:3000/student/quiz/[quidId]?topicId=[topicId]
create an endpoint for this and replace the page with real data.

// app/(dashboard)/student/quiz/[quizId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { QuizInterface } from "@/components/students/QuizInterface";

interface PageProps {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ topicId?: string }>;
}

// Mock quiz data - replace this with real data
async function getQuizData(quizId: string, userId: string) {
  try {
    // Mock data structure
    const quiz = {
      id: quizId,
      title: "Introduction to Computer Basics Quiz",
      description: "Test your understanding of computer fundamentals",
      passingScore: 80,
      timeLimit: 30, // minutes
      allowRetakes: true,
      maxAttempts: 3,
      shuffleQuestions: true,
      showResults: true,
      topic: {
        id: "topic-1",
        title: "Computer Fundamentals",
        module: {
          title: "Introduction Module",
          course: {
            id: "course-1",
            title: "Computer Literacy Basics",
          },
        },
      },
      questions: [
        {
          id: "q1",
          questionText: "What does CPU stand for?",
          questionType: "MULTIPLE_CHOICE",
          points: 5,
          required: true,
          options: [
            { id: "opt1", text: "Central Processing Unit", isCorrect: true },
            { id: "opt2", text: "Computer Personal Unit", isCorrect: false },
            { id: "opt3", text: "Central Program Unit", isCorrect: false },
            { id: "opt4", text: "Computer Processing Unit", isCorrect: false },
          ],
        },
        {
          id: "q2",
          questionText:
            "Which of the following are input devices? (Select all that apply)",
          questionType: "MULTIPLE_SELECT",
          points: 10,
          required: true,
          options: [
            { id: "opt1", text: "Keyboard", isCorrect: true },
            { id: "opt2", text: "Mouse", isCorrect: true },
            { id: "opt3", text: "Monitor", isCorrect: false },
            { id: "opt4", text: "Microphone", isCorrect: true },
            { id: "opt5", text: "Printer", isCorrect: false },
          ],
        },
        {
          id: "q3",
          questionText: "RAM stands for Random Access Memory.",
          questionType: "TRUE_FALSE",
          points: 5,
          required: true,
          options: [
            { id: "opt1", text: "True", isCorrect: true },
            { id: "opt2", text: "False", isCorrect: false },
          ],
        },
        {
          id: "q4",
          questionText: "Explain the difference between hardware and software.",
          questionType: "SHORT_ANSWER",
          points: 15,
          required: true,
          sampleAnswer:
            "Hardware refers to physical components of a computer system, while software refers to programs and applications that run on the hardware.",
        },
        {
          id: "q5",
          questionText:
            "Write a brief essay about the importance of computer literacy in today's world (minimum 100 words).",
          questionType: "ESSAY",
          points: 25,
          required: false,
          minWords: 100,
          maxWords: 500,
        },
      ],
    };

    // Check if user has attempts left
    const attempts = []; // Mock - would come from QuizAttempt service
    const canTakeQuiz = quiz.maxAttempts
      ? attempts.length < quiz.maxAttempts
      : true;

    return {
      quiz,
      attempts,
      canTakeQuiz,
    };
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return null;
  }
}

export default async function QuizPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { quizId } = await params;
  const { topicId } = await searchParams;
  const data = await getQuizData(quizId, session.user.id);

  if (!data || !data.canTakeQuiz) {
    notFound();
  }

  const { quiz, attempts } = data;

  return (
    <StudentLayout>
      <QuizInterface
        quiz={quiz}
        attempts={attempts}
        userId={session.user.id}
        topicId={topicId}
      />
    </StudentLayout>
  );
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
} from "lucide-react";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType:
    | "MULTIPLE_CHOICE"
    | "MULTIPLE_SELECT"
    | "TRUE_FALSE"
    | "SHORT_ANSWER"
    | "ESSAY";
  points: number;
  required: boolean;
  options?: QuizOption[];
  sampleAnswer?: string;
  minWords?: number;
  maxWords?: number;
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
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
  questions: QuizQuestion[];
}

interface QuizInterfaceProps {
  quiz: Quiz;
  attempts: any[];
  userId: string;
  topicId?: string;
}

type Answer = string | string[];

export function QuizInterface({
  quiz,
  attempts,
  userId,
  topicId,
}: QuizInterfaceProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [timeLeft, setTimeLeft] = useState(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

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
      // In real app: submit answers to API
      const submitData = {
        quizId: quiz.id,
        userId,
        topicId,
        answers,
        timeSpent: quiz.timeLimit
          ? quiz.timeLimit * 60 - (timeLeft || 0)
          : null,
      };

      console.log("Submitting quiz:", submitData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to results page
      router.push(`/student/quiz/${quiz.id}/results?attempt=latest`);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    const requiredQuestions = quiz.questions.filter((q) => q.required);
    const answeredRequired = requiredQuestions.filter(
      (q) => answers[q.id]
    ).length;
    return answeredRequired === requiredQuestions.length;
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const answer = answers[question.id];

    switch (question.questionType) {
      case "MULTIPLE_CHOICE":
      case "TRUE_FALSE":
        return (
          <RadioGroup
            value={(answer as string) || ""}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "MULTIPLE_SELECT":
        const selectedOptions = (answer as string[]) || [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
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
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        );

      case "SHORT_ANSWER":
        return (
          <Textarea
            placeholder="Enter your answer..."
            value={(answer as string) || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="min-h-[100px]"
          />
        );

      case "ESSAY":
        const wordCount = (((answer as string) || "").match(/\S+/g) || [])
          .length;
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Write your essay here..."
              value={(answer as string) || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Word count: {wordCount}</span>
              {question.minWords && (
                <span
                  className={
                    wordCount >= question.minWords
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  Minimum: {question.minWords} words
                </span>
              )}
            </div>
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
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
              </div>
            </div>

            <div className="text-right">
              {timeLeft !== null && (
                <div
                  className={`flex items-center gap-2 text-lg font-mono ${
                    timeLeft < 300 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  <Timer className="h-5 w-5" />
                  {formatTime(timeLeft)}
                </div>
              )}
              {attempts.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Attempt {attempts.length + 1} of {quiz.maxAttempts || "∞"}
                </p>
              )}
            </div>
          </div>
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
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Review Answers</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSubmitQuiz}
                  disabled={!canSubmit() || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
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
          Answers are saved automatically
        </p>
      </div>
    </div>
  );
}

