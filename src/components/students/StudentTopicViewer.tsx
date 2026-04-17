"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProgressService } from "@/lib/services/progressService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Unlock as UnlockIcon,
  Lock as LockIcon,
  User,
  Github,
  ExternalLink,
  Send,
  RefreshCw,
  XCircle,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: Array<{
    id: string;
    questionType: string;
    points: number;
  }>;
}

export interface Topic {
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
  furtherReadingLinks?: any;
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

export interface Enrollment {
  id: string;
  status: string;
  overallProgress: number;
}

export interface StudentTopicViewerProps {
  topic: Topic;
  enrollment?: Enrollment | null;
  userId?: string;
  nextTopicId?: string;
  previousTopicId?: string;
  isLastTopicOfCourse?: boolean;
}

export interface TopicProgressData {
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
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
    case "PRACTICE":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    case "ASSESSMENT":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
    case "RESOURCE":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
}

export function StudentTopicViewer({
  topic,
  enrollment,
  userId,
  nextTopicId,
  previousTopicId,
  isLastTopicOfCourse,
}: StudentTopicViewerProps) {
  const router = useRouter();
  const isPreviewOnly = !enrollment || enrollment.status !== "ACTIVE";
  const [progressData, setProgressData] = useState<TopicProgressData | null>(
    isPreviewOnly
      ? { progress: null, remainingAttempts: {}, canAccess: true }
      : null,
  );
  const [isLoading, setIsLoading] = useState(!isPreviewOnly);

  // Project submission state
  const isProjectTopic = topic.topicType === "PRACTICE";
  const [submission, setSubmission] = useState<any>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const [projectLink, setProjectLink] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    if (isPreviewOnly) return;
    const fetchProgressData = async () => {
      try {
        const response = await fetch(
          `/api/student/topics/${topic.id}/progress`,
        );
        const data = await response.json();
        setProgressData(data);
      } catch (error: any) {
        console.error("Error fetching progress data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgressData();
  }, [topic.id, isPreviewOnly]);

  // Fetch existing submission for project topics
  useEffect(() => {
    if (isPreviewOnly || !isProjectTopic) return;
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`/api/student/topics/${topic.id}/submit`);
        const data = await res.json();
        if (data.dueDate) setDueDate(new Date(data.dueDate));
        if (data.deadlinePassed) setDeadlinePassed(true);
        if (data.submission) {
          setSubmission(data.submission);
          // Pre-fill the link for resubmission
          if (["CHANGES_REQUIRED", "REJECTED"].includes(data.submission.status)) {
            setProjectLink(data.submission.content || "");
            setProjectDescription(data.submission.description || "");
          }
        }
      } catch (e) {
        console.error("Error fetching submission", e);
      }
    };
    fetchSubmission();
  }, [topic.id, isPreviewOnly, isProjectTopic]);

  const handleMarkComplete = async () => {
    try {
      const response = await fetch(
        `/api/student/topics/${topic.id}/mark-complete`,
        { method: "POST" },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.canComplete) {
          // Optimistically update local progress state for instant UI feedback
          const progressResponse = await fetch(
            `/api/student/topics/${topic.id}/progress`,
          );
          const updatedData = await progressResponse.json();
          setProgressData(updatedData);

          // Nudge the learner to the next step without requiring any action
          if (isLastTopicOfCourse) {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
              colors: ["#2563EB", "#3B82F6", "#60A5FA", "#EAB308", "#10B981"]
            });
            setShowCompletionModal(true);
          } else if (nextTopicId) {
            toast.success("✅ Topic complete! Moving to next lesson...");
            setTimeout(() => {
              router.push(`/student/topics/${nextTopicId}`);
            }, 1500);
          } else {
            toast.success("✅ Topic marked as complete!");
          }
        } else {
          toast.warning("Please pass all required assessments before marking this topic as complete.");
        }
      } else {
        throw new Error("Failed to mark complete");
      }
    } catch (error: any) {
      console.error("Failed to mark completed:", error);
      toast.error("Error updating progress. Please try again.");
    }
  };

  const handleSubmitProject = async () => {
    if (!projectLink.trim()) {
      toast.error("Please enter your project link before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/student/topics/${topic.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: projectLink, description: projectDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmission(data.submission);
      setProjectLink("");
      setProjectDescription("");
      toast.success("Project submitted! Your tutor will review it shortly.");
    } catch (err: any) {
      toast.error(err.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartQuiz = (quizId: string) => {
    if (
      !progressData?.remainingAttempts[quizId] ||
      progressData.remainingAttempts[quizId] === 0
    ) {
      toast.warning("No more attempts remaining for this quiz.");
      return;
    }
    router.push(`/student/quiz/${quizId}?topicId=${topic.id}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-[50vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!progressData?.canAccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Access Denied</span>
            </div>
            <p className="text-red-700 dark:text-red-300 mt-2">
              You don't have access to this topic. Please complete the prerequisites first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = progressData?.progress?.status === "COMPLETED";
  const hasAssessments = topic.quizzes.length > 0;
  const quizzesPassed =
    !hasAssessments ||
    topic.quizzes.every((quiz) =>
      progressData?.progress?.topic?.quizzes?.some(
        (tq: any) =>
          tq.id === quiz.id &&
          tq.attempts?.some((attempt: any) => attempt.passed),
      ),
    );
  const projectApproved = !isProjectTopic || submission?.status === "APPROVED";
  const canMarkComplete = quizzesPassed && projectApproved;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
        <Link
          href={`/student/courses/${topic.module.course.id}`}
          className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {topic.module.course.title}
        </Link>
        <span className="opacity-50">/</span>
        <span className="truncate max-w-[150px] sm:max-w-none">{topic.module.title}</span>
        <span className="opacity-50">/</span>
        <span className="text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-none">{topic.title}</span>
      </nav>

      {/* Preview Alert */}
      {isPreviewOnly && (
        <Card className="border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 shadow-sm">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-start gap-3 text-blue-800 dark:text-blue-300">
                <UnlockIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-base tracking-tight mb-1 flex items-center gap-2">Free Lesson Preview <Badge className="bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 hover:bg-blue-200">PROMO</Badge></div>
                  <p className="text-sm opacity-90 leading-relaxed max-w-lg">
                    Enroll now to track your progress, take quizzes, complete assessments, and earn your verified certificate.
                  </p>
                </div>
              </div>
              <Link href={`/student/courses/${topic.module.course.id}`}>
                <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 whitespace-nowrap h-10 px-6 font-semibold">
                  Unlock Full Course
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic Header Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm relative">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <CardHeader className="relative z-10 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={`${getTopicTypeColor(topic.topicType)} shadow-sm`}>
                  {getTopicIcon(topic.topicType)}
                  <span className="ml-1.5 uppercase tracking-wider text-[10px] font-bold">{topic.topicType}</span>
                </Badge>
                {topic.isRequired && (
                  <Badge variant="secondary" className="shadow-sm dark:bg-slate-800 dark:text-slate-300">Required</Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border-0 shadow-sm">
                    <CheckCircle className="h-3 w-3 mr-1.5" />
                    Completed
                  </Badge>
                )}
                {progressData?.progress?.bestScore && (
                  <Badge variant="outline" className="shadow-sm border-slate-200 dark:border-slate-700">
                    Best Score: {progressData.progress.bestScore}%
                  </Badge>
                )}
              </div>

              <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                {topic.title}
              </CardTitle>

              {topic.description && (
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-3xl mb-6">
                  {topic.description}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-100 dark:border-slate-800/60 text-sm">
                {topic.duration && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span>{topic.duration} minutes</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <Target className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>{topic.passingScore}% to pass</span>
                </div>
                {topic.maxAttempts && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <AlertTriangle className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span>{topic.maxAttempts} attempts max</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>
                    {topic.module.course.creator.firstName} {topic.module.course.creator.lastName}
                  </span>
                </div>
              </div>

              {/* Statistical Progress Block */}
              {progressData?.progress && (
                <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Views</span>
                      <span className="font-bold text-slate-900 dark:text-white">{progressData.progress.viewCount}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Time Spent</span>
                      <span className="font-bold text-slate-900 dark:text-white">{progressData.progress.timeSpent} min</span>
                    </div>
                    {progressData.progress.attemptCount > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Attempts</span>
                        <span className="font-bold text-slate-900 dark:text-white">{progressData.progress.attemptCount}</span>
                      </div>
                    )}
                    {progressData.progress.averageScore && (
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Score</span>
                        <span className="font-bold text-slate-900 dark:text-white">{progressData.progress.averageScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Prerequisite Hard Stop */}
      {topic.prerequisiteTopic && (
        <Card className="border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Prerequisite Required</span>
            </div>
            <p className="text-orange-700 dark:text-orange-300 mt-2">
              Complete "{topic.prerequisiteTopic.title}" before generating progress on this topic.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Video Block */}
      {topic.videoUrl && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-blue-500" />
              Primary Lecture Video
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video bg-slate-900 w-full relative">
              <ReactPlayer 
                url={topic.videoUrl} 
                controls 
                width="100%" 
                height="100%" 
                style={{ position: "absolute", top: 0, left: 0 }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Markdown Content */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-slate-400" />
            Reading Material
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 px-6 sm:px-10 pb-10">
          <div className="prose prose-slate dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-headings:mt-10 prose-headings:mb-5
            prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-loose prose-p:my-6
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-bold
            prose-ul:list-disc prose-ul:pl-6 prose-ul:my-6 prose-li:marker:text-slate-400 dark:prose-li:marker:text-slate-500 prose-li:my-3
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-6
            sm:prose-lg"
          >
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{topic.content}</ReactMarkdown>
          </div>

          {/* Further Research (Gated) */}
          {quizzesPassed && topic.furtherReadingLinks && (
            <div className="mt-8 border-t border-emerald-200 dark:border-emerald-800/30 pt-6 animate-in fade-in duration-500 delay-150">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl leading-none">🔓</span>
                <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  Further Research — Unlocked
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                You earned these resources by completing the required assessments. Go deeper into this topic.
              </p>
              <div className="grid gap-2">
                {(typeof topic.furtherReadingLinks === "string"
                  ? JSON.parse(topic.furtherReadingLinks)
                  : topic.furtherReadingLinks
                ).map((link: any) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-300 dark:hover:border-emerald-800/50 transition-all group shadow-sm"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 mb-1 flex items-center gap-2">
                      {link.title}
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 -ml-1 transition-all group-hover:opacity-100 group-hover:ml-0 text-emerald-500" />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {link.description}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments */}
      {topic.attachments && topic.attachments.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-slate-400" />
              Resources & Downloads
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-3">
              {topic.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">Resource Attachment {index + 1}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{attachment}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 bg-white dark:bg-slate-900">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Submission Box */}
      {isProjectTopic && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
          <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <Github className="h-5 w-5 text-indigo-500" />
              Project Submission
            </CardTitle>
            {submission && (
              <Badge
                variant="outline"
                className={
                  submission.status === "APPROVED"
                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
                    : submission.status === "CHANGES_REQUIRED"
                    ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-400"
                    : submission.status === "REJECTED"
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
                    : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400"
                }
              >
                {submission.status.replace("_", " ")}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {dueDate && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Deadline: <span className="font-semibold">{dueDate.toLocaleString()}</span>
                  </span>
                </div>
                {deadlinePassed && (
                  <Badge variant="destructive" className="w-fit">Deadline Passed</Badge>
                )}
              </div>
            )}

            {/* If submission is pending review or approved, show read-only state, unless changes required or rejected */}
            {submission && !["CHANGES_REQUIRED", "REJECTED"].includes(submission.status) ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Submitted Link</h4>
                  <a
                    href={submission.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 break-all"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    {submission.content}
                  </a>
                </div>
                
                {submission.description && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Student Notes</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                      {submission.description}
                    </p>
                  </div>
                )}

                {submission.reviewNotes && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Tutor Feedback
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                      {submission.reviewNotes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {submission?.reviewNotes && (
                  <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl">
                    <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Tutor Feedback (Changes Required)
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 whitespace-pre-wrap">
                      {submission.reviewNotes}
                    </p>
                  </div>
                )}

                {deadlinePassed && !submission ? (
                  <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <XCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <h4 className="text-slate-700 dark:text-slate-300 font-medium">Submissions Closed</h4>
                    <p className="text-sm text-slate-500 mt-1">The deadline for this project has passed.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Project URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/yourusername/project"
                        value={projectLink}
                        onChange={(e) => setProjectLink(e.target.value)}
                        required
                        disabled={isSubmitting || isPreviewOnly}
                        className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                      />
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        Link to your GitHub repository, deployed site, or design file.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Notes for Reviewer (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Any specific areas you'd like feedback on?"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        disabled={isSubmitting || isPreviewOnly}
                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleSubmitProject}
                        disabled={isSubmitting || !projectLink.trim() || isPreviewOnly}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : submission ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Submit Revision
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit Project
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quizzes List */}
      {topic.quizzes && topic.quizzes.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <Award className="h-5 w-5 text-blue-500" />
              Required Assessments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {topic.quizzes.map((quiz) => {
                const remainingAttempts = progressData?.remainingAttempts[quiz.id] ?? 0;
                const hasAttemptsLeft = remainingAttempts === -1 || remainingAttempts > 0;
                const passedQuiz = topic.quizzes.some(
                  (q) =>
                    q.id === quiz.id &&
                    progressData?.progress?.topic?.quizzes?.some(
                      (tq: any) =>
                        tq.id === quiz.id &&
                        tq.attempts?.some((attempt: any) => attempt.passed),
                    ),
                );

                return (
                  <div
                    key={quiz.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 border rounded-xl transition-all ${
                      passedQuiz
                        ? "border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-blue-200 dark:hover:border-blue-800"
                    }`}
                  >
                    <div className="mb-4 sm:mb-0">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {quiz.title}
                        {passedQuiz && (
                          <CheckCircle className="h-4.5 w-4.5 text-green-500" />
                        )}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
                        <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> {quiz.questions.length} questions</span>
                        <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5"/> Passing: {quiz.passingScore}%</span>
                        <span className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5"/> Total: {quiz.questions.reduce((sum, q) => sum + q.points, 0)} pts
                        </span>
                        {remainingAttempts !== -1 && (
                          <Badge variant="outline" className={`${remainingAttempts === 0 ? "border-red-200 text-red-600 dark:border-red-900 dark:text-red-400" : "border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400"}`}>
                            {remainingAttempts} attempts left
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isPreviewOnly ? (
                      <div className="text-right flex flex-col items-center sm:items-end w-full sm:w-auto">
                        <Button variant="outline" disabled className="w-full sm:w-auto h-10">
                          <LockIcon className="h-4 w-4 mr-2" />
                          Locked in Preview
                        </Button>
                      </div>
                    ) : hasAttemptsLeft ? (
                      <Button onClick={() => handleStartQuiz(quiz.id)} className={`w-full sm:w-auto h-10 ${passedQuiz ? 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20'}`}>
                        <Play className={`h-4 w-4 mr-2 ${passedQuiz ? '' : 'fill-current'}`} />
                        {passedQuiz ? "Retake for higher score" : "Start Assessment"}
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full sm:w-auto h-10 border-red-200 text-red-500 dark:border-red-900/50 dark:text-red-400">
                        No Attempts Left
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Assessment block condition */}
            {hasAssessments && !isCompleted && (
              <div className="mt-5 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-yellow-800 dark:text-yellow-400 text-sm">Action Required</h5>
                  <p className="text-yellow-700 dark:text-yellow-300 mt-1 text-sm leading-relaxed">
                    You must pass all assessments in this topic before you can mark it as complete and progress to the next module.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completion Actions Box */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 relative overflow-hidden">
        {isCompleted && <div className="absolute inset-0 bg-green-500/5 dark:bg-green-500/10 pointer-events-none" />}
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {isCompleted ? "Topic Completed! 🎉" : isProjectTopic || hasAssessments ? "Ready to move on?" : "Finished reading?"}
              </h3>
              {!isCompleted && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {isProjectTopic && hasAssessments
                    ? "Pass all quizzes and get your project approved by a tutor to unlock completion."
                    : isProjectTopic
                    ? "Get your project approved by a tutor to unlock completion."
                    : hasAssessments
                    ? "Pass all assessments above to unlock the completion status for this topic."
                    : "Make sure you completely understand the material before tracking your completion."}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
              {topic.allowSkip && !topic.isRequired && !isCompleted && (
                <Button variant="outline" className="h-11 dark:border-slate-700">Skip Topic</Button>
              )}
              {isPreviewOnly ? (
                <Link href={`/student/courses/${topic.module.course.id}`} className="w-full">
                  <Button className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold">Join Course to Track</Button>
                </Link>
              ) : !isCompleted ? (
                <Button
                  onClick={handleMarkComplete}
                  disabled={!canMarkComplete}
                  className="h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-md font-semibold"
                >
                  <CheckCircle className="h-4.5 w-4.5 mr-2" />
                  Mark as Complete
                </Button>
              ) : (
                <Button variant="outline" disabled className="h-11 border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400 font-semibold opacity-100">
                  <CheckCircle className="h-4.5 w-4.5 mr-2" />
                  Completed
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 pb-8 border-t border-slate-200 dark:border-slate-800 mt-8">
        {previousTopicId ? (
          <Link href={`/student/topics/${previousTopicId}`}>
            <Button variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:hover:bg-slate-800/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Previous Topic</span>
              <span className="sm:hidden">Prev</span>
            </Button>
          </Link>
        ) : (
          <Link href={`/student/courses/${topic.module.course.id}`}>
            <Button variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:hover:bg-slate-800/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Overview</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        )}

        <div className="text-center px-4">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Pos <span className="text-slate-900 dark:text-slate-300 mx-1">{topic.orderIndex}</span>
          </p>
        </div>

        {isLastTopicOfCourse ? (
             <Button disabled={!isCompleted} onClick={() => {
                 if (isCompleted) {
                     confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }});
                     setShowCompletionModal(true);
                 }
             }} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md font-semibold">
               <span className="hidden sm:inline">Finish Course</span>
               <span className="sm:hidden">Finish</span>
               <CheckCircle className="h-4 w-4 ml-2" />
             </Button>
        ) : nextTopicId ? (
          isCompleted ? (
            <Link href={`/student/topics/${nextTopicId}`}>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 font-bold px-6 transition-all hover:scale-105 active:scale-95">
                <span className="hidden sm:inline">Next Lesson</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="ghost"
              disabled
              title="Complete this topic to unlock the next one"
              className="text-slate-400 dark:text-slate-600 cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next Lesson</span>
              <span className="sm:hidden">Next</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )
        ) : (
          <Button variant="ghost" disabled className="text-slate-600 dark:text-slate-400">
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Exquisite Auto-Completion Celebration Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-md md:max-w-xl text-center rounded-[2rem] border-0 bg-slate-900 shadow-2xl p-0 overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Award className="h-64 w-64 text-emerald-400 rotate-12" />
          </div>
          <div className="relative z-10 p-10 pt-12 text-center flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  <Award className="h-12 w-12 text-emerald-400" />
              </div>
              <DialogTitle className="text-4xl font-black text-white tracking-tight uppercase mb-3 text-center">Mastery Achieved</DialogTitle>
              <DialogDescription className="text-lg text-slate-400 font-medium leading-relaxed max-w-sm mx-auto mb-8 text-center">
                  You have successfully cleared the final module of the "{topic.module.course.title}" curriculum. 
                  Your completion certificate has been automatically minted and generated.
              </DialogDescription>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <Button 
                      onClick={() => router.push(`/student/courses/${topic.module.course.id}?completed=true`)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-xs flex-1 md:flex-initial"
                  >
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                  </Button>
                  <Button 
                      onClick={() => router.push(`/student/achievements`)}
                      variant="outline" 
                      className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border hover:border-emerald-500/30 h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-xs flex-1 md:flex-initial"
                  >
                      View Certificate <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
