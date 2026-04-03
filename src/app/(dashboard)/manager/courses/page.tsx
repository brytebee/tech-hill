// app/(dashboard)/manager/courses/page.tsx
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Users,
  Clock,
  DollarSign,
  Plus,
  Edit,
  Eye,
  Search,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  SearchCode,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { CourseService } from "@/lib/services/courseService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getManagerCourses(managerId: string) {
  try {
    const response = await CourseService.getCourses({ creatorId: managerId });
    return response.courses;
  } catch (error: any) {
    console.error("Error fetching manager courses:", error);
    return [];
  }
}

export default async function ManagerCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#060a12]">
            <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Requesting Clearance...</p>
        </div>
    );
  }

  const courses = await getManagerCourses(session.user.id);

  return (
    <ManagerLayout
      title="Course Inventory"
      description="Detailed overview and management of your intellectual assets"
    >
      <div className="space-y-8 animate-fade-in">
        
        {/* Header Actions & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                placeholder="Query course registry..." 
                className="pl-10 h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500/20 shadow-sm dark:shadow-none transition-all"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 text-slate-600 dark:text-slate-400 font-semibold shadow-sm dark:shadow-none">
                <SelectValue placeholder="Manifest Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                <SelectItem value="all">Entire Registry</SelectItem>
                <SelectItem value="published">Live Sequences</SelectItem>
                <SelectItem value="draft">Draft Manifests</SelectItem>
                <SelectItem value="archived">Archived Units</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/manager/courses/create" className="w-full lg:w-auto">
            <Button className="w-full lg:w-auto h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
              <Plus className="h-5 w-5 mr-2" />
              Create New Sequence
            </Button>
          </Link>
        </div>

        {/* Global Statistics Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Asset Count", value: courses.length, icon: BookOpen, color: "blue", sub: "Total sequences" },
            { label: "Live Deployment", value: courses.filter(c => c.status === "PUBLISHED").length, icon: Eye, color: "emerald", sub: "Active in matrix" },
            { label: "Student Density", value: courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0), icon: Users, color: "indigo", sub: "Global reach" },
            { label: "Yield Estimator", value: courses.reduce((sum, c) => sum + (Number(c.price) * (c._count?.enrollments || 0)), 0), isCurrency: true, icon: DollarSign, color: "amber", sub: "Projected revenue" }
          ].map((stat, i) => (
            <Card key={i} className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all hover:shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    <div className={`p-1.5 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-500`}>
                        <stat.icon className="h-4 w-4" />
                    </div>
                </div>
                <div className="flex items-baseline gap-1">
                    {stat.isCurrency && <span className="text-lg font-bold text-slate-400">₦</span>}
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {stat.isCurrency ? stat.value.toLocaleString() : stat.value}
                    </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Course Registry Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group relative flex flex-col bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 rounded-3xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 flex gap-2">
                    <Badge className={`
                        font-black text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded-full border-none
                        ${course.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}
                    `}>
                        {course.status}
                    </Badge>
                </div>

                <CardHeader className="pb-4 pt-8">
                    <CardTitle className="text-xl font-black text-slate-900 dark:text-white line-clamp-1 leading-tight group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed min-h-[40px]">
                      {course.shortDescription || course.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-6 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                        <Users className="h-4 w-4 text-indigo-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Students</span>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">{course._count?.enrollments || 0}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                        <Layers className="h-4 w-4 text-blue-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Modules</span>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">{course._count?.modules || 0}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                        <Clock className="h-4 w-4 text-emerald-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Duration</span>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">{course.duration}h</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                        <Badge className={`
                            text-[10px] font-black uppercase tracking-tighter px-1.5 py-0 rounded border-none w-full text-center
                            ${course.difficulty === 'ADVANCED' ? 'bg-purple-500/10 text-purple-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}
                        `}>
                            {course.difficulty}
                        </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <DollarSign className="h-4 w-4" />
                        </div>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                            {Number(course.price) > 0 ? `₦${Number(course.price).toLocaleString()}` : 'FREE'}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase italic">
                        <Calendar className="h-3 w-3" /> Updated {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link href={`/manager/courses/${course.id}`} className="flex-1">
                      <Button variant="outline" className="w-full h-10 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl transition-all">
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </Link>
                    <Link href={`/manager/courses/${course.id}/edit`} className="flex-1">
                      <Button className="w-full h-10 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl py-24 text-center">
            <CardContent>
              <div className="mx-auto w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 border border-slate-200 dark:border-slate-800 shadow-inner">
                <SearchCode className="h-12 w-12" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Sequence Registry Empty</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mb-10 text-lg leading-relaxed">
                Initial catalog scan yielded zero curriculum sequences. Deploy your first educational asset into the matrix.
              </p>
              <Link href="/manager/courses/create">
                <Button className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 text-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                  Initialize Deployment
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </ManagerLayout>
  );
}
