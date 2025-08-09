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

## **Day 3 Prompt: Student Learning Interface**

```
Day 3 of Course Management System development. Core database operations and layouts are complete.

COMPLETED YESTERDAY:
- Database service functions for CRUD operations ✅
- API routes for users and courses ✅
- Role-based layouts for all user types ✅
- Admin dashboard with user management ✅
- Student dashboard showing courses ✅

DAY 3 FOCUS: Student Learning Experience
Today I'm building the core learning interface where students interact with course content.

GOALS:
1. Build course overview/details page showing topics and progress
2. Create topic list with visual progress indicators
3. Implement topic content display page with rich content
4. Add progress tracking when students access topics
5. Build basic quiz interface for question display
6. Implement quiz answer submission system
7. Create quiz results page with score display
8. Update UserProgress based on quiz performance

KEY FEATURES TO IMPLEMENT:
- Topic progression logic (NOT_STARTED → IN_PROGRESS → COMPLETED)
- Progress bars and visual indicators
- Quiz taking functionality with different question types
- Score calculation and pass/fail logic (80% pass score except data shows otherwise)

SUCCESS CRITERIA FOR TODAY:
- Students can view course content and navigate topics
- Topic access updates progress status automatically
- Basic quiz taking works with score calculation
- Quiz results are stored and displayed
- Progress updates reflect learning activity

Please help me start with the course overview page and topic navigation system.
```



Student Learning Interface
- [ ] Build course overview page for students
- [ ] Create topic list with progress indicators
- [ ] Implement topic content display page
- [ ] Add progress tracking when topics are accessed
- [ ] Build basic quiz interface (question display)
- [ ] Implement quiz answer submission
- [ ] Create quiz results page
- [ ] Update user progress based on quiz scores

Checklist:
- [ ] ✅ Students can view course content
- [ ] ✅ Topic progression works (NOT_STARTED → IN_PROGRESS)
- [ ] ✅ Basic quiz taking functionality works
- [ ] ✅ Quiz scores are calculated and stored
- [ ] ✅ Progress updates automatically

Brief description:
Pages you are building start from the student course details page. This should nicely arranges course into modules that are foldable. Within the modules, topics are also foldable/hiddable. You can use a colapsable sidebar to achieve this or use any modern design that bests help student navigate easily. Even when the modules are available in the page, they should be locked until other modules are completed and marked as complete or if skippable, skipped. Based on the completed per total modules in the course the progress visual which you should add, should updated accordingly on the learning page. 


Artifacts:
app/(dashboard)/student/courses/[courseId]
app/(dashboard)/student/topics  // maybe title list only that redirects to topic details with 
app/(dashboard)/student/topics/[topicId]
quiz interface, be creative, modern but light on styling as you'd see from the provided components below, emphasis is currenlty on functinality and not design, so design is light. However, I'd like a quiz interface where questions are displayed one after the other, a timer, question number/total, some quiz details, user details, etc.

Optional:
Should you decide to use a sidebar
Artifact should be:
components/students/sidebar
components/breadcrumbs/student

My project structure take the format of api, services, forms, pages. Create just the other assets, I'll provide the APIs and components for cues. File structure:
- components/students/**  // reusable components
- components/forms/**  // forms
- app/(dashboard)/student/** // pages
- lib/services/student/** // services such as course-actions specific for students
Naming pattern: lower-case */

API

// app/api/courses/[courseId]/route.ts 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CourseService } from '@/lib/services/courseService'
import { z } from 'zod'

const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().optional(),
  thumbnail: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  duration: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  syllabus: z.string().optional(),
  learningOutcomes: z.array(z.string()).optional(),
})

// GET /api/courses/[courseId] - Get course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = params
    const course = await CourseService.getCourseById(courseId)

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Students can only view published courses
    if (session.user.role === 'STUDENT' && course.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Course not available' }, { status: 403 })
    }

    // Managers can only view their own courses (unless admin)
    if (session.user.role === 'MANAGER' && course.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('GET /api/courses/[courseId] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

SERVICES
// lib/services/courseService.ts
static async getCourseById(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      modules: {
        orderBy: { order: "asc" },
        include: {
          topics: {
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              title: true,
              duration: true,
              topicType: true,
              isRequired: true,
            },
          },
          _count: {
            select: {
              topics: true,
            },
          },
        },
      },
      enrollments: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
  });

  if (!course) return null;

  // Convert Decimal to number for client component compatibility
  return {
    ...course,
    price: course.price ? Number(course.price) : 0,
  };
}
// lib/services/topicService.ts
export class TopicService {
  // other services already here, so just use these and show getTopicsByCourse if needed.
  // Get topic by ID
  static async getTopicById(id: string) {
    return await prisma.topic.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                creator: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        prerequisiteTopic: {
          select: {
            id: true,
            title: true,
          },
        },
        dependentTopics: {
          select: {
            id: true,
            title: true,
          },
        },
        quizzes: {
          where: { isActive: true },
          include: {
            questions: {
              select: {
                id: true,
                questionType: true,
                points: true,
              },
            },
          },
        },
      },
    });
  }
  // Get topics by module
  static async getTopicsByModule(moduleId: string) {
    return await prisma.topic.findMany({
      where: { moduleId },
      orderBy: { orderIndex: "asc" },
      include: {
        prerequisiteTopic: {
          select: {
            id: true,
            title: true,
          },
        },
        quizzes: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            passingScore: true,
          },
        },
      },
    });
  }

  // We could introduce getTopicsByCourse if needed

}

COMPONENTS
For design cues I'll provide my student Courses page which is wrapped in StudentLayout

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
  X
} from "lucide-react";
import Link from "next/link";
import { EnrollmentService } from "@/lib/services/enrollmentService";
import { CourseService } from "@/lib/services/courseService";
import { EnrollButton } from "@/components/students/EnrollButton";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    difficulty?: string;
    page?: string;
  }>;
}

async function getCoursesData(userId: string, searchParams: {
  search?: string;
  difficulty?: string;
  page?: string;
}) {
  try {
    const page = parseInt(searchParams.page || '1');
    const limit = 12;

    const [coursesResult, enrollments] = await Promise.all([
      CourseService.getCourses({
        status: "PUBLISHED",
        search: searchParams.search,
        difficulty: searchParams.difficulty === 'none' ? undefined : searchParams.difficulty as any,
      }, page, limit),
      EnrollmentService.getUserEnrollments(userId),
    ]);

    // Create a map of enrolled course IDs for quick lookup
    const enrolledCourseIds = new Set(
      enrollments
        .filter(e => e.status === 'ACTIVE' || e.status === 'COMPLETED')
        .map(e => e.courseId)
    );

    // Add enrollment status to courses
    const coursesWithEnrollment = coursesResult.courses.map(course => ({
      ...course,
      isEnrolled: enrolledCourseIds.has(course.id),
      enrollment: enrollments.find(e => e.courseId === course.id),
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
    case 'BEGINNER':
      return 'bg-green-100 text-green-800';
    case 'INTERMEDIATE':
      return 'bg-yellow-100 text-yellow-800';
    case 'ADVANCED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
                <span className="font-medium">{course.enrollment.overallProgress}%</span>
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
                  {course.enrollment?.overallProgress > 0 ? 'Continue' : 'Start'}
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

function SearchAndFilters({ searchParams }: { 
  searchParams: {
    search?: string;
    difficulty?: string;
    page?: string;
  }
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
                defaultValue={searchParams.search || ''}
                name="search"
                className="pl-10"
              />
            </div>
          </div>
          
          <Select defaultValue={searchParams.difficulty || 'none'} name="difficulty">
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

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2">
      <Button
        variant="outline"
        disabled={currentPage <= 1}
        size="sm"
      >
        Previous
      </Button>
      
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      
      <Button
        variant="outline"
        disabled={currentPage >= totalPages}
        size="sm"
      >
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

  const enrolledCount = enrollments.filter(e => 
    e.status === 'ACTIVE' || e.status === 'COMPLETED'
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
                {resolvedSearchParams.search || (resolvedSearchParams.difficulty && resolvedSearchParams.difficulty !== 'none')
                  ? "Try adjusting your search criteria"
                  : "No courses are currently available"
                }
              </p>
              {(resolvedSearchParams.search || (resolvedSearchParams.difficulty && resolvedSearchParams.difficulty !== 'none')) && (
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
