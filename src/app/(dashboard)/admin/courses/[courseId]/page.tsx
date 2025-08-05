// app/(dashboard)/admin/courses/[courseId]/page.tsx
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
  Users,
  BookOpen,
  Clock,
  Calendar,
  User,
  Play,
  Plus,
} from "lucide-react";
import { CourseService } from "@/lib/services/courseService";
import CourseActions from "@/components/courses/course-actions";

async function getCourse(courseId: string) {
  try {
    const course = await CourseService.getCourseById(courseId);
    return course;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}

interface CourseDetailsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  // Await the params before using them
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

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

  return (
    <AdminLayout
      title={course.title}
      description="Course details and management"
    >
      <div className="space-y-8">
        {/* Header Actions */}
        {/* <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant={statusVariant}>{course.status}</Badge>
              <Badge variant={difficultyVariant}>{course.difficulty}</Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/admin/courses/${course.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Course
              </Button>
            </Link>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div> */}
        {/* Header Actions */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant={statusVariant}>{course.status}</Badge>
              <Badge variant={difficultyVariant}>{course.difficulty}</Badge>
            </div>
          </div>
          <CourseActions course={course} />
        </div>

        {/* Course Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {course._count.enrollments}
              </div>
              <p className="text-xs text-muted-foreground">Students enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modules</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course._count.modules}</div>
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
        </div>

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
                    {course.price > 0 ? `$${course.price}` : "Free"}
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
                    {course.tags.map((tag) => (
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
                    {course.prerequisites.map((prereq, index) => (
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
                  Created by {course.creator.firstName}{" "}
                  {course.creator.lastName}
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
                      {course.learningOutcomes.map((outcome, index) => (
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
            </CardContent>
          </Card>
        </div>

        {/* Course Modules */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Course Modules</CardTitle>
                <CardDescription>
                  Manage course content and structure
                </CardDescription>
              </div>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {course.modules && course.modules.length > 0 ? (
              <div className="space-y-4">
                {course.modules.map((module, index) => (
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
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {module.topics && module.topics.length > 0 && (
                      <div className="mt-4 ml-4">
                        <h5 className="font-medium text-sm text-gray-700 mb-2">
                          Topics:
                        </h5>
                        <div className="space-y-1">
                          {module.topics.map((topic) => (
                            <div
                              key={topic.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>{topic.title}</span>
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
                  Add modules to structure your course content
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrolled Students */}
        {course.enrollments && course.enrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>
                Students currently enrolled in this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {course.enrollments.slice(0, 10).map((enrollment) => (
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
    </AdminLayout>
  );
}
