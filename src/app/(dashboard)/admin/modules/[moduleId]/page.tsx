// app/(dashboard)/admin/modules/[moduleId]/page.tsx
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
  Clock,
  BookOpen,
  Calendar,
  User,
  Plus,
  ArrowLeft,
  Play,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { ModuleService } from "@/lib/services/moduleService";
import { ModuleActions } from "@/components/modules/ModuleActions";

async function getModule(moduleId: string) {
  try {
    const module = await ModuleService.getModuleById(moduleId);
    return module;
  } catch (error) {
    console.error("Error fetching module:", error);
    return null;
  }
}

interface ModuleDetailsPageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

export default async function ModuleDetailsPage({
  params,
}: ModuleDetailsPageProps) {
  const { moduleId } = await params;
  const module = await getModule(moduleId);

  if (!module) {
    notFound();
  }

  const getTopicTypeIcon = (type: string) => {
    switch (type) {
      case 'LESSON':
        return <BookOpen className="h-4 w-4" />;
      case 'PRACTICE':
        return <Play className="h-4 w-4" />;
      case 'ASSESSMENT':
        return <CheckCircle className="h-4 w-4" />;
      case 'RESOURCE':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTopicTypeColor = (type: string) => {
    switch (type) {
      case 'LESSON':
        return 'bg-blue-100 text-blue-800';
      case 'PRACTICE':
        return 'bg-green-100 text-green-800';
      case 'ASSESSMENT':
        return 'bg-red-100 text-red-800';
      case 'RESOURCE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <AdminLayout
      title={module.title}
      description="Module details and content management"
    >
      <div className="space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center space-x-4">
          <Link href={`/admin/courses/${module.course.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
            <p className="text-gray-600">
              Module {module.order} of {module.course.title}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant={module.isRequired ? "default" : "secondary"}>
                {module.isRequired ? "Required" : "Optional"}
              </Badge>
              {module.prerequisiteModule && (
                <Badge variant="outline">
                  Prerequisite: {module.prerequisiteModule.title}
                </Badge>
              )}
            </div>
          </div>
          <ModuleActions module={module} />
        </div>

        {/* Module Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Topics</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{module._count.topics}</div>
              <p className="text-xs text-muted-foreground">Learning units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{module.duration}min</div>
              <p className="text-xs text-muted-foreground">Estimated time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passing Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{module.passingScore}%</div>
              <p className="text-xs text-muted-foreground">Required to pass</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unlock Delay</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {module.unlockDelay ? `${module.unlockDelay}h` : "0h"}
              </div>
              <p className="text-xs text-muted-foreground">After prerequisite</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Information */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Module Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {module.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{module.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Order</h4>
                  <p className="text-gray-600">Module {module.order}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <p className="text-gray-600">
                    {module.isRequired ? "Required" : "Optional"}
                  </p>
                </div>
              </div>

              {module.prerequisiteModule && (
                <div>
                  <h4 className="font-medium mb-1">Prerequisite</h4>
                  <Link 
                    href={`/admin/modules/${module.prerequisiteModule.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {module.prerequisiteModule.title}
                  </Link>
                </div>
              )}

              {module.dependentModules.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Dependent Modules</h4>
                  <div className="space-y-1">
                    {module.dependentModules.map((depModule) => (
                      <Link
                        key={depModule.id}
                        href={`/admin/modules/${depModule.id}`}
                        className="block text-blue-600 hover:text-blue-800"
                      >
                        {depModule.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Module Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  Course by {module.course.creator.firstName}{" "}
                  {module.course.creator.lastName}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  Created {new Date(module.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  Part of {module.course.title}
                </span>
              </div>

              <div className="pt-4">
                <Link href={`/admin/courses/${module.course.id}`}>
                  <Button variant="outline" className="w-full">
                    View Full Course
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Topics */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Module Topics</CardTitle>
                <CardDescription>
                  Content and learning materials in this module
                </CardDescription>
              </div>
              <Link href={`/admin/modules/${module.id}/topics/create`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {module.topics && module.topics.length > 0 ? (
              <div className="space-y-4">
                {module.topics.map((topic, index) => (
                  <div key={topic.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500">
                            {index + 1}.
                          </span>
                          <Link 
                            href={`/admin/topics/${topic.id}`}
                            className="font-semibold text-blue-600 hover:text-blue-800"
                          >
                            {topic.title}
                          </Link>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getTopicTypeColor(topic.topicType)}`}>
                            {getTopicTypeIcon(topic.topicType)}
                            <span>{topic.topicType}</span>
                          </div>
                        </div>

                        {topic.prerequisiteTopic && (
                          <p className="text-sm text-gray-500 mt-1 ml-6">
                            Prerequisite: {topic.prerequisiteTopic.title}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 mt-2 ml-6 text-sm text-gray-500">
                          {topic.duration && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{topic.duration}min</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            {topic.isRequired ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>Required</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-gray-400" />
                                <span>Optional</span>
                              </>
                            )}
                          </div>
                          {topic.quizzes && topic.quizzes.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-blue-500" />
                              <span>{topic.quizzes.length} quiz(es)</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link href={`/admin/topics/${topic.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/topics/${topic.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No topics yet</h3>
                <p className="mb-4">
                  Start building your module by adding topics
                </p>
                <Link href={`/admin/modules/${module.id}/topics/create`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Topic
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
