
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

How can I progressively globally update progress in the following components.Such that students can see their progress of course, module, and topic. Please just provide suggested code changes, I have bulk of the code already. It would be unnecessary to provide the codes I already possess. More so on the topic details page i.e. topics/[topicId]/ if students have exhausted their attempts they should be unable to see the start quiz button in the assessment section. If a module, course, topic possess an assessment student can only mark them complete if the required assessments have been passed.

// app/(dashboard)/student/courses/page.tsx
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
      EnrollmentService.getUserEnrollments(userId),
    ]);

    // Create a map of enrolled course IDs for quick lookup
    const enrolledCourseIds = new Set(
      enrollments
        .filter((e) => e.status === "ACTIVE" || e.status === "COMPLETED")
        .map((e) => e.courseId)
    );

    // Add enrollment status to courses
    const coursesWithEnrollment = coursesResult.courses.map((course) => ({
      ...course,
      isEnrolled: enrolledCourseIds.has(course.id),
      enrollment: enrollments.find((e) => e.courseId === course.id),
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
function CourseCard({ course, userId }: { course: any; userId: string }) {
  return (
    <Card className="h-full flex flex-col">
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
      

// app/(dashboard)/student/courses/[courseId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { CourseService } from "@/lib/services/courseService";
import { EnrollmentService } from "@/lib/services/enrollmentService";
import { StudentCourseOverview } from "@/components/students/StudentCourseOverview";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

async function getCourseData(courseId: string, userId: string) {
  try {
    const [course, enrollment] = await Promise.all([
      CourseService.getCourseById(courseId),
      EnrollmentService.getEnrollment(userId, courseId),
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
      />
    </StudentLayout>
  );
}

// components/students/StudentCourseOverview.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BookOpen,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle,
  Lock,
  FileText,
  Video,
  Award,
  Users,
  Calendar,
  Target,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  duration?: number;
  topicType: string;
  isRequired: boolean;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  passingScore: number;
  prerequisiteModuleId?: string;
  isRequired: boolean;
  topics: Topic[];
  _count: {
    topics: number;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  difficulty: string;
  duration: number;
  passingScore: number;
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  creator: {
    firstName: string;
    lastName: string;
  };
  modules: Module[];
  _count: {
    enrollments: number;
  };
}

interface Enrollment {
  id: string;
  status: string;
  overallProgress: number;
  enrolledAt: string;
  completedAt?: string;
}

interface StudentCourseOverviewProps {
  course: Course;
  enrollment: Enrollment;
  userId: string;
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "BEGINNER":
      return "bg-green-100 text-green-800 border-green-200";
    case "INTERMEDIATE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "ADVANCED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getTopicIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return <Video className="h-4 w-4" />;
    case "PRACTICE":
      return <Target className="h-4 w-4" />;
    case "ASSESSMENT":
      return <Award className="h-4 w-4" />;
    case "RESOURCE":
      return <FileText className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

function ModuleCard({
  module,
  isLocked,
  isExpanded,
  onToggle,
  courseId,
}: {
  module: Module;
  isLocked: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  courseId: string;
}) {
  // Mock progress data - in real app, this would come from TopicProgress
  const completedTopics = Math.floor(module.topics.length * 0.3); // 30% completion mock
  const progressPercentage =
    module.topics.length > 0
      ? Math.round((completedTopics / module.topics.length) * 100)
      : 0;

  return (
    <Card
      className={`transition-all duration-200 ${isLocked ? "opacity-60" : ""}`}
    >
      <Collapsible open={isExpanded && !isLocked} onOpenChange={onToggle}>
        <CollapsibleTrigger>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {
                    isLocked ? (
                      <Lock className="h-5 w-5 text-gray-400" />
                    ) : (
                      progressPercentage === 100 && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )
                    )
                  }
                </div>
                <div className="flex-grow">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Module {module.order}: {module.title}
                    {module.isRequired && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {module.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {module.topics.length} topics
                    </span>
                    <span className="text-xs">
                      Passing: {module.passingScore}%
                    </span>
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {progressPercentage}%
                </div>
                <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-2 bg-blue-600 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {module.description && (
              <p className="text-sm text-gray-600 mb-4">{module.description}</p>
            )}

            <div className="space-y-2">
              {module.topics.map((topic, index) => {
                const isTopicCompleted = index < completedTopics;
                const isTopicCurrent = index === completedTopics && !isLocked;

                return (
                  <div
                    key={topic.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isTopicCompleted
                        ? "bg-green-50 border-green-200"
                        : isTopicCurrent
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {isTopicCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          getTopicIcon(topic.topicType)
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{topic.title}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {topic.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {topic.duration} min
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {topic.topicType.toLowerCase()}
                          </Badge>
                          {topic.isRequired && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-1 py-0"
                            >
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isTopicCompleted || isTopicCurrent ? (
                        <Link href={`/student/topics/${topic.id}`}>
                          <Button
                            size="sm"
                            variant={isTopicCompleted ? "outline" : "default"}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            {isTopicCompleted ? "Review" : "Start"}
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="ghost" disabled>
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function StudentCourseOverview({
  course,
  enrollment,
  userId,
}: StudentCourseOverviewProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Determine which modules are locked based on prerequisites
  const getLockedModules = () => {
    const completed = new Set<string>(); // Mock - would come from ModuleProgress
    const locked = new Set<string>();

    course.modules.forEach((module) => {
      if (
        module.prerequisiteModuleId &&
        !completed.has(module.prerequisiteModuleId)
      ) {
        locked.add(module.id);
      }
    });

    return locked;
  };

  const lockedModules = getLockedModules();

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Enrolled
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-4">
                {course.shortDescription || course.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{course.duration} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span>{course.modules.length} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{course._count.enrollments} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                  <span>{course.passingScore}% to pass</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Course Progress</h3>
              <span className="text-sm font-medium">
                {enrollment.overallProgress}%
              </span>
            </div>
            <Progress value={enrollment.overallProgress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>
                Started {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </span>
              <span>
                {enrollment.completedAt
                  ? `Completed ${new Date(
                      enrollment.completedAt
                    ).toLocaleDateString()}`
                  : `${course.modules.length - lockedModules.size} of ${
                      course.modules.length
                    } modules available`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Outcomes */}
      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {course.learningOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{outcome}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Course Modules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Content</h2>

        {course.modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            isLocked={lockedModules.has(module.id)}
            isExpanded={expandedModules.has(module.id)}
            onToggle={() => toggleModule(module.id)}
            courseId={course.id}
          />
        ))}
      </div>

      {/* Course Tags */}
      {course.tags && course.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topics Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// app/(dashboard)/student/topics/[topicId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { TopicService } from "@/lib/services/topicService";
import { EnrollmentService } from "@/lib/services/enrollmentService";
import { StudentTopicViewer } from "@/components/students/StudentTopicViewer";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

async function getTopicData(topicId: string, userId: string) {
  try {
    const topic = await TopicService.getTopicById(topicId);

    if (!topic) {
      return null;
    }

    // Check if user is enrolled in the course
    const enrollment = await EnrollmentService.getEnrollment(
      userId,
      topic.module.course.id
    );

    if (!enrollment || enrollment.status !== "ACTIVE") {
      return null;
    }

    // Check if topic is accessible (prerequisites met)
    // In real app, this would check TopicProgress for prerequisite completion
    const canAccess = true; // Simplified for now

    return {
      topic,
      enrollment,
      canAccess,
    };
  } catch (error) {
    console.error("Error fetching topic data:", error);
    return null;
  }
}

export default async function StudentTopicDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { topicId } = await params;
  const data = await getTopicData(topicId, session.user.id);

  if (!data || !data.canAccess) {
    notFound();
  }

  const { topic, enrollment } = data;

  return (
    <StudentLayout title={topic.title} description={`${topic.description}`}>
      <StudentTopicViewer
        topic={topic}
        enrollment={enrollment}
        userId={session.user.id}
      />
    </StudentLayout>
  );
}

// components/students/StudentTopicViewer.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Play,
  FileText,
  Video,
  Award,
  Target,
  AlertTriangle,
  User,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { StudentCourseService } from "@/lib/services/student/courseService";

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: Array<{
    id: string;
    questionType: string;
    points: number;
  }>;
}

interface Topic {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  orderIndex: number;
  duration?: number;
  topicType: string;
  videoUrl?: string;
  attachments: string[];
  passingScore: number;
  maxAttempts?: number;
  isRequired: boolean;
  allowSkip: boolean;
  prerequisiteTopic?: {
    id: string;
    title: string;
  };
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
      creator: {
        firstName: string;
        lastName: string;
      };
    };
  };
  quizzes: Quiz[];
}

interface Enrollment {
  id: string;
  status: string;
  overallProgress: number;
}

interface StudentTopicViewerProps {
  topic: Topic;
  enrollment: Enrollment;
  userId: string;
}

function getTopicIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return <Video className="h-5 w-5" />;
    case "PRACTICE":
      return <Target className="h-5 w-5" />;
    case "ASSESSMENT":
      return <Award className="h-5 w-5" />;
    case "RESOURCE":
      return <FileText className="h-5 w-5" />;
    default:
      return <BookOpen className="h-5 w-5" />;
  }
}

function getTopicTypeColor(type: string) {
  switch (type) {
    case "VIDEO":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "PRACTICE":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ASSESSMENT":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "RESOURCE":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function StudentTopicViewer({
  topic,
  enrollment,
  userId,
}: StudentTopicViewerProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressStarted, setProgressStarted] = useState(false);

  // Mock progress tracking - in real app this would sync with TopicProgress
  useEffect(() => {
    // Mark as started when component mounts
    if (!progressStarted) {
      setProgressStarted(true);
      // In real app: call API to update TopicProgress status to IN_PROGRESS
      console.log("Marking topic as started:", topic.id);
    }
  }, [topic.id, progressStarted]);

  const handleMarkComplete = async () => {
    try {
      const res = await fetch(`/api/student/topics/${topic.id}/mark-complete`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Marking topic as completed:", topic.id);
        setIsCompleted(true);
      } else {
        if (!res.ok) throw new Error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to mark topic as completed:", error);
    }
  };

  const handleStartQuiz = (quizId: string) => {
    router.push(`/student/quiz/${quizId}?topicId=${topic.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link
          href={`/student/courses/${topic.module.course.id}`}
          className="hover:text-gray-700 flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          {topic.module.course.title}
        </Link>
        <span>/</span>
        <span>{topic.module.title}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">{topic.title}</span>
      </nav>

      {/* Topic Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getTopicTypeColor(topic.topicType)}>
                  {getTopicIcon(topic.topicType)}
                  <span className="ml-1">{topic.topicType}</span>
                </Badge>
                {topic.isRequired && (
                  <Badge variant="secondary">Required</Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>

              <CardTitle className="text-2xl mb-2">{topic.title}</CardTitle>

              {topic.description && (
                <p className="text-gray-600 mb-4">{topic.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {topic.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{topic.duration} minutes</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span>{topic.passingScore}% to pass</span>
                </div>
                {topic.maxAttempts && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                    <span>{topic.maxAttempts} attempts max</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>
                    {topic.module.course.creator.firstName}{" "}
                    {topic.module.course.creator.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Prerequisite Warning */}
      {topic.prerequisiteTopic && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Prerequisite Required</span>
            </div>
            <p className="text-orange-700 mt-1">
              Complete "{topic.prerequisiteTopic.title}" before accessing this
              topic.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Video Content */}
      {topic.videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Video Player</p>
                <p className="text-sm text-gray-400">URL: {topic.videoUrl}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: topic.content }}
          />
        </CardContent>
      </Card>

      {/* Attachments */}
      {topic.attachments && topic.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resources & Attachments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {topic.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Resource {index + 1}</span>
                    <span className="text-sm text-gray-500">{attachment}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quizzes */}
      {topic.quizzes && topic.quizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topic.quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{quiz.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{quiz.questions.length} questions</span>
                      <span>Passing: {quiz.passingScore}%</span>
                      <span>
                        Total:{" "}
                        {quiz.questions.reduce((sum, q) => sum + q.points, 0)}{" "}
                        points
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => handleStartQuiz(quiz.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              {!isCompleted && (
                <p className="text-sm text-gray-600 mb-2">
                  Mark this topic as complete when you're done studying the
                  material.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {topic.allowSkip && !topic.isRequired && (
                <Button variant="outline">Skip Topic</Button>
              )}
              {!isCompleted ? (
                <Button onClick={handleMarkComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              ) : (
                <Button variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Link href={`/student/courses/${topic.module.course.id}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </Link>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Topic {topic.orderIndex} in {topic.module.title}
          </p>
        </div>

        <Button variant="outline" disabled>
          Next Topic
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
