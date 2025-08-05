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
import { EnrollButton } from "@/components/student/EnrollButton";

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
          difficulty: searchParams.difficulty as any,
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
            defaultValue={searchParams.difficulty || ""}
            name="difficulty"
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
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
                {resolvedSearchParams.search || resolvedSearchParams.difficulty
                  ? "Try adjusting your search criteria"
                  : "No courses are currently available"}
              </p>
              {(resolvedSearchParams.search ||
                resolvedSearchParams.difficulty) && (
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
