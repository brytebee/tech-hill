
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

// app/(dashboard)/student/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award, TrendingUp, Play } from "lucide-react";
import Link from "next/link";
import { EnrollmentService } from "@/lib/services/enrollmentService";
import { CourseService } from "@/lib/services/courseService";

async function getStudentData(userId: string) {
  try {
    const [enrollments, availableCourses] = await Promise.all([
      EnrollmentService.getUserEnrollments(userId),
      CourseService.getCourses({ status: "PUBLISHED" }, 1, 10),
    ]);

    return {
      enrollments,
      availableCourses: availableCourses.courses,
    };
  } catch (error) {
    console.error("Error fetching student data:", error);
    return {
      enrollments: [],
      availableCourses: [],
    };
  }
}

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { enrollments, availableCourses } = await getStudentData(
    session.user.id
  );

  const totalTimeSpent = enrollments.reduce(
    (total, enrollment) => total + (enrollment.totalTimeSpent || 0),
    0
  );

  const completedCourses = enrollments.filter(
    (e) => e.status === "COMPLETED"
  ).length;
  const overallProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + e.overallProgress, 0) /
            enrollments.length
        )
      : 0;

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.firstName}!
          </h2>
          <p className="text-gray-600">
            Continue your learning journey and build your computer skills.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Courses Enrolled
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
              <p className="text-xs text-muted-foreground">
                {enrollments.length === 0
                  ? "Start learning today"
                  : "Active enrollments"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(totalTimeSpent / 60)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Total learning time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCourses}</div>
              <p className="text-xs text-muted-foreground">Courses completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallProgress}%</div>
              <p className="text-xs text-muted-foreground">
                Overall completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses & Available Courses */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Continue where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length > 0 ? (
                <div className="space-y-4">
                  {enrollments.slice(0, 3).map((enrollment) => (
                    <div key={enrollment.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">
                        {enrollment.course.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {enrollment.overallProgress}% complete
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${enrollment.overallProgress}%` }}
                          />
                        </div>
                        <Link href={`/student/courses/${enrollment.course.id}`}>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {enrollments.length > 3 && (
                    <Link href="/student/courses">
                      <Button variant="outline" className="w-full">
                        View All Courses
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-600 mb-2">
                    No enrolled courses
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Browse available courses to start learning
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Courses</CardTitle>
              <CardDescription>
                Start your computer literacy journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableCourses.slice(0, 3).map((course) => (
                  <div key={course.id} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{course.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {course.shortDescription ||
                        course.description.substring(0, 100) + "..."}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {course.difficulty} • {course.duration}h
                      </span>
                      <Button size="sm">Enroll</Button>
                    </div>
                  </div>
                ))}
                <Link href="/student/courses">
                  <Button variant="outline" className="w-full">
                    Browse All Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}

// app/(dashboard)/student/courses/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Award,
  Play,
  Search,
  Filter,
  CheckCircle,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { EnrollmentService } from "@/lib/services/enrollmentService";
import { CourseService } from "@/lib/services/courseService";
import { EnrollButton } from "@/components/students/EnrollButton";
import { prisma } from "@/lib/db";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    difficulty?: string;
    page?: string;
  }>;
}

async function getCoursesData(
  userId: string,
  searchParams: {
    search?: string;
    difficulty?: string;
    page?: string;
  }
) {
  try {
    const page = parseInt(searchParams.page || "1");
    const limit = 12;

    const [coursesResult, enrollments] = await Promise.all([
      CourseService.getCourses(
        {
          status: "PUBLISHED",
          search: searchParams.search,
          difficulty:
            searchParams.difficulty === "none"
              ? undefined
              : (searchParams.difficulty as any),
        },
        page,
        limit
      ),
      // Enhanced to include progress data
      prisma.enrollment.findMany({
        where: {
          userId,
          status: { in: ["ACTIVE", "COMPLETED"] },
        },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  progress: {
                    where: { userId },
                  },
                  topics: {
                    include: {
                      progress: {
                        where: { userId },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Create a map of enrolled course IDs with enhanced progress data
    const enrollmentMap = new Map();
    enrollments.forEach((enrollment) => {
      enrollmentMap.set(enrollment.courseId, {
        ...enrollment,
        detailedProgress: {
          modulesCompleted: enrollment.course.modules.filter(
            (module) =>
              module.progress.length > 0 &&
              module.progress[0].status === "COMPLETED"
          ).length,
          totalModules: enrollment.course.modules.length,
          topicsCompleted: enrollment.course.modules.flatMap((module) =>
            module.topics.filter(
              (topic) =>
                topic.progress.length > 0 &&
                topic.progress[0].status === "COMPLETED"
            )
          ).length,
          totalTopics: enrollment.course.modules.flatMap(
            (module) => module.topics
          ).length,
        },
      });
    });

    // Add enrollment status to courses
    const coursesWithEnrollment = coursesResult.courses.map((course) => ({
      ...course,
      isEnrolled: enrollmentMap.has(course.id),
      enrollment: enrollmentMap.get(course.id),
    }));

    return {
      courses: coursesWithEnrollment,
      totalPages: coursesResult.totalPages,
      totalCourses: coursesResult.totalCourses,
      currentPage: page,
      enrollments,
    };
  } catch (error) {
    console.error("Error fetching courses data:", error);
    return {
      courses: [],
      totalPages: 1,
      totalCourses: 0,
      currentPage: 1,
      enrollments: [],
    };
  }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "BEGINNER":
      return "bg-green-100 text-green-800";
    case "INTERMEDIATE":
      return "bg-yellow-100 text-yellow-800";
    case "ADVANCED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function CourseCard({ course, userId }: { course: any; userId: string }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge className={getDifficultyColor(course.difficulty)}>
            {course.difficulty}
          </Badge>
          {course.isEnrolled && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <UserCheck className="h-3 w-3 mr-1" />
              Enrolled
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {course.shortDescription || course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration} hours
          </div>

          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {course.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{course.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {course.isEnrolled && course.enrollment && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">
                  {course.enrollment.overallProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${course.enrollment.overallProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {course.isEnrolled ? (
            <>
              <Link href={`/student/courses/${course.id}`} className="flex-1">
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  {course.enrollment?.overallProgress > 0
                    ? "Continue"
                    : "Start"}
                </Button>
              </Link>
              <EnrollButton
                courseId={course.id}
                isEnrolled={true}
                variant="outline"
                size="default"
              >
                <X className="h-4 w-4" />
              </EnrollButton>
            </>
          ) : (
            <EnrollButton
              courseId={course.id}
              isEnrolled={false}
              className="w-full"
            >
              Enroll Now
            </EnrollButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SearchAndFilters({
  searchParams,
}: {
  searchParams: {
    search?: string;
    difficulty?: string;
    page?: string;
  };
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                defaultValue={searchParams.search || ""}
                name="search"
                className="pl-10"
              />
            </div>
          </div>

          <Select
            defaultValue={searchParams.difficulty || "none"}
            name="difficulty"
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {/* TODO: Watch out for the "none" here and ensure it's not a source of bugs */}
              <SelectItem value="none">All Levels</SelectItem>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit">Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2">
      <Button variant="outline" disabled={currentPage <= 1} size="sm">
        Previous
      </Button>

      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <Button variant="outline" disabled={currentPage >= totalPages} size="sm">
        Next
      </Button>
    </div>
  );
}

export default async function StudentCoursesPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams;

  const { courses, totalPages, totalCourses, currentPage, enrollments } =
    await getCoursesData(session.user.id, resolvedSearchParams);

  const enrolledCount = enrollments.filter(
    (e) => e.status === "ACTIVE" || e.status === "COMPLETED"
  ).length;

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-1">
              Discover and manage your computer literacy courses
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {totalCourses} Available
            </div>
            <div className="flex items-center">
              <UserCheck className="h-4 w-4 mr-1" />
              {enrolledCount} Enrolled
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <form method="GET">
          <SearchAndFilters searchParams={resolvedSearchParams} />
        </form>

        {/* Course Grid */}
        {courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  userId={session.user.id}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </>
        ) : (
          /* Empty State */
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500 mb-4">
                {resolvedSearchParams.search ||
                (resolvedSearchParams.difficulty &&
                  resolvedSearchParams.difficulty !== "none")
                  ? "Try adjusting your search criteria"
                  : "No courses are currently available"}
              </p>
              {(resolvedSearchParams.search ||
                (resolvedSearchParams.difficulty &&
                  resolvedSearchParams.difficulty !== "none")) && (
                <Link href="/student/courses">
                  <Button variant="outline">Clear Filters</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}

// app/(dashboard)/student/courses/[courseId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { CourseService } from "@/lib/services/courseService";
import { EnrollmentService } from "@/lib/services/enrollmentService";
import { StudentCourseOverview } from "@/components/students/StudentCourseOverview";
import { ProgressService } from "@/lib/services/progressService";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

async function getCourseData(courseId: string, userId: string) {
  try {
    const [course, enrollment, progressData] = await Promise.all([
      CourseService.getCourseById(courseId),
      EnrollmentService.getEnrollment(userId, courseId),
      ProgressService.getCourseProgressData(userId, courseId),
    ]);

    if (!course) {
      return null;
    }

    // Only allow access to published courses for students
    if (course.status !== "PUBLISHED") {
      return null;
    }

    return {
      course,
      enrollment,
      progressData,
    };
  } catch (error) {
    console.error("Error fetching course data:", error);
    return null;
  }
}

export default async function StudentCourseDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId } = await params;
  const data = await getCourseData(courseId, session.user.id);

  if (!data) {
    notFound();
  }

  const { course, enrollment } = data;

  if (!course) {
    redirect("/student");
  }
  // Check if user is enrolled
  if (!enrollment || enrollment.status !== "ACTIVE") {
    redirect(`/student/courses?enroll=${courseId}`);
  }

  // Serialize the course data to handle Decimal and Date objects
  const serializedCourse = {
    ...course,
    createdAt: course.createdAt?.toISOString(),
    updatedAt: course.updatedAt?.toISOString(),
    publishedAt: course.publishedAt?.toISOString(),
  };

  // Serialize the enrollment data
  const serializedEnrollment = {
    ...enrollment,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    completedAt: enrollment.completedAt?.toISOString(),
    lastAccessAt: enrollment.lastAccessAt?.toISOString(),
  };

  return (
    <StudentLayout
      title={serializedCourse.title}
      description={serializedCourse.shortDescription as string}
    >
      <StudentCourseOverview
        course={serializedCourse}
        enrollment={serializedEnrollment}
        userId={session.user.id}
        progressData={data.progressData}
      />
    </StudentLayout>
  );
}
