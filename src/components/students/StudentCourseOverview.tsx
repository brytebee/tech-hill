// src/components/students/StudentCourseOverview.tsx
"use client";

import { useState } from "react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BookOpen,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle,
  Lock,
  FileText,
  Video,
  Award,
  Users,
  Target,
  BarChart3,
  Calendar,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  Shield,
  Star,
  Trophy,
} from "lucide-react";
import Link from "next/link";

export interface Topic {
  id: string;
  title: string;
  duration?: number;
  topicType: string;
  isRequired: boolean;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  passingScore: number;
  prerequisiteModuleId?: string;
  isRequired: boolean;
  topics: Topic[];
  _count: {
    topics: number;
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  difficulty: string;
  duration: number;
  passingScore: number;
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  creator: {
    firstName: string;
    lastName: string;
  };
  modules: Module[];
  _count: {
    enrollments: number;
  };
}

export interface Enrollment {
  id: string;
  status: string;
  overallProgress: number;
  enrolledAt: string;
  completedAt?: string;
}

interface StudentCourseOverviewProps {
  course: Course;
  enrollment: Enrollment;
  userId: string;
  progressData?: {
    moduleProgresses: any[];
    topicProgresses: any[];
  };
}

function getDifficultyBadge(difficulty: string) {
  switch (difficulty) {
    case "BEGINNER":
      return (
        <Badge className="bg-[var(--tw-color-emerald-50)] dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
          BEGINNER
        </Badge>
      );
    case "INTERMEDIATE":
      return (
        <Badge className="bg-[var(--tw-color-amber-50)] dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
          INTERMEDIATE
        </Badge>
      );
    case "ADVANCED":
      return (
        <Badge className="bg-[var(--tw-color-rose-50)] dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
          ADVANCED
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
          GENERAL
        </Badge>
      );
  }
}

function getTopicIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return <Video className="h-4 w-4" />;
    case "PRACTICE":
      return <Target className="h-4 w-4" />;
    case "ASSESSMENT":
      return <Award className="h-4 w-4" />;
    case "RESOURCE":
      return <FileText className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

function ModuleCard({
  module,
  isLocked,
  isExpanded,
  onToggle,
  courseId,
  moduleProgress,
  topicProgresses,
}: {
  module: Module;
  isLocked: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  courseId: string;
  moduleProgress?: any;
  topicProgresses: any[];
}) {
  const completedTopics = topicProgresses.filter(
    (progress) =>
      progress.topicId &&
      module.topics.some((topic) => topic.id === progress.topicId) &&
      progress.status === "COMPLETED"
  ).length;

  const progressPercentage =
    module.topics.length > 0
      ? Math.round((completedTopics / module.topics.length) * 100)
      : 0;

  const moduleStatus = moduleProgress?.status || "NOT_STARTED";
  const isModuleCompleted = moduleStatus === "COMPLETED";

  return (
    <Card className={`group relative transition-all duration-300 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-3xl ${isLocked ? "opacity-60 grayscale-[0.5]" : "hover:border-blue-500/30 hover:shadow-2xl shadow-sm dark:shadow-none"}`}>
      <Collapsible open={isExpanded && !isLocked} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-6 flex-1">
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                    isModuleCompleted ? "bg-emerald-500 text-white shadow-emerald-500/20" :
                    progressPercentage > 0 ? "bg-blue-600 text-white shadow-blue-600/20" :
                    "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-none border border-slate-200 dark:border-slate-700"
                }`}>
                  {isLocked ? (
                    <Lock className="h-6 w-6" />
                  ) : isModuleCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : progressPercentage > 0 ? (
                    <Play className="h-6 w-6 fill-current" />
                  ) : (
                    <div className="font-black text-xl italic">{module.order}</div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      {module.title}
                    </h3>
                    <div className="flex gap-2">
                        {module.isRequired && (
                          <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[8px] uppercase tracking-widest px-1.5 py-0 border-none h-4">
                            REQUIRED
                          </Badge>
                        )}
                        {isModuleCompleted && (
                          <Badge className="bg-emerald-500 text-white font-black text-[8px] uppercase tracking-widest px-1.5 py-0 border-none h-4">
                            FINALIZED
                          </Badge>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                      <Clock className="h-3 w-3" /> {module.duration} MINS
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                      <Layers className="h-3 w-3" /> {completedTopics}/{module.topics.length} UNITS
                    </span>
                    {moduleProgress?.currentScore !== undefined && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 italic">
                        SCORE: {moduleProgress.currentScore}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 pr-4 self-end sm:self-center">
                <div className="text-xs font-black text-slate-900 dark:text-white tracking-widest uppercase">
                  {progressPercentage}% SYNC
                </div>
                <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-950/60 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isModuleCompleted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-8 pb-8 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            {module.description && (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-3xl border-l-[3px] border-blue-500/30 pl-4">{module.description}</p>
            )}

            <div className="space-y-4">
              {module.topics.map((topic, index) => {
                const topicProgress = topicProgresses.find(
                  (progress) => progress.topicId === topic.id
                );
                const isTopicCompleted = topicProgress?.status === "COMPLETED";
                const isTopicInProgress = topicProgress?.status === "IN_PROGRESS";
                const isTopicAccessible =
                  !isLocked &&
                  (index === 0 ||
                    topicProgresses.some(
                      (p) =>
                        module.topics[index - 1] &&
                        p.topicId === module.topics[index - 1].id &&
                        p.status === "COMPLETED"
                    ));

                return (
                  <div
                    key={topic.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 rounded-2xl border transition-all duration-300 ${
                      isTopicCompleted
                        ? "bg-emerald-500/5 border-emerald-500/10 dark:bg-emerald-950/10 dark:border-emerald-900/20"
                        : isTopicInProgress
                        ? "bg-blue-500/5 border-blue-500/20 dark:bg-blue-950/20 dark:border-blue-900/30"
                        : isTopicAccessible
                        ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/30 hover:shadow-lg"
                        : "bg-slate-50/50 dark:bg-slate-950/20 border-transparent opacity-60"
                    }`}
                  >
                    <div className="flex items-center space-x-5 mb-4 sm:mb-0">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                         isTopicCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                         isTopicAccessible ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700" :
                         "bg-transparent text-slate-300 dark:text-slate-700"
                      }`}>
                        {isTopicCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : isTopicAccessible ? (
                          getTopicIcon(topic.topicType)
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm flex items-center gap-2">
                            {topic.title}
                            {isTopicCompleted && <Badge className="h-3 px-1 rounded bg-[var(--tw-color-emerald-50)] dark:bg-emerald-500/10 text-emerald-600 text-[8px] font-black border-none uppercase tracking-tighter">DONE</Badge>}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          {topic.duration && (
                            <span className="flex items-center gap-1.5 italic text-slate-500 dark:text-slate-300">
                              <Clock className="h-3 w-3" />
                              {topic.duration} MINS
                            </span>
                          )}
                          <span className="text-slate-300 font-bold">•</span>
                          <span className="italic">{topic.topicType}</span>
                          {topic.isRequired && (
                            <span className="text-blue-500 dark:text-blue-400 bg-blue-500/5 px-1.5 py-0 rounded border border-blue-500/10">REQ</span>
                          )}
                          {topicProgress?.bestScore !== undefined && (
                            <span className="text-emerald-500 font-black italic">SCORE: {topicProgress.bestScore}%</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isTopicAccessible ? (
                        <Button
                          size="sm"
                          className={`w-full sm:w-auto h-9 px-6 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all hover:scale-105 active:scale-95 ${
                              isTopicCompleted ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" : 
                              "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                          }`}
                          asChild
                        >
                          <Link href={`/student/topics/${topic.id}`}>
                            <Play className={`h-3 w-3 mr-2 ${isTopicCompleted ? '' : 'fill-current'}`} />
                            {isTopicCompleted ? "SYNC AGAIN" : "START UNIT"}
                          </Link>
                        </Button>
                      ) : (
                        <div className="flex items-center justify-center h-9 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          <Lock className="h-3 w-3 mr-2" /> LOCKED
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function StudentCourseOverview({
  course,
  enrollment,
  userId,
  progressData,
}: StudentCourseOverviewProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const moduleProgressMap = new Map();
  const topicProgressMap = new Map();

  if (progressData) {
    progressData.moduleProgresses.forEach((progress) => {
      moduleProgressMap.set(progress.moduleId, progress);
    });

    progressData.topicProgresses.forEach((progress) => {
      topicProgressMap.set(progress.topicId, progress);
    });
  }

  const getLockedModules = () => {
    const locked = new Set<string>();

    course.modules.forEach((module) => {
      if (module.prerequisiteModuleId) {
        const prereqProgress = moduleProgressMap.get(
          module.prerequisiteModuleId
        );
        if (!prereqProgress || prereqProgress.status !== "COMPLETED") {
          locked.add(module.id);
        }
      }
    });

    return locked;
  };

  const lockedModules = getLockedModules();

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      
      {/* Dynamic Command Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 lg:p-12 shadow-2xl group transition-all duration-500 hover:shadow-blue-500/10">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Sparkles className="h-64 w-64 text-blue-400 rotate-12" />
          </div>
          <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {getDifficultyBadge(course.difficulty)}
                <Badge className="bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 border-none shadow-lg shadow-emerald-500/20 animate-pulse">SYNCHRONIZED</Badge>
              </div>
              <h1 className="text-4xl lg:text-7xl font-black text-white tracking-tight leading-none mb-4 uppercase max-w-4xl">
                {course.title}
              </h1>
              <p className="text-slate-400 text-lg lg:text-xl font-medium max-w-3xl leading-relaxed mb-10">
                {course.shortDescription || course.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-white/5 max-w-5xl">
                {[
                  { label: "Temporal Span", value: `${course.duration}H`, icon: Clock },
                  { label: "Unit Count", value: course.modules.flatMap(m => m.topics).length, icon: BookOpen },
                  { label: "Peer Nodes", value: course._count.enrollments, icon: Users },
                  { label: "Mastery Req", value: `${course.passingScore}%`, icon: Shield }
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <stat.icon className="w-3 h-3 mr-2 text-blue-500" /> {stat.label}
                        </span>
                        <span className="text-2xl font-black text-white">{stat.value}</span>
                    </div>
                ))}
              </div>
          </div>
      </div>

      {/* Progress Telemetry */}
      <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 lg:p-10 shadow-sm dark:shadow-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all">
            <Activity className="h-32 w-32 text-indigo-500" />
        </div>
        <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Zap className="h-3 w-3 fill-current" /> Sync Protocol Active
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Global Course Fidelity</h3>
                </div>
                <div className="text-right">
                    <span className="text-5xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                        {enrollment.overallProgress}<span className="text-2xl text-slate-400 opacity-60">%</span>
                    </span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">Composite acquisition value</p>
                </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950/60 rounded-full h-5 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner p-1">
                <div
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                  style={{ width: `${enrollment.overallProgress}%` }}
                />
            </div>
            <div className="flex flex-wrap justify-between gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> LINK ESTABLISHED: <span className="text-slate-900 dark:text-white italic">{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center gap-2 bg-[var(--tw-color-blue-50)] dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/10">
                {enrollment.completedAt
                  ? <span className="text-emerald-500 italic flex items-center gap-1.5"><Trophy className="h-3 w-3" /> MASTERY ACHIEVED</span>
                  : <span className="text-blue-600 dark:text-blue-400 italic">{course.modules.length - lockedModules.size} OF {course.modules.length} NODES UNLOCKED</span>}
              </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Curriculum Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-4">
               <Layers className="h-8 w-8 text-blue-500" /> Sequence Registry
            </h2>
            <div className="h-1 shadow-sm flex-1 ml-6 bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="space-y-6">
            {course.modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                isLocked={lockedModules.has(module.id)}
                isExpanded={expandedModules.has(module.id)}
                onToggle={() => toggleModule(module.id)}
                courseId={course.id}
                moduleProgress={moduleProgressMap.get(module.id)}
                topicProgresses={progressData?.topicProgresses || []}
              />
            ))}
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
          {/* Target Outcomes */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-[2rem] overflow-hidden group">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                  <Target className="h-6 w-6 text-rose-500" /> Target Gains
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <ul className="space-y-6">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-4 group/item">
                      <div className="mt-1 h-5 w-5 rounded-lg bg-[var(--tw-color-emerald-50)] dark:bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300 leading-relaxed uppercase italic tracking-tighter">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Prerequisite Shield */}
          {course.prerequisites && course.prerequisites.length > 0 && (
               <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Protocol Pre-reqs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-3">
                            {course.prerequisites.map((prereq, i) => (
                                <div key={i} className="flex gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 group">
                                    <div className="mt-1 h-2 w-2 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 group-hover:bg-blue-500 transition-all" />
                                    <span>{prereq}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
               </Card>
          )}

          {/* Cognitive Classifications */}
          {course.tags && course.tags.length > 0 && (
             <div className="space-y-4 px-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Star className="h-3 w-3" /> Skill Classifications
                </div>
                <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                        <Badge key={tag} className="bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-500 hover:text-white border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-xl transition-all cursor-default">
                            {tag}
                        </Badge>
                    ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
