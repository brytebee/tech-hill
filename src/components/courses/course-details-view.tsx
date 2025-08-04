// components/courses/course-details-view.tsx
"use client";

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
  Edit,
  Trash2,
  Users,
  BookOpen,
  Clock,
  DollarSign,
  Calendar,
  User,
  Play,
  Plus,
  Award,
  CheckCircle,
  Lock,
  Unlock,
  Star,
  Download,
} from "lucide-react";
import Link from "next/link";

type UserRole = "ADMIN" | "MANAGER" | "STUDENT";
type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface CourseDetailsViewProps {
  course: any;
  currentUser?: {
    id: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
  };
  userEnrollment?: {
    id: string;
    enrolledAt: string;
    overallProgress: number;
    completedAt?: string;
    certificateId?: string;
  } | null;
  basePath: string; // "/admin", "/manager", or "/student"
  onEnroll?: () => void;
  onUnenroll?: () => void;
  onDeleteCourse?: () => void;
  onToggleStatus?: () => void;
}

export function CourseDetailsView({ 
  course, 
  currentUser,
  userEnrollment,
  basePath, 
  onEnroll,
  onUnenroll,
  onDeleteCourse,
  onToggleStatus
}: CourseDetailsViewProps) {
  const userRole = currentUser?.role || "STUDENT";
  const isAdmin = userRole === "ADMIN";
  const isManager = userRole === "MANAGER";
  const isStudent = userRole === "STUDENT";
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin;
  const canManageModules = isAdmin || isManager;
  const isEnrolled = !!userEnrollment;
  const isCompleted = userEnrollment?.completedAt;
  const hasCertificate = userEnrollment?.certificateId;

  // Status and difficulty variants
  const statusVariant =
    course.status === "PUBLISHED"
      ? "default"
      : course.status === "DRAFT"
      ? "secondary"
      : "destructive";

  const difficultyVariant =
    course.difficulty === "BEGINNER"
      ? "secondary"
      : course.difficulty === "INTERMEDIATE"
      ? "default"
      : "destructive";

  // Check if course is accessible to student
  const canAccessCourse = () => {
    if (canEdit) return true;
    if (course.status !== "PUBLISHED") return false;
    return true;
  };

  // Render enrollment button for students
  const renderEnrollmentButton = () => {
    if (!isStudent || !canAccessCourse()) return null;

    if (isEnrolled) {
      return (
        <div className="flex space-x-2">
          {isCompleted && hasCertificate && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          )}
          <Link href={`${basePath}/courses/${course.id}/learn`}>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              {isCompleted ? "Review Course" : "Continue Learning"}
            </Button>
          </Link>
          {onUnenroll && (
            <Button variant="outline" onClick={onUnenroll}>
              Unenroll
            </Button>
          )}
        </div>
      );
    }

    const isFree = Number(course.price) === 0;
    return (
      <Button onClick={onEnroll} className="w-full md:w-auto">
        <Play className="h-4 w-4 mr-2" />
        {isFree ? "Enroll for Free" : `Enroll for $${course.price}`}
      </Button>
    );
  };

  // Render admin/manager actions
  const renderManagementActions = () => {
    if (!canEdit) return null;

    return (
      <div className="flex space-x-2">
        <Link href={`${basePath}/courses/${course.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Course
          </Button>
        </Link>
        
        {onToggleStatus && (
          <Button 
            variant="outline"
            onClick={onToggleStatus}
          >
            {course.status === "PUBLISHED" ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Unpublish
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        )}

        {canDelete && onDeleteCourse && (
          <Button variant="destructive" onClick={onDeleteCourse}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
    );
  };

  // Render student progress section
  const renderStudentProgress = () => {
    if (!isStudent || !isEnrolled) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {userEnrollment.overallProgress}%
              </span>
            </div>
            <Progress value={userEnrollment.overallProgress} className="w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Enrolled:</span>
              <p className="font-medium">
                {new Date(userEnrollment.enrolledAt).toLocaleDateString()}
              </p>
            </div>
            {isCompleted && (
              <div>
                <span className="text-muted-foreground">Completed:</span>
                <p className="font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  {new Date(userEnrollment.completedAt!).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {isCompleted && (
            <div className="pt-2 border-t">
              <div className="flex items-center text-green-600">
                <Star className="h-4 w-4 mr-2" />
                <span className="font-medium">Course Completed!</span>
              </div>
              {hasCertificate && (
                <p className="text-sm text-muted-foreground mt-1">
                  Certificate earned and ready for download
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render course stats (different views for different roles)
  const renderCourseStats = () => {
    const statsForManagers = (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course._count?.enrollments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Students enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course._count?.enrollments > 0 
                ? Math.round((course._count?.completedEnrollments || 0) / course._count.enrollments * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Students completed</p>
          </CardContent>
        </Card>
      </>
    );

    const statsForStudents = (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course._count?.enrollments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course.averageRating ? course.averageRating.toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </>
    );

    return (
      <div className="grid md:grid-cols-3 gap-6">
        {canEdit ? statsForManagers : statsForStudents}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course._count?.modules || 0}</div>
            <p className="text-xs text-muted-foreground">Course modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.duration}h</div>
            <p className="text-xs text-muted-foreground">Estimated time</p>
          </CardContent>
        </Card>

        {Number(course.price) > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${course.price}</div>
              <p className="text-xs text-muted-foreground">Course price</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render modules section with role-appropriate actions
  const renderModulesSection = () => {
    const hasModules = course.modules && course.modules.length > 0;

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Course Modules</CardTitle>
              <CardDescription>
                {canEdit 
                  ? "Manage course content and structure"
                  : "Course content overview"
                }
              </CardDescription>
            </div>
            {canManageModules && (
              <Link href={`${basePath}/courses/${course.id}/modules/new`}>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasModules ? (
            <div className="space-y-4">
              {course.modules.map((module: any, index: number) => (
                <div key={module.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        Module {index + 1}: {module.title}
                      </h4>
                      {module.description && (
                        <p className="text-gray-600 mt-1">
                          {module.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{module._count?.topics || 0} topics</span>
                        <span>Duration: {module.duration || "Not set"}</span>
                        {isStudent && userEnrollment && module.progress && (
                          <span className="text-blue-600">
                            {module.progress}% complete
                          </span>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex space-x-2">
                        <Link href={`${basePath}/courses/${course.id}/modules/${module.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {module.topics && module.topics.length > 0 && (
                    <div className="mt-4 ml-4">
                      <h5 className="font-medium text-sm text-gray-700 mb-2">
                        Topics:
                      </h5>
                      <div className="space-y-1">
                        {module.topics.map((topic: any) => (
                          <div
                            key={topic.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="flex items-center">
                              {isStudent && topic.completed && (
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              )}
                              {topic.title}
                            </span>
                            <div className="flex items-center space-x-2 text-gray-500">
                              <span>{topic.topicType}</span>
                              {topic.duration && (
                                <span>({topic.duration}min)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No modules created yet</p>
              <p className="text-sm">
                {canEdit 
                  ? "Add modules to structure your course content"
                  : "This course doesn't have any modules yet"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge variant={statusVariant}>{course.status}</Badge>
            <Badge variant={difficultyVariant}>{course.difficulty}</Badge>
            {Number(course.price) === 0 && (
              <Badge variant="outline">Free</Badge>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {renderManagementActions()}
          {renderEnrollmentButton()}
        </div>
      </div>

      {/* Student Progress Card (only for enrolled students) */}
      {renderStudentProgress()}

      {/* Course Overview Stats */}
      {renderCourseStats()}

      {/* Course Information */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-600">{course.description}</p>
            </div>

            {course.shortDescription && (
              <div>
                <h4 className="font-medium mb-2">Short Description</h4>
                <p className="text-gray-600">{course.shortDescription}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Price</h4>
                <p className="text-gray-600">
                  {Number(course.price) > 0 ? `$${course.price}` : "Free"}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Difficulty</h4>
                <p className="text-gray-600">{course.difficulty}</p>
              </div>
            </div>

            {course.tags && course.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {course.prerequisites && course.prerequisites.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Prerequisites</h4>
                <ul className="text-gray-600 space-y-1">
                  {course.prerequisites.map((prereq: string, index: number) => (
                    <li key={index}>• {prereq}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                Created by {course.creator?.firstName || "Unknown"}{" "}
                {course.creator?.lastName || ""}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                Created {new Date(course.createdAt).toLocaleDateString()}
              </span>
            </div>

            {course.publishedAt && (
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  Published{" "}
                  {new Date(course.publishedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {course.learningOutcomes &&
              course.learningOutcomes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Learning Outcomes</h4>
                  <ul className="text-gray-600 space-y-1">
                    {course.learningOutcomes.map((outcome: string, index: number) => (
                      <li key={index}>• {outcome}</li>
                    ))}
                  </ul>
                </div>
              )}

            {course.syllabus && (
              <div>
                <h4 className="font-medium mb-2">Syllabus</h4>
                <p className="text-gray-600 whitespace-pre-line">
                  {course.syllabus}
                </p>
              </div>
            )}

            {/* Course Settings (Admin/Manager only) */}
            {canEdit && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Course Settings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <span>{course.passingScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sequential Completion:</span>
                    <span>{course.requireSequentialCompletion ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allow Retakes:</span>
                    <span>{course.allowRetakes ? "Yes" : "No"}</span>
                  </div>
                  {course.maxAttempts && (
                    <div className="flex justify-between">
                      <span>Max Attempts:</span>
                      <span>{course.maxAttempts}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Modules */}
      {renderModulesSection()}

      {/* Enrolled Students (Admin/Manager only) */}
      {canEdit && course.enrollments && course.enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>
              Students currently enrolled in this course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.enrollments.slice(0, 10).map((enrollment: any) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">
                      {enrollment.user.firstName} {enrollment.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {enrollment.user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {enrollment.overallProgress}% complete
                    </p>
                    <p className="text-xs text-gray-500">
                      Enrolled{" "}
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                    {enrollment.completedAt && (
                      <p className="text-xs text-green-600">
                        Completed {new Date(enrollment.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {course.enrollments.length > 10 && (
                <p className="text-center text-sm text-gray-500 pt-2">
                  And {course.enrollments.length - 10} more students...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

{/* <CourseDetailsView
  course={course}
  currentUser={{ id: "123", role: "ADMIN", firstName: "John", lastName: "Doe" }}
  basePath="/admin"
  onDeleteCourse={handleDelete}
  onToggleStatus={handleToggleStatus}
/> */}