// app/(dashboard)/admin/topics/[topicId]/page.tsx
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
  ArrowLeft,
  Play,
  FileText,
  CheckCircle,
  XCircle,
  Video,
  Link as LinkIcon,
  Download,
  Eye,
  EyeOff,
  Plus,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { TopicService } from "@/lib/services/topicService";
import { TopicActions } from "@/components/topics/topic-actions";

async function getTopic(topicId: string) {
  try {
    const topic = await TopicService.getTopicById(topicId);
    return topic;
  } catch (error) {
    console.error("Error fetching topic:", error);
    return null;
  }
}

interface TopicDetailsPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function TopicDetailsPage({
  params,
}: TopicDetailsPageProps) {
  const { topicId } = await params;
  const topic = await getTopic(topicId);

  if (!topic) {
    notFound();
  }

  const getTopicTypeIcon = (type: string) => {
    switch (type) {
      case "LESSON":
        return <BookOpen className="h-5 w-5" />;
      case "PRACTICE":
        return <Play className="h-5 w-5" />;
      case "ASSESSMENT":
        return <CheckCircle className="h-5 w-5" />;
      case "RESOURCE":
        return <FileText className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getTopicTypeColor = (type: string) => {
    switch (type) {
      case "LESSON":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PRACTICE":
        return "bg-green-100 text-green-800 border-green-200";
      case "ASSESSMENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "RESOURCE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const totalQuizPoints =
    topic.quizzes?.reduce(
      (total, quiz) =>
        total +
        quiz.questions.reduce((quizTotal, q) => quizTotal + q.points, 0),
      0
    ) || 0;

  const totalQuestions =
    topic.quizzes?.reduce((total, quiz) => total + quiz.questions.length, 0) ||
    0;

  return (
    <AdminLayout
      title={topic.title}
      description="Topic details and content management"
    >
      <div className="space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center space-x-4">
          <Link href={`/admin/modules/${topic.module.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Module
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
            <p className="text-gray-600">
              {topic.module.title} • {topic.module.course.title}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 border ${getTopicTypeColor(
                  topic.topicType
                )}`}
              >
                {getTopicTypeIcon(topic.topicType)}
                <span>{topic.topicType}</span>
              </div>
              <Badge variant={topic.isRequired ? "default" : "secondary"}>
                {topic.isRequired ? "Required" : "Optional"}
              </Badge>
              {topic.allowSkip && <Badge variant="outline">Skippable</Badge>}
              {topic.prerequisiteTopic && (
                <Badge variant="outline">Has Prerequisite</Badge>
              )}
            </div>
          </div>
          <TopicActions topic={topic} />
        </div>

        {/* Topic Overview Stats */}
        <div className="grid md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {topic.duration ? `${topic.duration}min` : "Not set"}
              </div>
              <p className="text-xs text-muted-foreground">Estimated time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Passing Score
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topic.passingScore}%</div>
              <p className="text-xs text-muted-foreground">Required to pass</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Max Attempts
              </CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {topic.maxAttempts || "∞"}
              </div>
              <p className="text-xs text-muted-foreground">
                {topic.maxAttempts ? "Limited" : "Unlimited"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {topic.quizzes?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Assessment(s)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Points
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuizPoints}</div>
              <p className="text-xs text-muted-foreground">Available points</p>
            </CardContent>
          </Card>
        </div>

        {/* Topic Information */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Topic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topic.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{topic.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Order Index</h4>
                  <p className="text-gray-600">{topic.orderIndex}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Slug</h4>
                  <p className="text-gray-600 font-mono text-sm">
                    {topic.slug}
                  </p>
                </div>
              </div>

              {topic.videoUrl && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <Video className="h-4 w-4" />
                    <span>Video Content</span>
                  </h4>
                  <a
                    href={topic.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm break-all"
                  >
                    {topic.videoUrl}
                  </a>
                </div>
              )}

              {topic.attachments && topic.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Attachments</span>
                  </h4>
                  <div className="space-y-1">
                    {topic.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {attachment}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {topic.prerequisiteTopic && (
                <div>
                  <h4 className="font-medium mb-1">Prerequisite Topic</h4>
                  <Link
                    href={`/admin/topics/${topic.prerequisiteTopic.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {topic.prerequisiteTopic.title}
                  </Link>
                </div>
              )}

              {topic.dependentTopics.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Dependent Topics</h4>
                  <div className="space-y-1">
                    {topic.dependentTopics.map((depTopic) => (
                      <Link
                        key={depTopic.id}
                        href={`/admin/topics/${depTopic.id}`}
                        className="block text-blue-600 hover:text-blue-800"
                      >
                        {depTopic.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Topic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  Course by {topic.module.course.creator.firstName}{" "}
                  {topic.module.course.creator.lastName}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  Created {new Date(topic.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Module: {topic.module.title}</span>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center space-x-2">
                  {topic.isRequired ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">
                    {topic.isRequired
                      ? "Required for completion"
                      : "Optional topic"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {topic.allowSkip ? (
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">
                    {topic.allowSkip
                      ? "Can be skipped if struggling"
                      : "Cannot be skipped"}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Link href={`/admin/modules/${topic.module.id}`}>
                  <Button variant="outline" className="w-full">
                    View Module
                  </Button>
                </Link>
                <Link href={`/admin/courses/${topic.module.course.id}`}>
                  <Button variant="outline" className="w-full">
                    View Course
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topic Content */}
        <Card>
          <CardHeader>
            <CardTitle>Topic Content</CardTitle>
            <CardDescription>
              The main learning material for this topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {topic.content}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic Quizzes */}
        {topic.quizzes && topic.quizzes.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Quizzes & Assessments</CardTitle>
                  <CardDescription>
                    Interactive assessments for this topic
                  </CardDescription>
                </div>
                <Link href={`/admin/topics/${topic.id}/quizzes/create`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Quiz
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topic.quizzes.map((quiz, index) => (
                  <div
                    key={quiz.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500">
                            {index + 1}.
                          </span>
                          <Link
                            href={`/admin/quizzes/${quiz.id}`}
                            className="font-semibold text-lg text-blue-600 hover:text-blue-800"
                          >
                            {quiz.title}
                          </Link>
                        </div>

                        {quiz.description && (
                          <p className="text-gray-600 mt-2 ml-6">
                            {quiz.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 mt-3 ml-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <HelpCircle className="h-3 w-3" />
                            <span>{quiz.questions.length} questions</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>
                              {quiz.questions.reduce(
                                (total, q) => total + q.points,
                                0
                              )}{" "}
                              points
                            </span>
                          </div>
                          {quiz.timeLimit && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{quiz.timeLimit} minutes</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Play className="h-3 w-3" />
                            <span>
                              {quiz.maxAttempts
                                ? `${quiz.maxAttempts} attempts`
                                : "Unlimited attempts"}
                            </span>
                          </div>
                        </div>

                        {/* Quiz Questions Preview */}
                        {quiz.questions.length > 0 && (
                          <div className="mt-4 ml-6">
                            <h5 className="font-medium text-sm text-gray-700 mb-2">
                              Questions:
                            </h5>
                            <div className="space-y-1">
                              {quiz.questions
                                .slice(0, 3)
                                .map((question, qIndex) => (
                                  <div
                                    key={question.id}
                                    className="text-sm text-gray-600"
                                  >
                                    <span className="font-medium">
                                      {qIndex + 1}.
                                    </span>{" "}
                                    {question.question}
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({question.points} pts)
                                    </span>
                                  </div>
                                ))}
                              {quiz.questions.length > 3 && (
                                <div className="text-sm text-gray-500">
                                  ... and {quiz.questions.length - 3} more
                                  questions
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Link href={`/admin/quizzes/${quiz.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Quizzes & Assessments</CardTitle>
                  <CardDescription>
                    Interactive assessments for this topic
                  </CardDescription>
                </div>
                <Link href={`/admin/topics/${topic.id}/quizzes/create`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Quiz
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <HelpCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No quizzes yet</h3>
                <p className="mb-4">
                  Add interactive assessments to test understanding of this
                  topic
                </p>
                <Link href={`/admin/topics/${topic.id}/quizzes/create`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Quiz
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
