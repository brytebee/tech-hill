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
  Layers,
  Sparkles,
  Zap,
  Activity,
  Shield,
  BarChart3,
  ChevronRight,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { ModuleService } from "@/lib/services/moduleService";
import { ModuleActions } from "@/components/modules/module-actions";

async function getModule(moduleId: string) {
  try {
    const module = await ModuleService.getModuleById(moduleId);
    return module;
  } catch (error: any) {
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
      case "LESSON":
        return <BookOpen className="h-3.5 w-3.5" />;
      case "PRACTICE":
        return <Play className="h-3.5 w-3.5" />;
      case "ASSESSMENT":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "RESOURCE":
        return <FileText className="h-3.5 w-3.5" />;
      default:
        return <BookOpen className="h-3.5 w-3.5" />;
    }
  };

  const getTopicTypeStyles = (type: string) => {
    switch (type) {
      case "LESSON":
        return "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30";
      case "PRACTICE":
        return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30";
      case "ASSESSMENT":
        return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30";
      case "RESOURCE":
        return "bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800";
      default:
        return "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30";
    }
  };

  return (
    <AdminLayout
      title="Sequence Management"
      description="Manage educational nodes and structural progression paths"
    >
      <div className="space-y-10 animate-fade-in pb-20">
        {/* Navigation & Superior Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
          <div className="space-y-4">
            <Link href={`/admin/courses/${module.course.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[10px]"
              >
                <ArrowLeft className="h-3 w-3 mr-2" /> Back to Matrix
              </Button>
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-3">
                <Layers className="h-3 w-3" /> Educational Node {module.order}
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase max-w-4xl">
                {module.title}
              </h1>
              <p className="text-slate-500 font-medium mt-3 text-lg flex items-center gap-2">
                Unit of{" "}
                <span className="text-slate-900 dark:text-white font-black italic">
                  {module.course.title}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <ModuleActions
              module={{
                ...module,
                slug: "",
                status: module.course.status as any,
                orderIndex: module.order,
              }}
              totalModules={module.course._count?.modules || 0}
              topicCount={module._count.topics}
              canMoveUp={module.order > 1}
              canMoveDown={module.order < (module.course._count?.modules || 0)}
              // The ModuleActions component likely needs its own high-fidelity treatment,
              // but we wrap the page core first
            />
            <div className="flex gap-2">
              <Badge
                className={`${module.isRequired ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-500"} font-black text-[10px] uppercase tracking-widest px-2.5 py-1 border-none`}
              >
                {module.isRequired ? "REQUIRED PROTOCOL" : "OPTIONAL BRANCH"}
              </Badge>
              {module.prerequisiteModule && (
                <Badge className="bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest px-2.5 py-1 border-none shadow-lg shadow-blue-500/20">
                  PREREQ: {module.prerequisiteModule.title}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Operational Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Unit Density",
              value: module._count.topics,
              icon: BookOpen,
              color: "blue",
              sub: "Individual learning nodes",
            },
            {
              label: "Temporal Span",
              value: `${module.duration}m`,
              icon: Clock,
              color: "indigo",
              sub: "Estimated completion time",
            },
            {
              label: "Mastery Req",
              value: `${module.passingScore}%`,
              icon: Shield,
              color: "emerald",
              sub: "Threshold for progression",
            },
            {
              label: "Temporal Lock",
              value: module.unlockDelay ? `${module.unlockDelay}h` : "NONE",
              icon: Zap,
              color: "amber",
              sub: "Post-prerequisite release",
            },
          ].map((stat, i) => (
            <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </CardTitle>
                <div
                  className={`p-1.5 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-500`}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">
                  {stat.value}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Node Information Matrix */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Manifest Data */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" /> Operational
                  Manifest
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {module.description && (
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                      Functional Description
                    </span>
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed border-l-4 border-indigo-500/30 pl-6 py-1">
                      {module.description}
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {module.prerequisiteModule && (
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                        Blocking Dependency
                      </span>
                      <Link
                        href={`/admin/modules/${module.prerequisiteModule.id}`}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500 hover:text-white transition-all group"
                      >
                        <Shield className="h-5 w-5 text-blue-500 group-hover:text-white" />
                        <span className="font-black uppercase tracking-tight text-sm">
                          {module.prerequisiteModule.title}
                        </span>
                        <ChevronRight className="h-4 w-4 ml-auto opacity-50 group-hover:opacity-100" />
                      </Link>
                    </div>
                  )}

                  {module.dependentModules.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                        Downstream Nodes
                      </span>
                      <div className="space-y-2">
                        {module.dependentModules.map((depModule) => (
                          <Link
                            key={depModule.id}
                            href={`/admin/modules/${depModule.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-white dark:hover:bg-slate-900 transition-all font-bold text-sm text-slate-700 dark:text-slate-300"
                          >
                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                            {depModule.title}
                            <ArrowRight className="h-3 w-3 ml-auto opacity-30" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Neural Content Units (Topics) */}
            <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Content Units
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium whitespace-nowrap">
                    Individual learning telemetry nodes
                  </CardDescription>
                </div>
                <Link href={`/admin/modules/${module.id}/topics/create`}>
                  <Button className="h-10 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl px-5 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-[10px]">
                    <Plus className="h-4 w-4 mr-1.5" /> Inject Unit
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-8">
                {module.topics && module.topics.length > 0 ? (
                  <div className="space-y-4">
                    {module.topics.map((topic, index) => (
                      <div
                        key={topic.id}
                        className="group relative p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-blue-500/30 hover:shadow-xl"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                              {index + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 flex-wrap mb-1">
                                <Link
                                  href={`/admin/topics/${topic.id}`}
                                  className="text-lg font-black text-slate-900 dark:text-white hover:text-blue-600 transition-colors uppercase tracking-tight"
                                >
                                  {topic.title}
                                </Link>
                                <Badge
                                  className={`${getTopicTypeStyles(topic.topicType)} font-black text-[8px] uppercase tracking-tighter px-1.5 py-0 rounded border`}
                                >
                                  {getTopicTypeIcon(topic.topicType)}
                                  <span className="ml-1">
                                    {topic.topicType}
                                  </span>
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {topic.duration && (
                                  <span className="flex items-center gap-1.5 italic">
                                    <Clock className="h-3 w-3" />{" "}
                                    {topic.duration} MINS
                                  </span>
                                )}
                                <span className="flex items-center gap-1.5 italic">
                                  {topic.isRequired ? (
                                    <span className="text-emerald-500">
                                      REQUIRED PROTOCOL
                                    </span>
                                  ) : (
                                    <span>OPTIONAL BRANCH</span>
                                  )}
                                </span>
                                {topic.quizzes && topic.quizzes.length > 0 && (
                                  <span className="text-blue-500 italic bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">
                                    {topic.quizzes.length} ASSESSMENT(S)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <Link
                              href={`/admin/topics/${topic.id}`}
                              className="flex-1 sm:flex-none"
                            >
                              <Button
                                variant="outline"
                                className="h-9 px-4 rounded-xl font-bold border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 w-full transition-all"
                              >
                                View
                              </Button>
                            </Link>
                            <Link
                              href={`/admin/topics/${topic.id}/edit`}
                              className="flex-1 sm:flex-none"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Edit className="h-4 w-4 text-slate-400" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                        {topic.prerequisiteTopic && (
                          <div className="mt-3 ml-14 flex items-center gap-2 text-[10px] font-bold text-slate-400 italic">
                            <Shield className="h-3 w-3" /> PRE-REQ:{" "}
                            {topic.prerequisiteTopic.title}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-700 opacity-50" />
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                      Registry Offline
                    </h3>
                    <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">
                      No content units detected for this operational node.
                    </p>
                    <Link href={`/admin/modules/${module.id}/topics/create`}>
                      <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 uppercase tracking-widest">
                        Initialize Mapping
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Node Metadata (Sidebar) */}
          <div className="space-y-8">
            <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest">
                  Metadata Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase leading-none block mb-1">
                      Architect
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {module.course.creator.firstName}{" "}
                      {module.course.creator.lastName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase leading-none block mb-1">
                      Initialized
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {new Date(module.createdAt).toLocaleDateString(
                        undefined,
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-indigo-500 uppercase leading-none block mb-1">
                      Course Origin
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                      {module.course.title}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Link href={`/admin/courses/${module.course.id}`}>
                    <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-black rounded-2xl shadow-xl transition-all hover:scale-105 uppercase tracking-widest text-[10px]">
                      Expand Root Matrix
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Cognitive Status Target */}
            <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 border-none shadow-2xl rounded-3xl overflow-hidden text-white relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <CardHeader className="relative z-10 p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <BarChart3 className="h-6 w-6" /> Acquisition Target
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 p-8 pt-0">
                <div className="text-6xl font-black mb-4 tabular-nums">
                  {module.passingScore}
                  <span className="text-2xl opacity-60">%</span>
                </div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest leading-relaxed">
                  Required threshold for operational mastery across all{" "}
                  {module._count.topics} learning units.
                </p>
                <div className="mt-8 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white shadow-[0_0_10px_white]"
                    style={{ width: `${module.passingScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
