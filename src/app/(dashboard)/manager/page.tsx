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
import { headers } from 'next/headers';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getDashboardStats() {
  try {
    // Get the host from headers for server-side requests
    const headersList = headers()
    const host = headersList.get('host')
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`
    
    const response = await fetch(`${baseUrl}/api/dashboard/stats`, {
      cache: "no-store",
      headers: {
        // Forward the cookies for authentication
        cookie: headersList.get('cookie') || '',
      },
    });
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('Response body:', text);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
}

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getDashboardStats();
  
  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

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
              <div className="text-2xl font-bold">{stats?.courses?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.courses?.published || 0} published, {stats?.courses?.draft || 0} draft
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.enrollments?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                Across all your courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.courses?.published || 0}</div>
              <p className="text-xs text-muted-foreground">
                Live and available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Courses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.courses?.draft || 0}</div>
              <p className="text-xs text-muted-foreground">
                In development
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
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

          {/* Course Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
              <CardDescription>Summary of your course portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Published Courses</p>
                  <p className="text-sm text-green-700">
                    Ready for enrollment
                  </p>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.courses?.published || 0}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Draft Courses</p>
                  <p className="text-sm text-blue-700">In development</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.courses?.draft || 0}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">Total Enrollments</p>
                  <p className="text-sm text-purple-700">
                    Across all courses
                  </p>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.enrollments?.total || 0}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Section (shown when no courses exist) */}
        {(!stats?.courses?.total || stats.courses.total === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Create your first course to begin managing student learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No courses created yet</h3>
                <p className="mb-6 max-w-md mx-auto">
                  Start by creating your first course. You can add lessons, assignments, 
                  and track student progress all in one place.
                </p>
                <Link href="/manager/courses/new">
                  <Button size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Course
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Management Tips (shown when user has courses) */}
        {stats?.courses?.total && stats.courses.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Management Tips</CardTitle>
              <CardDescription>
                Best practices for course management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                    <h4 className="font-semibold">Keep Content Fresh</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Regularly update your course materials to maintain relevance and engagement.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-green-500 mr-2" />
                    <h4 className="font-semibold">Monitor Progress</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Track student progress and provide feedback to improve completion rates.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
                    <h4 className="font-semibold">Use Analytics</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Review reports to understand which content works best for your students.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ManagerLayout>
  );
}