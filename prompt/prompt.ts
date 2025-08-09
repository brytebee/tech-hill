Note: The system is built with NextJS 15 

enum UserRole {
  ADMIN
  MANAGER
  STUDENT
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  password      String
  firstName     String
  lastName      String
  role          UserRole    @default(STUDENT)
  status        UserStatus  @default(ACTIVE)
  profileImage  String?
  phoneNumber   String?
  dateOfBirth   DateTime?
  address       String?
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  lastLoginAt   DateTime?
  
  // NextAuth relations
  accounts      Account[]
  sessions      Session[]
  
  // Application relations
  enrollments   Enrollment[]
  createdCourses Course[]   @relation("CourseCreator")
  
  // Assessment & Progress Relations
  quizAttempts  QuizAttempt[]
  topicProgress TopicProgress[]
  moduleProgress ModuleProgress[]
  submissions   Submission[]
  certificates  Certificate[]
  
  @@map("users")
}

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

// Enhanced Enrollment with Progress Tracking
enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  DROPPED
  SUSPENDED
  ON_HOLD
}

model Enrollment {
  id              String           @id @default(cuid())
  status          EnrollmentStatus @default(ACTIVE)
  overallProgress Int              @default(0) // Overall course progress percentage
  
  // Completion & Performance
  completedAt     DateTime?
  certificateIssued Boolean        @default(false)
  finalGrade      Int?             // Final course grade percentage
  totalTimeSpent  Int              @default(0) // Total minutes spent
  
  // Attempts & Retakes
  attemptNumber   Int              @default(1)
  canRetake       Boolean          @default(true)
  nextRetakeAt    DateTime?        // When they can retake if failed
  
  // Timestamps
  enrolledAt      DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  lastAccessAt    DateTime?
  
  // Relations
  userId          String
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId        String
  course          Course           @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@unique([userId, courseId])
  @@map("enrollments")
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

// Enhanced Certificate System
enum CertificateType {
  COURSE_COMPLETION
  MASTERY_ACHIEVEMENT  
  SKILL_BADGE
  MILESTONE
}

model Certificate {
  id           String          @id @default(cuid())
  userId       String
  courseId     String
  
  certificateNumber String      @unique
  certificateType CertificateType @default(COURSE_COMPLETION)
  title        String          // "Computer Literacy Mastery"
  description  String?         // Achievement description
  
  // Performance Data
  finalScore   Int?            // Final course score
  completionTime Int?          // Days to complete
  masteryLevel MasteryLevel?   // Level achieved
  
  // Certificate Details
  issuedAt     DateTime        @default(now())
  validFrom    DateTime        @default(now())
  validUntil   DateTime?       // For certifications that expire
  templateUrl  String?         // URL to certificate template
  badgeUrl     String?         // Digital badge URL
  
  // Verification
  verificationCode String      @unique
  isRevoked    Boolean         @default(false)
  revokedAt    DateTime?
  revokedReason String?

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId, certificateType])
  @@map("certificates")
}

Create this page, its form and api. Observe the pattern of the resources below:
http://localhost:3000/admin/topics/cmdywjn7z0005pp8iqoynijv6/quizzes/create

API:
Sample below:
// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CourseService } from '@/lib/services/courseService'
import { z } from 'zod'

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().optional(),
  thumbnail: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  price: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  syllabus: z.string().optional(),
  learningOutcomes: z.array(z.string()).optional(),
})
// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can create courses
    if (session.user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)

    const courseData = {
      ...validatedData,
      creatorId: session.user.id,
    }

    const course = await CourseService.createCourse(courseData)

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('POST /api/courses error:', error)
    
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

COMPONENT:
Take design cues from the components below

// app/(dashboard)/admin/courses/create/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CourseForm } from "@/components/forms/course-form";

export default function CreateCoursePage() {
  return (
    <AdminLayout
      title="Create Course"
      description="Add a new course to the platform"
    >
      <CourseForm />
    </AdminLayout>
  );
}


// components/forms/course-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  duration: z.number().min(1, "Duration must be at least 1 hour"),
  price: z.number().min(0).optional(),
  tags: z.string().optional(),
  prerequisites: z.string().optional(),
  syllabus: z.string().optional(),
  learningOutcomes: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  course?: any;
  onSuccess?: () => void;
  isEdit?: boolean;
}

export function CourseForm({
  course,
  onSuccess,
  isEdit = false,
}: CourseFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      shortDescription: course?.shortDescription || "",
      difficulty: course?.difficulty || "BEGINNER",
      duration: course?.duration || 1,
      price: course?.price || 0,
      tags: course?.tags?.join(", ") || "",
      prerequisites: course?.prerequisites?.join(", ") || "",
      syllabus: course?.syllabus || "",
      learningOutcomes: course?.learningOutcomes?.join("\n") || "",
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/courses/${course.id}` : "/api/courses";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
        prerequisites: data.prerequisites
          ? data.prerequisites.split(",").map((req) => req.trim())
          : [],
        learningOutcomes: data.learningOutcomes
          ? data.learningOutcomes
              .split("\n")
              .filter((outcome) => outcome.trim())
          : [],
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
      }

      toast({
        title: "Success",
        description: `Course ${isEdit ? "updated" : "created"} successfully`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/courses");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Course" : "Create New Course"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update course information"
            : "Add a new course to the system"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter course title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              {...form.register("shortDescription")}
              placeholder="Brief description for course cards"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Detailed course description"
              rows={4}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("difficulty", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                {...form.register("duration", { valueAsNumber: true })}
                placeholder="Course duration"
                min="1"
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                {...form.register("price", { valueAsNumber: true })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              {...form.register("tags")}
              placeholder="Separate tags with commas (e.g., computer basics, beginner, essential skills)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <Input
              id="prerequisites"
              {...form.register("prerequisites")}
              placeholder="Separate prerequisites with commas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="syllabus">Syllabus</Label>
            <Textarea
              id="syllabus"
              {...form.register("syllabus")}
              placeholder="Course syllabus and structure"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningOutcomes">Learning Outcomes</Label>
            <Textarea
              id="learningOutcomes"
              {...form.register("learningOutcomes")}
              placeholder="Enter each learning outcome on a new line"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Course"
                : "Create Course"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
