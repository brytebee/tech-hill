// components/students/StudentTopicViewer.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Play,
  FileText,
  Video,
  Award,
  Target,
  AlertTriangle,
  User,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { StudentCourseService } from "@/lib/services/student/courseService";

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: Array<{
    id: string;
    questionType: string;
    points: number;
  }>;
}

interface Topic {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  orderIndex: number;
  duration?: number;
  topicType: string;
  videoUrl?: string;
  attachments: string[];
  passingScore: number;
  maxAttempts?: number;
  isRequired: boolean;
  allowSkip: boolean;
  prerequisiteTopic?: {
    id: string;
    title: string;
  };
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
      creator: {
        firstName: string;
        lastName: string;
      };
    };
  };
  quizzes: Quiz[];
}

interface Enrollment {
  id: string;
  status: string;
  overallProgress: number;
}

interface StudentTopicViewerProps {
  topic: Topic;
  enrollment: Enrollment;
  userId: string;
}

interface TopicProgressData {
  progress: any;
  remainingAttempts: { [quizId: string]: number };
  canAccess: boolean;
}

function getTopicIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return <Video className="h-5 w-5" />;
    case "PRACTICE":
      return <Target className="h-5 w-5" />;
    case "ASSESSMENT":
      return <Award className="h-5 w-5" />;
    case "RESOURCE":
      return <FileText className="h-5 w-5" />;
    default:
      return <BookOpen className="h-5 w-5" />;
  }
}

function getTopicTypeColor(type: string) {
  switch (type) {
    case "VIDEO":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "PRACTICE":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ASSESSMENT":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "RESOURCE":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// export function StudentTopicViewer({
//   topic,
//   enrollment,
//   userId,
// }: StudentTopicViewerProps) {
//   const router = useRouter();
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [progressStarted, setProgressStarted] = useState(false);

//   // Mock progress tracking - in real app this would sync with TopicProgress
//   useEffect(() => {
//     // Mark as started when component mounts
//     if (!progressStarted) {
//       setProgressStarted(true);
//       // In real app: call API to update TopicProgress status to IN_PROGRESS
//       console.log("Marking topic as started:", topic.id);
//     }
//   }, [topic.id, progressStarted]);

//   const handleMarkComplete = async () => {
//     try {
//       const res = await fetch(`/api/student/topics/${topic.id}/mark-complete`, {
//         method: "POST",
//       });
//       if (res.ok) {
//         const data = await res.json();
//         console.log("Marking topic as completed:", topic.id);
//         setIsCompleted(true);
//       } else {
//         if (!res.ok) throw new Error("Failed to fetch users");
//       }
//     } catch (error) {
//       console.error("Failed to mark topic as completed:", error);
//     }
//   };

//   const handleStartQuiz = (quizId: string) => {
//     router.push(`/student/quiz/${quizId}?topicId=${topic.id}`);
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       {/* Breadcrumb Navigation */}
//       <nav className="flex items-center space-x-2 text-sm text-gray-500">
//         <Link
//           href={`/student/courses/${topic.module.course.id}`}
//           className="hover:text-gray-700 flex items-center gap-1"
//         >
//           <ArrowLeft className="h-3 w-3" />
//           {topic.module.course.title}
//         </Link>
//         <span>/</span>
//         <span>{topic.module.title}</span>
//         <span>/</span>
//         <span className="text-gray-900 font-medium">{topic.title}</span>
//       </nav>

//       {/* Topic Header */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <div className="flex items-center gap-2 mb-3">
//                 <Badge className={getTopicTypeColor(topic.topicType)}>
//                   {getTopicIcon(topic.topicType)}
//                   <span className="ml-1">{topic.topicType}</span>
//                 </Badge>
//                 {topic.isRequired && (
//                   <Badge variant="secondary">Required</Badge>
//                 )}
//                 {isCompleted && (
//                   <Badge className="bg-green-100 text-green-800 border-green-200">
//                     <CheckCircle className="h-3 w-3 mr-1" />
//                     Completed
//                   </Badge>
//                 )}
//               </div>

//               <CardTitle className="text-2xl mb-2">{topic.title}</CardTitle>

//               {topic.description && (
//                 <p className="text-gray-600 mb-4">{topic.description}</p>
//               )}

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 {topic.duration && (
//                   <div className="flex items-center gap-2">
//                     <Clock className="h-4 w-4 text-gray-400" />
//                     <span>{topic.duration} minutes</span>
//                   </div>
//                 )}
//                 <div className="flex items-center gap-2">
//                   <Target className="h-4 w-4 text-gray-400" />
//                   <span>{topic.passingScore}% to pass</span>
//                 </div>
//                 {topic.maxAttempts && (
//                   <div className="flex items-center gap-2">
//                     <AlertTriangle className="h-4 w-4 text-gray-400" />
//                     <span>{topic.maxAttempts} attempts max</span>
//                   </div>
//                 )}
//                 <div className="flex items-center gap-2">
//                   <User className="h-4 w-4 text-gray-400" />
//                   <span>
//                     {topic.module.course.creator.firstName}{" "}
//                     {topic.module.course.creator.lastName}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardHeader>
//       </Card>

//       {/* Prerequisite Warning */}
//       {topic.prerequisiteTopic && (
//         <Card className="border-orange-200 bg-orange-50">
//           <CardContent className="pt-6">
//             <div className="flex items-center gap-2 text-orange-800">
//               <AlertTriangle className="h-4 w-4" />
//               <span className="font-medium">Prerequisite Required</span>
//             </div>
//             <p className="text-orange-700 mt-1">
//               Complete "{topic.prerequisiteTopic.title}" before accessing this
//               topic.
//             </p>
//           </CardContent>
//         </Card>
//       )}

//       {/* Video Content */}
//       {topic.videoUrl && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Video className="h-5 w-5" />
//               Video Content
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
//               <div className="text-center">
//                 <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//                 <p className="text-gray-500">Video Player</p>
//                 <p className="text-sm text-gray-400">URL: {topic.videoUrl}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Main Content */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <BookOpen className="h-5 w-5" />
//             Content
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div
//             className="prose max-w-none"
//             dangerouslySetInnerHTML={{ __html: topic.content }}
//           />
//         </CardContent>
//       </Card>

//       {/* Attachments */}
//       {topic.attachments && topic.attachments.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <FileText className="h-5 w-5" />
//               Resources & Attachments
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-3">
//               {topic.attachments.map((attachment, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
//                 >
//                   <div className="flex items-center gap-3">
//                     <FileText className="h-4 w-4 text-gray-500" />
//                     <span className="font-medium">Resource {index + 1}</span>
//                     <span className="text-sm text-gray-500">{attachment}</span>
//                   </div>
//                   <Button variant="outline" size="sm">
//                     Download
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Quizzes */}
//       {topic.quizzes && topic.quizzes.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Award className="h-5 w-5" />
//               Assessments
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {topic.quizzes.map((quiz) => (
//                 <div
//                   key={quiz.id}
//                   className="flex items-center justify-between p-4 border rounded-lg"
//                 >
//                   <div>
//                     <h4 className="font-medium">{quiz.title}</h4>
//                     <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
//                       <span>{quiz.questions.length} questions</span>
//                       <span>Passing: {quiz.passingScore}%</span>
//                       <span>
//                         Total:{" "}
//                         {quiz.questions.reduce((sum, q) => sum + q.points, 0)}{" "}
//                         points
//                       </span>
//                     </div>
//                   </div>
//                   <Button onClick={() => handleStartQuiz(quiz.id)}>
//                     <Play className="h-4 w-4 mr-2" />
//                     Start Quiz
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Action Buttons */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex items-center justify-between">
//             <div>
//               {!isCompleted && (
//                 <p className="text-sm text-gray-600 mb-2">
//                   Mark this topic as complete when you're done studying the
//                   material.
//                 </p>
//               )}
//             </div>
//             <div className="flex gap-3">
//               {topic.allowSkip && !topic.isRequired && (
//                 <Button variant="outline">Skip Topic</Button>
//               )}
//               {!isCompleted ? (
//                 <Button onClick={handleMarkComplete}>
//                   <CheckCircle className="h-4 w-4 mr-2" />
//                   Mark Complete
//                 </Button>
//               ) : (
//                 <Button variant="outline">
//                   <CheckCircle className="h-4 w-4 mr-2" />
//                   Completed
//                 </Button>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Navigation */}
//       <div className="flex justify-between pt-6">
//         <Link href={`/student/courses/${topic.module.course.id}`}>
//           <Button variant="outline">
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Course
//           </Button>
//         </Link>

//         <div className="text-center">
//           <p className="text-sm text-gray-500">
//             Topic {topic.orderIndex} in {topic.module.title}
//           </p>
//         </div>

//         <Button variant="outline" disabled>
//           Next Topic
//           <ArrowRight className="h-4 w-4 ml-2" />
//         </Button>
//       </div>
//     </div>
//   );
// }

export function StudentTopicViewer({
  topic,
  enrollment,
  userId,
}: StudentTopicViewerProps) {
  const router = useRouter();
  const [progressData, setProgressData] = useState<TopicProgressData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch progress data on component mount
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const response = await fetch(
          `/api/student/topics/${topic.id}/progress`
        );
        const data = await response.json();
        setProgressData(data);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [topic.id]);

  const handleMarkComplete = async () => {
    try {
      const response = await fetch(
        `/api/student/topics/${topic.id}/mark-complete`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.canComplete) {
          // Refresh progress data
          const progressResponse = await fetch(
            `/api/student/topics/${topic.id}/progress`
          );
          const updatedData = await progressResponse.json();
          setProgressData(updatedData);
        } else {
          alert(
            "Please complete all required assessments before marking this topic as complete."
          );
        }
      } else {
        throw new Error("Failed to mark complete");
      }
    } catch (error) {
      console.error("Failed to mark topic as completed:", error);
      alert("Error updating progress. Please try again.");
    }
  };

  const handleStartQuiz = (quizId: string) => {
    if (
      !progressData?.remainingAttempts[quizId] ||
      progressData.remainingAttempts[quizId] === 0
    ) {
      alert("No more attempts remaining for this quiz.");
      return;
    }
    router.push(`/student/quiz/${quizId}?topicId=${topic.id}`);
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  if (!progressData?.canAccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Access Denied</span>
            </div>
            <p className="text-red-700 mt-1">
              You don't have access to this topic. Please complete the
              prerequisites first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = progressData.progress?.status === "COMPLETED";
  const hasAssessments = topic.quizzes.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link
          href={`/student/courses/${topic.module.course.id}`}
          className="hover:text-gray-700 flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          {topic.module.course.title}
        </Link>
        <span>/</span>
        <span>{topic.module.title}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">{topic.title}</span>
      </nav>

      {/* Topic Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getTopicTypeColor(topic.topicType)}>
                  {getTopicIcon(topic.topicType)}
                  <span className="ml-1">{topic.topicType}</span>
                </Badge>
                {topic.isRequired && (
                  <Badge variant="secondary">Required</Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
                {progressData.progress?.bestScore && (
                  <Badge variant="outline">
                    Best Score: {progressData.progress.bestScore}%
                  </Badge>
                )}
              </div>

              <CardTitle className="text-2xl mb-2">{topic.title}</CardTitle>

              {topic.description && (
                <p className="text-gray-600 mb-4">{topic.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {topic.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{topic.duration} minutes</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span>{topic.passingScore}% to pass</span>
                </div>
                {topic.maxAttempts && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                    <span>{topic.maxAttempts} attempts max</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>
                    {topic.module.course.creator.firstName}{" "}
                    {topic.module.course.creator.lastName}
                  </span>
                </div>
              </div>

              {/* Progress Stats */}
              {progressData.progress && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Views:</span>
                      <span className="ml-1 font-medium">
                        {progressData.progress.viewCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Time Spent:</span>
                      <span className="ml-1 font-medium">
                        {progressData.progress.timeSpent} min
                      </span>
                    </div>
                    {progressData.progress.attemptCount > 0 && (
                      <div>
                        <span className="text-gray-500">Attempts:</span>
                        <span className="ml-1 font-medium">
                          {progressData.progress.attemptCount}
                        </span>
                      </div>
                    )}
                    {progressData.progress.averageScore && (
                      <div>
                        <span className="text-gray-500">Avg Score:</span>
                        <span className="ml-1 font-medium">
                          {progressData.progress.averageScore}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Prerequisite Warning */}
      {topic.prerequisiteTopic && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Prerequisite Required</span>
            </div>
            <p className="text-orange-700 mt-1">
              Complete "{topic.prerequisiteTopic.title}" before accessing this
              topic.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Video Content */}
      {topic.videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Video Player</p>
                <p className="text-sm text-gray-400">URL: {topic.videoUrl}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: topic.content }}
          />
        </CardContent>
      </Card>

      {/* Attachments */}
      {topic.attachments && topic.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resources & Attachments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {topic.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Resource {index + 1}</span>
                    <span className="text-sm text-gray-500">{attachment}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quizzes */}
      {topic.quizzes && topic.quizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topic.quizzes.map((quiz) => {
                const remainingAttempts =
                  progressData.remainingAttempts[quiz.id];
                const hasAttemptsLeft =
                  remainingAttempts === -1 || remainingAttempts > 0;
                const passedQuiz = topic.quizzes.some(
                  (q) =>
                    q.id === quiz.id &&
                    progressData.progress?.topic?.quizzes?.some(
                      (tq: any) =>
                        tq.id === quiz.id &&
                        tq.attempts?.some((attempt: any) => attempt.passed)
                    )
                );

                return (
                  <div
                    key={quiz.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      passedQuiz
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {quiz.title}
                        {passedQuiz && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{quiz.questions.length} questions</span>
                        <span>Passing: {quiz.passingScore}%</span>
                        <span>
                          Total:{" "}
                          {quiz.questions.reduce((sum, q) => sum + q.points, 0)}{" "}
                          points
                        </span>
                        {remainingAttempts !== -1 && (
                          <span
                            className={
                              remainingAttempts === 0
                                ? "text-red-600"
                                : "text-blue-600"
                            }
                          >
                            {remainingAttempts} attempts left
                          </span>
                        )}
                      </div>
                    </div>
                    {hasAttemptsLeft ? (
                      <Button onClick={() => handleStartQuiz(quiz.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        {passedQuiz ? "Retake Quiz" : "Start Quiz"}
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        No Attempts Left
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Assessment completion warning */}
            {hasAssessments && !isCompleted && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Assessment Required</span>
                </div>
                <p className="text-yellow-700 mt-1 text-sm">
                  You must pass all assessments in this topic before marking it
                  as complete.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              {!isCompleted && (
                <p className="text-sm text-gray-600 mb-2">
                  {hasAssessments
                    ? "Complete all assessments and mark this topic as complete."
                    : "Mark this topic as complete when you're done studying the material."}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {topic.allowSkip && !topic.isRequired && !isCompleted && (
                <Button variant="outline">Skip Topic</Button>
              )}
              {!isCompleted ? (
                <Button
                  onClick={handleMarkComplete}
                  disabled={
                    hasAssessments &&
                    !topic.quizzes.every((quiz) =>
                      progressData.progress?.topic?.quizzes?.some(
                        (tq: any) =>
                          tq.id === quiz.id &&
                          tq.attempts?.some((attempt: any) => attempt.passed)
                      )
                    )
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Link href={`/student/courses/${topic.module.course.id}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </Link>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Topic {topic.orderIndex} in {topic.module.title}
          </p>
        </div>

        <Button variant="outline" disabled>
          Next Topic
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
