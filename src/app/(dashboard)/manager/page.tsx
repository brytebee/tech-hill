// app/(dashboard)/manager/page.tsx
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Plus,
  BarChart3,
  Sparkles,
  Zap,
  Activity,
  ChevronRight,
  BookPlus,
  FileSearch,
} from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getDashboardStats() {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/dashboard/stats`, {
      cache: "no-store",
      headers: {
        cookie: headersList.get("cookie") || "",
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error: any) {
    return null;
  }
}

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getDashboardStats();

  if (!session?.user?.id) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#060a12]">
            <p className="text-slate-500 font-bold uppercase tracking-widest">Unauthorized Access</p>
        </div>
    );
  }

  return (
    <ManagerLayout
      title="Management Console"
      description="Orchestrate curriculum development and student success metrics"
    >
      <div className="space-y-8 animate-fade-in">
        
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 dark:bg-none dark:bg-slate-900 border-0 dark:border dark:border-slate-800 p-8 lg:p-12 shadow-2xl shadow-blue-500/20 dark:shadow-none group transition-all duration-500 hover:shadow-blue-500/30 dark:hover:shadow-blue-500/10">
          <div className="absolute top-0 right-0 p-8 lg:p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
            <Zap className="h-40 w-40 lg:h-64 lg:w-64 text-white rotate-12" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" /> System Operational
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-4 uppercase">
              Greetings, <span className="text-blue-100 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-indigo-400">{session.user.firstName}</span>.
            </h2>
            <p className="text-blue-100 dark:text-slate-400 text-lg lg:text-xl font-medium mb-8 leading-relaxed">
              Your educational matrix is performing at optimal parameters. We've synchronized your latest curriculum updates.
            </p>
            <div className="flex flex-wrap gap-4">
                <Link href="/manager/courses/create">
                    <Button className="bg-white hover:bg-blue-50 text-blue-700 dark:text-slate-900 font-black h-12 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10 dark:shadow-none uppercase tracking-widest border-0">
                        <Plus className="h-5 w-5 mr-2" /> Create New Sequence
                    </Button>
                </Link>
                <Link href="/manager/reports text-white">
                    <Button variant="ghost" className="text-white hover:bg-white/20 font-black h-12 px-6 rounded-xl transition-all uppercase tracking-widest">
                        Analysis Reports <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Active Catalog", value: stats?.courses?.total || 0, icon: BookOpen, lightIcon: "bg-blue-50 text-blue-600", darkIcon: "dark:bg-blue-500/10 dark:text-blue-400", sub: `${stats?.courses?.published || 0} live assets` },
            { label: "Community", value: stats?.enrollments?.total || 0, icon: Users, lightIcon: "bg-indigo-50 text-indigo-600", darkIcon: "dark:bg-indigo-500/10 dark:text-indigo-400", sub: "Enrollment density" },
            { label: "Efficiency", value: "98.4%", icon: Activity, lightIcon: "bg-emerald-50 text-emerald-600", darkIcon: "dark:bg-emerald-500/10 dark:text-emerald-400", sub: "System response time" },
            { label: "Retention", value: "84%", icon: Award, lightIcon: "bg-amber-50 text-amber-600", darkIcon: "dark:bg-amber-500/10 dark:text-amber-400", sub: "Core completion rate" }
          ].map((stat, i) => (
            <Card key={i} className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all duration-300 hover:shadow-md dark:hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </CardTitle>
                <div className={`p-1.5 rounded-lg ${stat.lightIcon} ${stat.darkIcon}`}>
                    <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                <p className="text-xs font-medium text-slate-500 mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Center & Portfolios */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Command Center</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Primary administrative utilities</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <Link href="/manager/courses/create" className="group">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 transition-all hover:bg-blue-50/50 dark:hover:bg-slate-800/50 hover:border-blue-200 dark:hover:border-slate-700 hover:shadow-sm cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BookPlus className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">New Sequence</h4>
                    <p className="text-xs text-slate-500 font-medium">Design and deploy curriculum</p>
                </div>
              </Link>
              <Link href="/manager/courses" className="group">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 transition-all hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 hover:border-indigo-200 dark:hover:border-slate-700 hover:shadow-sm cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileSearch className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">Manifests</h4>
                    <p className="text-xs text-slate-500 font-medium">Audit and revise existing assets</p>
                </div>
              </Link>
              <Link href="/manager/students" className="group">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 transition-all hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 hover:border-emerald-200 dark:hover:border-slate-700 hover:shadow-sm cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Population</h4>
                    <p className="text-xs text-slate-500 font-medium">Monitor student demographics</p>
                </div>
              </Link>
              <Link href="/manager/reports" className="group">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 transition-all hover:bg-amber-50/50 dark:hover:bg-slate-800/50 hover:border-amber-200 dark:hover:border-slate-700 hover:shadow-sm cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">Intelligence</h4>
                    <p className="text-xs text-slate-500 font-medium">Core performance analytics</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Health Parameters</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Real-time engagement telemetry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-tight">Active Learning</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-500 font-medium">Optimal engagement density</p>
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">89%</div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-900/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-300 uppercase tracking-tight">Catalog Velocity</p>
                    <p className="text-xs text-blue-700 dark:text-blue-500 font-medium">Asset interaction rate</p>
                  </div>
                </div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {stats?.courses?.total || 0}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50 dark:bg-indigo-900/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">Population Growth</p>
                    <p className="text-xs text-indigo-700 dark:text-indigo-500 font-medium">New enrollments this cycle</p>
                  </div>
                </div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  +{stats?.enrollments?.total > 0 ? "12%" : "0%"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State / Tips */}
        {(!stats?.courses?.total || stats.courses.total === 0) ? (
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 text-center py-16">
            <CardContent>
              <div className="mx-auto w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6 border border-slate-200 dark:border-slate-700">
                <BookOpen className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Catalog Initialization Required</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8 text-lg leading-relaxed">
                Start your journey by deploying your first curriculum sequence. Tap into the population matrix.
              </p>
              <Link href="/manager/courses/create">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black h-14 px-10 rounded-2xl text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                  Deploy Assets
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Dynamic Modules", desc: "Keep sequences updated to maximize engagement velocity.", icon: Zap, color: "blue" },
              { title: "Metric Audits", desc: "Monitor telemetry to identify learning bottlenecks.", icon: TrendingUp, color: "indigo" },
              { title: "Strategic Insights", desc: "Utilize reports to scale your intellectual capital.", icon: Sparkles, color: "purple" }
            ].map((tip, i) => (
                <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none">
                    <div className={`h-12 w-12 rounded-2xl bg-${tip.color}-500/10 flex items-center justify-center text-${tip.color}-500 mb-6`}>
                        <tip.icon className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{tip.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{tip.desc}</p>
                </div>
            ))}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
