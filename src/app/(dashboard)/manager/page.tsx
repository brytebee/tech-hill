// app/(dashboard)/manager/page.tsx
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Plus,
  Eye,
  Clock,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { CourseService } from "@/lib/services/courseService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getManagerStats(managerId: string) {
  try {
    // This would be implemented in your CourseService
    const stats = await CourseService.getManagerDashboardStats(managerId);
    return stats;
  } catch (error) {
    console.error("Error fetching manager stats:", error);
    return {
      totalCourses: 0,
      totalStudents: 0,
      totalCertificates: 0,
      recentCourses: [],
      courseStats: {
        published: 0,
        draft: 0,
        archived: 0,
      },
    };
  }
}

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

  const stats = await getManagerStats(session.user.id);

  return (
    <ManagerLayout
      title="Manager Dashboard"
      description="Overview of your courses and student progress"
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {session.user.firstName}!
          </h2>
          <p className="text-blue-100 mb-4">
            Here's an overview of your course management activities
          </p>
          <Link href="/manager/courses/new">
            <Button variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.courseStats.published} published, {stats.courseStats.draft} draft
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled across all courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCertificates}</div>
              <p className="text-xs text-muted-foreground">
                Successful completions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgCompletion || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Course completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Courses and Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Courses</CardTitle>
                  <CardDescription>
                    Your recently created or updated courses
                  </CardDescription>
                </div>
                <Link href="/manager/courses">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats.recentCourses && stats.recentCourses.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentCourses.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{course.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={
                              course.status === "PUBLISHED"
                                ? "default"
                                : course.status === "DRAFT"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {course.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {course._count?.enrollments || 0} students
                          </span>
                        </div>
                      </div>
                      <Link href={`/manager/courses/${course.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No courses created yet</p>
                  <p className="text-sm">
                    Create your first course to get started
                  </p>
                  <Link href="/manager/courses/new">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Course
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/manager/courses/new">
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-3" />
                  Create New Course
                </Button>
              </Link>
              
              <Link href="/manager/courses">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-3" />
                  Manage My Courses
                </Button>
              </Link>
              
              <Link href="/manager/students">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-3" />
                  View Students
                </Button>
              </Link>
              
              <Link href="/manager/reports">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-3" />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Course Performance Overview */}
        {stats.recentCourses && stats.recentCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>
                Overview of your course statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentCourses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{course.title}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course._count?.enrollments || 0} students
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.duration}h duration
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-1" />
                          {course._count?.certificates || 0} certificates
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {course.avgProgress || 0}%
                      </div>
                      <p className="text-xs text-gray-500">Avg. Progress</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ManagerLayout>
  );
}