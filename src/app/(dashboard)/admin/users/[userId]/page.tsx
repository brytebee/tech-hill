// app/(dashboard)/admin/users/[userId]/page.tsx
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
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
  Edit,
  Trash2,
  BookOpen,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Clock,
  GraduationCap,
  FileText,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { UserService } from "@/lib/services/userService";

async function getUserDetails(userId: string) {
  try {
    const user = await UserService.getUserById(userId);
    return user;
  } catch (error) {
    console.error("Fetching user error", error);
    return null;
  }
}

interface UserDetailsPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { userId } = await params;
  const user = await getUserDetails(userId);

  if (!user) {
    notFound();
  }

  const statusVariant =
    user.status === "ACTIVE"
      ? "default"
      : user.status === "INACTIVE"
      ? "secondary"
      : "destructive";

  const roleVariant =
    user.role === "ADMIN"
      ? "destructive"
      : user.role === "MANAGER"
      ? "default"
      : "secondary";

  return (
    <AdminLayout
      title={`${user.firstName} ${user.lastName}`}
      description="User details and management"
    >
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant={statusVariant}>{user.status}</Badge>
              <Badge variant={roleVariant}>{user.role}</Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/admin/users/${user.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            </Link>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* User Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user._count?.enrollments || 0}
              </div>
              <p className="text-xs text-muted-foreground">Courses enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user._count?.certificates || 0}
              </div>
              <p className="text-xs text-muted-foreground">Earned certificates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user._count?.quizAttempts || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total attempts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user._count?.submissions || 0}
              </div>
              <p className="text-xs text-muted-foreground">Assignment submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* User Information */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-600">Full Name</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-600">Email Address</p>
                </div>
              </div>

              {user.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{user.phoneNumber}</p>
                    <p className="text-sm text-gray-600">Phone Number</p>
                  </div>
                </div>
              )}

              {user.dateOfBirth && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {new Date(user.dateOfBirth).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                  </div>
                </div>
              )}

              {user.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{user.address}</p>
                    <p className="text-sm text-gray-600">Address</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Role</h4>
                  <Badge variant={roleVariant}>{user.role}</Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <Badge variant={statusVariant}>{user.status}</Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Member Since</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Last Updated</p>
                </div>
              </div>

              {user.lastLoginAt && (
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {new Date(user.lastLoginAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Last Login</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Course Enrollments */}
        {user.enrollments && user.enrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollments</CardTitle>
              <CardDescription>
                Courses this user is currently enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{enrollment.course.title}</h4>
                      <p className="text-sm text-gray-600">
                        {enrollment.course.shortDescription}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>
                          Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                        <Badge variant="outline">
                          {enrollment.course.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-green-600">
                        {enrollment.overallProgress}%
                      </div>
                      <p className="text-xs text-gray-500">Progress</p>
                      {enrollment.completedAt && (
                        <Badge variant="default" className="mt-1">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Created Courses (for instructors/admins) */}
        {user.createdCourses && user.createdCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Created Courses</CardTitle>
              <CardDescription>
                Courses created by this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.createdCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{course.title}</h4>
                      <p className="text-sm text-gray-600">
                        {course.shortDescription}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>
                          Created: {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                        <span>{course._count.enrollments} students</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <Badge
                        variant={
                          course.status === "PUBLISHED"
                            ? "default"
                            : course.status === "DRAFT"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {course.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        ${course.price > 0 ? course.price : "Free"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Certificates */}
        {user.certificates && user.certificates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>
                Certificates earned by this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.certificates.slice(0, 5).map((certificate) => (
                  <div
                    key={certificate.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">{certificate.course.title}</p>
                        <p className="text-sm text-gray-600">
                          Certificate ID: {certificate.certificateNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(certificate.issuedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">Issued</p>
                    </div>
                  </div>
                ))}
                {user.certificates.length > 5 && (
                  <p className="text-center text-sm text-gray-500 pt-2">
                    And {user.certificates.length - 5} more certificates...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State for Students with no activity */}
        {(!user.enrollments || user.enrollments.length === 0) &&
          (!user.createdCourses || user.createdCourses.length === 0) &&
          (!user.certificates || user.certificates.length === 0) && (
            <Card>
              <CardContent className="text-center py-12">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Activity Yet
                </h3>
                <p className="text-gray-600">
                  This user hasn't enrolled in any courses or earned any certificates yet.
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </AdminLayout>
  );
}