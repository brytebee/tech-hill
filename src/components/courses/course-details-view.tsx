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
  Layers,
  Sparkles,
  Zap,
  Activity,
  ArrowRight,
  Shield,
  FileText,
  TrendingUp,
  SearchCode,
} from "lucide-react";
import Link from "next/link";
import { EnrollButton } from "@/components/students/EnrollButton";

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
  hasSubscription?: boolean;
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
  hasSubscription = false,
  onEnroll,
  onUnenroll,
  onDeleteCourse,
  onToggleStatus,
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

  // Status and difficulty variants with premium colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <Badge className="bg-[var(--tw-color-emerald-50)] dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            PUBLISHED
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge className="bg-[var(--tw-color-amber-50)] dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            DRAFT
          </Badge>
        );
      case "ARCHIVED":
        return (
          <Badge className="bg-[var(--tw-color-rose-50)] dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            ARCHIVED
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return (
          <Badge className="bg-[var(--tw-color-blue-50)] dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            BEGINNER
          </Badge>
        );
      case "INTERMEDIATE":
        return (
          <Badge className="bg-[var(--tw-color-indigo-50)] dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            INTERMEDIATE
          </Badge>
        );
      case "ADVANCED":
        return (
          <Badge className="bg-[var(--tw-color-purple-50)] dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            ADVANCED
          </Badge>
        );
      default:
        return <Badge variant="secondary">{difficulty}</Badge>;
    }
  };

  const renderEnrollmentButton = () => {
    if (course.status !== "PUBLISHED") return null;

    // Handle Unauthenticated State
    if (!currentUser) {
      return (
        <Link href={`/register?redirect=/courses/${course.id}`}>
          <Button className="h-12 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 text-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
            <Zap className="h-5 w-5 mr-2 fill-current" />
            Sign Up to Enroll
          </Button>
        </Link>
      );
    }

    if (!isStudent) return null;

    if (isEnrolled) {
      return (
        <div className="flex flex-wrap gap-3">
          {isCompleted && hasCertificate && (
            <Button
              variant="outline"
              className="h-11 border-slate-200 dark:border-slate-800 rounded-xl font-bold"
            >
              <Download className="h-4 w-4 mr-2" />
              Certificate
            </Button>
          )}
          <Link href={`${basePath}/courses/${course.id}`}>
            <Button className="h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-black px-6 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs">
              <Play className="h-4 w-4 mr-2 fill-current" />
              {isCompleted ? "Review Asset" : "Access Sync"}
            </Button>
          </Link>
          {onUnenroll && (
            <Button
              variant="ghost"
              onClick={onUnenroll}
              className="h-11 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold px-4 rounded-xl"
            >
              Withdraw
            </Button>
          )}
        </div>
      );
    }

    return (
      <EnrollButton
        courseId={course.id}
        courseTitle={course.title}
        price={Number(course.price)}
        isEnrolled={false}
        hasSubscription={hasSubscription}
        className="h-12 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 text-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
      >
        <Zap className="h-5 w-5 mr-2 fill-current" />
        Initialize Enrollment
      </EnrollButton>
    );
  };

  const renderManagementActions = () => {
    if (!canEdit) return null;

    return (
      <div className="flex flex-wrap gap-3">
        <Link href={`${basePath}/courses/${course.id}/edit`}>
          <Button className="h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold px-6 rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs">
            <Edit className="h-4 w-4 mr-2" />
            Modify Manifest
          </Button>
        </Link>

        {onToggleStatus && (
          <Button
            variant="outline"
            onClick={onToggleStatus}
            className="h-11 border-slate-200 dark:border-slate-800 font-bold rounded-xl px-4 transition-all"
          >
            {course.status === "PUBLISHED" ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Retract
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Deploy
              </>
            )}
          </Button>
        )}

        {canDelete && onDeleteCourse && (
          <Button
            variant="ghost"
            onClick={onDeleteCourse}
            className="h-11 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold px-4 rounded-xl transition-all"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Purge
          </Button>
        )}
      </div>
    );
  };

  const renderStudentProgress = () => {
    if (!isStudent || !isEnrolled) return null;

    return (
      <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <TrendingUp className="h-24 w-24 text-blue-500" />
        </div>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" /> Synchronization
            Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Cognitive Mastery
              </span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                {userEnrollment.overallProgress}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950/60 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                style={{ width: `${userEnrollment.overallProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block mb-1">
                Initialized
              </span>
              <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                {new Date(userEnrollment.enrolledAt).toLocaleDateString()}
              </p>
            </div>
            {isCompleted ? (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase leading-none block mb-1">
                  Finalized
                </span>
                <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  {new Date(userEnrollment.completedAt!).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/40">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase leading-none block mb-1">
                  Status
                </span>
                <p className="text-sm font-black text-blue-700 dark:text-blue-400 uppercase tracking-tighter">
                  OPERATIONAL
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCourseStats = () => {
    const stats = [
      {
        label: "Community",
        value: course._count?.enrollments || 0,
        icon: Users,
        sub: "Active members",
        color: "blue",
      },
      {
        label: "Matrix",
        value: course._count?.modules || 0,
        icon: Layers,
        sub: "Sequence nodes",
        color: "indigo",
      },
      {
        label: "Duration",
        value: `${course.duration}h`,
        icon: Clock,
        sub: "Temporal scope",
        color: "emerald",
      },
    ];

    if (canEdit) {
      const completionRate =
        course._count?.enrollments > 0
          ? Math.round(
              ((course._count?.completedEnrollments || 0) /
                course._count.enrollments) *
                100,
            )
          : 0;
      stats.push({
        label: "Success Rate",
        value: `${completionRate}%`,
        icon: Award,
        sub: "Mastery achievement",
        color: "amber",
      });
    } else {
      const rating = course.averageRating
        ? course.averageRating.toFixed(1)
        : "N/A";
      stats.push({
        label: "Reception",
        value: rating,
        icon: Star,
        sub: "Peer review score",
        color: "amber",
      });
    }

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all hover:shadow-lg rounded-2xl"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {stat.label}
              </CardTitle>
              <div
                className={`p-1 w-6 h-6 rounded bg-${stat.color}-500/10 text-${stat.color}-500 flex items-center justify-center`}
              >
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">
                {stat.value}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderModulesSection = () => {
    const hasModules = course.modules && course.modules.length > 0;

    return (
      <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Sequence Matrix
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                {canEdit
                  ? "Orchestrate cognitive progression paths"
                  : "Curriculum architectural nodes"}
              </CardDescription>
            </div>
            {canManageModules && (
              <Link href={`${basePath}/courses/${course.id}/modules/new`}>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Inject Node
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {hasModules ? (
            <div className="space-y-6">
              {course.modules.map((module: any, index: number) => (
                <div
                  key={module.id}
                  className="group relative p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-blue-500/30 hover:shadow-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-[var(--tw-color-blue-50)] dark:bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-black text-sm">
                          {index + 1}
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">
                          {module.title}
                        </h4>
                      </div>
                      {module.description && (
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                          {module.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-4 !text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          <BookOpen className="h-3 w-3" />{" "}
                          {module._count?.topics || 0} UNITS
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          <Clock className="h-3 w-3" /> {module.duration || 0}m
                          SCOPE
                        </span>
                        {isStudent &&
                          userEnrollment &&
                          module.progress !== undefined && (
                            <span className="text-blue-600 dark:text-blue-400 font-black">
                              {module.progress}% SYNCED
                            </span>
                          )}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Link
                          href={`${basePath}/courses/${course.id}/modules/${module.id}/edit`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-lg hover:bg-white dark:hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4 text-slate-400" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 group/del"
                        >
                          <Trash2 className="h-4 w-4 text-slate-400 group-hover/del:text-rose-500" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {module.topics && module.topics.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      {module.topics.map((topic: any) => (
                        <div
                          key={topic.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isStudent && topic.completed ? (
                              <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                                <CheckCircle className="h-3 w-3" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                              </div>
                            )}
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                              {topic.title}
                            </span>
                            {topic.isPreview && (
                              <Badge className="bg-[var(--tw-color-emerald-50)] dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] font-black px-1.5 py-0 rounded uppercase tracking-tighter">
                                PREVIEW ACCESSIBLE
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            <span className="hidden sm:inline italic">
                              {topic.topicType}
                            </span>
                            {topic.duration && (
                              <span className="hidden sm:inline tabular-nums">
                                ({topic.duration}m)
                              </span>
                            )}
                            {topic.isPreview && (
                              <Link href={`/student/topics/${topic.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[10px] font-black border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 px-3 rounded-lg flex gap-1.5"
                                >
                                  <Play className="h-3 w-3 fill-current" />{" "}
                                  PREVIEW
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <SearchCode className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
              <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                Registry Offline
              </h4>
              <p className="text-sm font-medium text-slate-500">
                {canEdit
                  ? "No cognitive sequences detected. Initialize module injection."
                  : "Curriculum expansion currently in progress."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Dynamic Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 lg:p-12 shadow-2xl group transition-all duration-500 hover:shadow-blue-500/10">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
          <Sparkles className="h-64 w-64 text-blue-400" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {getStatusBadge(course.status)}
            {getDifficultyBadge(course.difficulty)}
            {Number(course.price) === 0 && !course.activeFlashSale && (
              <Badge className="bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 border-none">
                FREE ACCESS
              </Badge>
            )}
            {course.activeFlashSale && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest animate-pulse shadow-lg shadow-orange-500/20">
                <Zap className="h-3 w-3 fill-current" /> CAMPAIGN ACTIVE -
                {course.activeFlashSale.discountPercentage}%
              </div>
            )}
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-tighter mb-4 uppercase max-w-4xl">
            {course.title}
          </h1>
          <p className="text-slate-400 text-lg lg:text-xl font-medium max-w-3xl leading-relaxed mb-8">
            {course.shortDescription || course.description}
          </p>

          <div className="flex flex-wrap gap-4">
            {renderManagementActions()}
            {renderEnrollmentButton()}
          </div>
        </div>
      </div>

      {/* Synchronized Telemetry & Stats */}
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {renderStudentProgress()}
          {renderCourseStats()}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Detailed Manifest */}
            <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl transition-all hover:border-blue-500/20">
              <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" /> Manifest
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Asset Valuation
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {Number(course.price) > 0
                          ? `₦${Number(course.price).toLocaleString()}`
                          : "FREE"}
                      </p>
                      {course.activeFlashSale &&
                        Number(course.originalPrice) > Number(course.price) && (
                          <span className="text-xs text-slate-400 line-through font-bold">
                            ₦{Number(course.originalPrice).toLocaleString()}
                          </span>
                        )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Sync Standard
                    </span>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {course.passingScore}% MASTERY
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Certification
                    </span>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase italic">
                      {course.isCertificateFree
                        ? "FREE INCLUSIVE"
                        : `₦${course.certificatePrice || "2,000"}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Skill Complexity
                    </span>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase italic tracking-tighter">
                      {course.difficulty}
                    </p>
                  </div>
                </div>

                {course.tags && course.tags.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3 tracking-widest">
                      Cognitive Classifications
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-lg"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Neural Meta Data */}
            <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl transition-all hover:border-indigo-500/20">
              <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" /> Sequence
                  Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block">
                        Architect
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {course.creator?.firstName || "System"}{" "}
                        {course.creator?.lastName || ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block">
                        Initialized
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {new Date(course.createdAt).toLocaleDateString(
                          undefined,
                          { month: "long", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>

                  {course.publishedAt && (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                        <Play className="h-5 w-5 fill-current" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block">
                          Deployment
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase">
                          {new Date(course.publishedAt).toLocaleDateString()}{" "}
                          SYNC ACTIVE
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {course.learningOutcomes &&
                  course.learningOutcomes.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-4 tracking-widest">
                        Target Gains
                      </span>
                      <ul className="space-y-3">
                        {course.learningOutcomes.map(
                          (outcome: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2.5 group"
                            >
                              <div className="mt-1 rounded-full p-0.5 bg-[var(--tw-color-indigo-50)] dark:bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <ArrowRight className="h-2 w-2" />
                              </div>
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed uppercase italic tracking-tighter">
                                {outcome}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                {canEdit && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-4 w-4 text-rose-500" />
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                        Protocol Override
                      </span>
                    </div>
                    <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">Sequence Lock</span>
                        <span className="text-slate-900 dark:text-white">
                          {course.requireSequentialCompletion
                            ? "ENABLED"
                            : "BYPASSED"}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">Retry Protocol</span>
                        <span className="text-slate-900 dark:text-white">
                          {course.allowRetakes ? "INFINITE" : "RESTRICTED"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Earning Potential Hero Card */}
          {course.earningPotential && (() => {
            const ep = typeof course.earningPotential === "string" ? JSON.parse(course.earningPotential) : course.earningPotential;
            return (
              <div className="mt-12 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                    Your Earning Potential
                  </span>
                </div>
                
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 border-emerald-200/50 dark:border-emerald-800/30 shadow-xl shadow-emerald-500/5 rounded-[2rem] overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-emerald-200/50 dark:divide-emerald-900/50">
                      
                      {/* Left: Salary Breakdown */}
                      <div className="p-8 lg:col-span-2 space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                          
                          {ep.remoteSalaryUSD && (
                            <div className="bg-white/60 dark:bg-slate-900/40 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                              <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                                Remote Global Role
                              </h4>
                              <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                ${ep.remoteSalaryUSD.min.toLocaleString()} - ${ep.remoteSalaryUSD.max.toLocaleString()}<span className="text-sm font-bold text-slate-400">/mo</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {ep.remoteSalaryUSD.context}
                              </p>
                            </div>
                          )}

                          {ep.freelanceRateUSD && (
                            <div className="bg-white/60 dark:bg-slate-900/40 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                              <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                                Freelance ({ep.freelanceRateUSD.platform})
                              </h4>
                              <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                ${ep.freelanceRateUSD.min} - ${ep.freelanceRateUSD.max}<span className="text-sm font-bold text-slate-400">/hr</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Global contracting rate
                              </p>
                            </div>
                          )}

                          {ep.localSalaryNGN && (
                            <div className="bg-white/60 dark:bg-slate-900/40 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 sm:col-span-2">
                              <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                                Local Tech Hub (Nigeria)
                              </h4>
                              <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                ₦{ep.localSalaryNGN.min.toLocaleString()} - ₦{ep.localSalaryNGN.max.toLocaleString()}<span className="text-sm font-bold text-slate-400">/mo</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {ep.localSalaryNGN.context}
                              </p>
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Right: Real Story */}
                      <div className="p-8 bg-emerald-600 dark:bg-emerald-900 text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                          <TrendingUp className="h-32 w-32" />
                        </div>
                        {ep.realStory && (
                          <div className="relative z-10">
                            <div className="text-xs font-black text-emerald-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                              Real Learner Win
                            </div>
                            <blockquote className="text-lg font-medium leading-relaxed italic mb-6">
                              "{ep.realStory.quote}"
                            </blockquote>
                            <div>
                              <div className="font-bold">{ep.realStory.name}</div>
                              <div className="text-xs text-emerald-200/80">{ep.realStory.location}</div>
                            </div>
                          </div>
                        )}
                        {ep.timeToFirstGigWeeks && (
                          <div className="mt-auto pt-6 border-t border-emerald-500/50 relative z-10">
                            <div className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">
                              Target Trajectory
                            </div>
                            <div className="font-bold flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {ep.timeToFirstGigWeeks} weeks to first paid gig
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {/* Course Matrix */}
          {renderModulesSection()}
        </div>

        <div className="space-y-8">
          {/* Enrollment Trigger for Students */}
          {!isEnrolled && isStudent && course.status === "PUBLISHED" && (
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-2xl rounded-3xl overflow-hidden text-white relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <CardHeader className="relative z-10 text-center p-8">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
                  <Zap className="h-8 w-8 fill-current" />
                </div>
                <CardTitle className="text-3xl font-black uppercase tracking-tight mb-2">
                  Initialize Link
                </CardTitle>
                <CardDescription className="text-blue-100 font-medium">
                  Link your cognitive profile to this sequence manifest.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 text-center p-8 pt-0">
                <div className="text-5xl font-black mb-6">
                  {Number(course.price) > 0 ? (
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1 opacity-60">
                        Sequence Value
                      </span>
                      <span className="flex items-baseline gap-1">
                        <span className="text-2xl opacity-60">₦</span>
                        {Number(course.price).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    "FREE"
                  )}
                </div>
                {renderEnrollmentButton()}
                <p className="text-[10px] font-bold text-blue-200 mt-6 uppercase tracking-widest opacity-60 flex items-center justify-center gap-2">
                  <Shield className="h-3 w-3" /> SECURED ENROLLMENT SEQUENCE
                  04-B
                </p>
              </CardContent>
            </Card>
          )}

          {/* Architect Profile */}
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest">
                Architect Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <User className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                    {course.creator?.firstName || "System"}{" "}
                    {course.creator?.lastName || ""}
                  </h4>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1 italic">
                    Authorized Architect
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                  <span className="text-slate-400">Sequence Library</span>
                  <span className="text-slate-900 dark:text-white">
                    12 Assets
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                  <span className="text-slate-400">Global Peers</span>
                  <span className="text-slate-900 dark:text-white">
                    1,402 Students
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Syallbus / Prerequisites Node */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest">
                  Prerequisite Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {course.prerequisites.map((prereq: string, i: number) => (
                    <div
                      key={i}
                      className="flex gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 group"
                    >
                      <div className="mt-1 h-3 w-3 rounded bg-[var(--tw-color-blue-50)] dark:bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500" />
                      <span>{prereq}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
