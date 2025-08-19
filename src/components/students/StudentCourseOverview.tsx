// components/students/StudentCourseOverview.tsx
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
  Calendar,
  Target,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  duration?: number;
  topicType: string;
  isRequired: boolean;
}

interface Module {
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

interface Course {
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

interface Enrollment {
  id: string;
  status: string;
  overallProgress: number;
  enrolledAt: string;
  completedAt?: string;
}

// interface StudentCourseOverviewProps {
//   course: Course;
//   enrollment: Enrollment;
//   userId: string;
// }

interface StudentCourseOverviewProps {
  course: Course;
  enrollment: Enrollment;
  userId: string;
  progressData?: {
    moduleProgresses: any[];
    topicProgresses: any[];
  };
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "BEGINNER":
      return "bg-green-100 text-green-800 border-green-200";
    case "INTERMEDIATE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "ADVANCED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
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

// function ModuleCard({
//   module,
//   isLocked,
//   isExpanded,
//   onToggle,
//   courseId,
// }: {
//   module: Module;
//   isLocked: boolean;
//   isExpanded: boolean;
//   onToggle: () => void;
//   courseId: string;
// }) {
//   // Mock progress data - in real app, this would come from TopicProgress
//   const completedTopics = Math.floor(module.topics.length * 0.3); // 30% completion mock
//   const progressPercentage =
//     module.topics.length > 0
//       ? Math.round((completedTopics / module.topics.length) * 100)
//       : 0;

//   return (
//     <Card
//       className={`transition-all duration-200 ${isLocked ? "opacity-60" : ""}`}
//     >
//       <Collapsible open={isExpanded && !isLocked} onOpenChange={onToggle}>
//         <CollapsibleTrigger>
//           <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="flex-shrink-0">
//                   {isLocked ? (
//                     <Lock className="h-5 w-5 text-gray-400" />
//                   ) : (
//                     progressPercentage === 100 && (
//                       <CheckCircle className="h-5 w-5 text-green-500" />
//                     )
//                   )}
//                 </div>
//                 <div className="flex-grow">
//                   <CardTitle className="text-lg flex items-center gap-2">
//                     Module {module.order}: {module.title}
//                     {module.isRequired && (
//                       <Badge variant="secondary" className="text-xs">
//                         Required
//                       </Badge>
//                     )}
//                   </CardTitle>
//                   <CardDescription className="flex items-center gap-4 mt-1">
//                     <span className="flex items-center gap-1">
//                       <Clock className="h-3 w-3" />
//                       {module.duration} min
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <BookOpen className="h-3 w-3" />
//                       {module.topics.length} topics
//                     </span>
//                     <span className="text-xs">
//                       Passing: {module.passingScore}%
//                     </span>
//                   </CardDescription>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="text-sm font-medium text-gray-900">
//                   {progressPercentage}%
//                 </div>
//                 <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
//                   <div
//                     className="h-2 bg-blue-600 rounded-full transition-all"
//                     style={{ width: `${progressPercentage}%` }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </CardHeader>
//         </CollapsibleTrigger>

//         <CollapsibleContent>
//           <CardContent className="pt-0">
//             {module.description && (
//               <p className="text-sm text-gray-600 mb-4">{module.description}</p>
//             )}

//             <div className="space-y-2">
//               {module.topics.map((topic, index) => {
//                 const isTopicCompleted = index < completedTopics;
//                 const isTopicCurrent = index === completedTopics && !isLocked;

//                 return (
//                   <div
//                     key={topic.id}
//                     className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
//                       isTopicCompleted
//                         ? "bg-green-50 border-green-200"
//                         : isTopicCurrent
//                         ? "bg-blue-50 border-blue-200"
//                         : "bg-gray-50 border-gray-200"
//                     }`}
//                   >
//                     <div className="flex items-center space-x-3">
//                       <div className="flex-shrink-0">
//                         {isTopicCompleted ? (
//                           <CheckCircle className="h-4 w-4 text-green-500" />
//                         ) : (
//                           getTopicIcon(topic.topicType)
//                         )}
//                       </div>
//                       <div>
//                         <div className="font-medium text-sm">{topic.title}</div>
//                         <div className="flex items-center gap-2 text-xs text-gray-500">
//                           {topic.duration && (
//                             <span className="flex items-center gap-1">
//                               <Clock className="h-3 w-3" />
//                               {topic.duration} min
//                             </span>
//                           )}
//                           <Badge
//                             variant="outline"
//                             className="text-xs px-1 py-0"
//                           >
//                             {topic.topicType.toLowerCase()}
//                           </Badge>
//                           {topic.isRequired && (
//                             <Badge
//                               variant="secondary"
//                               className="text-xs px-1 py-0"
//                             >
//                               Required
//                             </Badge>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex-shrink-0">
//                       {isTopicCompleted || isTopicCurrent ? (
//                         <Link href={`/student/topics/${topic.id}`}>
//                           <Button
//                             size="sm"
//                             variant={isTopicCompleted ? "outline" : "default"}
//                           >
//                             <Play className="h-3 w-3 mr-1" />
//                             {isTopicCompleted ? "Review" : "Start"}
//                           </Button>
//                         </Link>
//                       ) : (
//                         <Button size="sm" variant="ghost" disabled>
//                           <Lock className="h-3 w-3 mr-1" />
//                           Locked
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </CardContent>
//         </CollapsibleContent>
//       </Collapsible>
//     </Card>
//   );
// }

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
  // Calculate actual progress from database
  const completedTopics = topicProgresses.filter(
    progress => progress.topicId && 
    module.topics.some(topic => topic.id === progress.topicId) &&
    progress.status === "COMPLETED"
  ).length;

  const progressPercentage = module.topics.length > 0
    ? Math.round((completedTopics / module.topics.length) * 100)
    : 0;

  const moduleStatus = moduleProgress?.status || "NOT_STARTED";
  const isModuleCompleted = moduleStatus === "COMPLETED";

  return (
    <Card className={`transition-all duration-200 ${isLocked ? "opacity-60" : ""}`}>
      <Collapsible open={isExpanded && !isLocked} onOpenChange={onToggle}>
        <CollapsibleTrigger>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {isLocked ? (
                    <Lock className="h-5 w-5 text-gray-400" />
                  ) : isModuleCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : progressPercentage > 0 ? (
                    <Play className="h-5 w-5 text-blue-500" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-grow">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Module {module.order}: {module.title}
                    {module.isRequired && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                    {isModuleCompleted && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Completed
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {module.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {completedTopics}/{module.topics.length} topics
                    </span>
                    <span className="text-xs">
                      Passing: {module.passingScore}%
                    </span>
                    {moduleProgress?.currentScore && (
                      <span className="text-xs text-green-600">
                        Score: {moduleProgress.currentScore}%
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {progressPercentage}%
                </div>
                <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isModuleCompleted ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {module.description && (
              <p className="text-sm text-gray-600 mb-4">{module.description}</p>
            )}

            <div className="space-y-2">
              {module.topics.map((topic, index) => {
                const topicProgress = topicProgresses.find(
                  progress => progress.topicId === topic.id
                );
                const isTopicCompleted = topicProgress?.status === "COMPLETED";
                const isTopicInProgress = topicProgress?.status === "IN_PROGRESS";
                const isTopicAccessible = !isLocked && (
                  index === 0 || 
                  topicProgresses.some(p => 
                    module.topics[index - 1] && 
                    p.topicId === module.topics[index - 1].id && 
                    p.status === "COMPLETED"
                  )
                );

                return (
                  <div
                    key={topic.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isTopicCompleted
                        ? "bg-green-50 border-green-200"
                        : isTopicInProgress
                        ? "bg-blue-50 border-blue-200"
                        : isTopicAccessible
                        ? "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {isTopicCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : isTopicAccessible ? (
                          getTopicIcon(topic.topicType)
                        ) : (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{topic.title}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {topic.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {topic.duration} min
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {topic.topicType.toLowerCase()}
                          </Badge>
                          {topic.isRequired && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-1 py-0"
                            >
                              Required
                            </Badge>
                          )}
                          {topicProgress?.bestScore && (
                            <span className="text-xs text-green-600">
                              Best: {topicProgress.bestScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isTopicAccessible ? (
                        <Link href={`/student/topics/${topic.id}`}>
                          <Button
                            size="sm"
                            variant={isTopicCompleted ? "outline" : "default"}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            {isTopicCompleted ? "Review" : "Start"}
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="ghost" disabled>
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
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
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Determine which modules are locked based on prerequisites
  // const getLockedModules = () => {
  //   const completed = new Set<string>(); // Mock - would come from ModuleProgress
  //   const locked = new Set<string>();

  //   course.modules.forEach((module) => {
  //     if (
  //       module.prerequisiteModuleId &&
  //       !completed.has(module.prerequisiteModuleId)
  //     ) {
  //       locked.add(module.id);
  //     }
  //   });

  //   return locked;
  // };

  // const lockedModules = getLockedModules();

    // Create maps for quick lookup of progress data
  const moduleProgressMap = new Map();
  const topicProgressMap = new Map();

  if (progressData) {
    progressData.moduleProgresses.forEach(progress => {
      moduleProgressMap.set(progress.moduleId, progress);
    });

    progressData.topicProgresses.forEach(progress => {
      topicProgressMap.set(progress.topicId, progress);
    });
  }

  const getLockedModules = () => {
    const locked = new Set<string>();

    course.modules.forEach((module) => {
      if (module.prerequisiteModuleId) {
        const prereqProgress = moduleProgressMap.get(module.prerequisiteModuleId);
        if (!prereqProgress || prereqProgress.status !== "COMPLETED") {
          locked.add(module.id);
        }
      }
    });

    return locked;
  };

  const lockedModules = getLockedModules();

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Enrolled
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-4">
                {course.shortDescription || course.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{course.duration} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span>{course.modules.length} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{course._count.enrollments} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                  <span>{course.passingScore}% to pass</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Course Progress</h3>
              <span className="text-sm font-medium">
                {enrollment.overallProgress}%
              </span>
            </div>
            <Progress value={enrollment.overallProgress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>
                Started {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </span>
              <span>
                {enrollment.completedAt
                  ? `Completed ${new Date(
                      enrollment.completedAt
                    ).toLocaleDateString()}`
                  : `${course.modules.length - lockedModules.size} of ${
                      course.modules.length
                    } modules available`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Outcomes */}
      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {course.learningOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{outcome}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Course Modules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Content</h2>

        {/* {course.modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            isLocked={lockedModules.has(module.id)}
            isExpanded={expandedModules.has(module.id)}
            onToggle={() => toggleModule(module.id)}
            courseId={course.id}
          />
        ))} */}
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

      {/* Course Tags */}
      {course.tags && course.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topics Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
