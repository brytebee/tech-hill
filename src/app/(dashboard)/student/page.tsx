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
