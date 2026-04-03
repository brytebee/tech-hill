// app/(dashboard)/admin/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  Plus,
  Eye,
  Activity,
  Database,
  AlertCircle,
  Shield,
  Zap,
  Sparkles,
  BarChart3,
  Lock,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats as getStatsService } from "@/lib/services/dashboard.service";

export default async function AdminDashboard() {
  const stats = await getStatsService();

  return (
    <AdminLayout
      title="Security Mission Control"
      description="Operational oversight and system integrity management for Tech Hill"
    >
      <div className="space-y-10 animate-fade-in">
        
        {/* Security / System Integrity Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 dark:bg-none dark:bg-slate-900 border-0 dark:border dark:border-slate-800 p-8 lg:p-12 shadow-2xl shadow-blue-500/20 dark:shadow-none group transition-all duration-500 hover:shadow-blue-500/30 dark:hover:shadow-blue-500/10">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
            <Shield className="h-64 w-64 text-white rotate-12" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-sm">
                <Fingerprint className="h-3.5 w-3.5" /> Biometric Link Established
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-4 uppercase">
              System <span className="text-blue-100 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-indigo-400">Integrity</span> High.
            </h2>
            <p className="text-blue-100 dark:text-slate-400 text-lg lg:text-xl font-medium mb-8 leading-relaxed">
                Platform telemetry is nominal. All administrative protocols are authorized and active. Oversee the educational matrix with precision.
            </p>
            <div className="flex flex-wrap gap-4">
                <Link href="/admin/users">
                    <Button className="bg-white hover:bg-blue-50 text-blue-700 dark:text-slate-900 font-black h-12 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10 dark:shadow-none uppercase tracking-widest border-0">
                        <Users className="h-5 w-5 mr-1" /> Manage Identities
                    </Button>
                </Link>
                <Link href="/admin/intelligence">
                    <Button variant="ghost" className="text-white hover:bg-white/20 font-black h-12 px-6 rounded-xl transition-all uppercase tracking-widest">
                        Eagle-Eye Drafts <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
          </div>
        </div>

        {/* Global Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Platform Pulse", value: stats?.users?.total || 0, icon: Users, lightIcon: "bg-blue-50 text-blue-600", darkIcon: "dark:bg-blue-500/10 dark:text-blue-400", sub: "Registered identities" },
            { label: "Sequence Registry", value: stats?.courses?.total || 0, icon: BookOpen, lightIcon: "bg-indigo-50 text-indigo-600", darkIcon: "dark:bg-indigo-500/10 dark:text-indigo-400", sub: "Deployed curriculum" },
            { label: "Sync Activity", value: stats?.enrollments?.total || 0, icon: TrendingUp, lightIcon: "bg-emerald-50 text-emerald-600", darkIcon: "dark:bg-emerald-500/10 dark:text-emerald-400", sub: "Total enrollments" },
            { label: "System Uptime", value: "99.9%", icon: Activity, lightIcon: "bg-amber-50 text-amber-600", darkIcon: "dark:bg-amber-500/10 dark:text-amber-400", sub: "Global availability" }
          ].map((stat, i) => (
            <Card key={i} className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all duration-300 hover:shadow-md dark:hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </CardTitle>
                <div className={`p-1.5 rounded-lg ${stat.lightIcon} ${stat.darkIcon}`}>
                    <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{stat.value}</div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Operational Modules & System Health */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Quick Directive Center */}
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all duration-300 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-4 pt-8 px-8">
              <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Directive Hub</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Standard administrative overrides</CardDescription>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500">
                    <Zap className="h-6 w-6" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-2 space-y-4">
              <Link href="/admin/users" className="block group">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 transition-all hover:bg-blue-50/50 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-colors">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white uppercase tracking-tight">Identity Matrix</p>
                            <p className="text-xs font-bold text-slate-400 group-hover:text-blue-100 uppercase tracking-widest italic">Modify user permissions</p>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-white transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link href="/admin/courses/create" className="block group">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 transition-all hover:bg-blue-50/50 group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-500 flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white uppercase tracking-tight">Deploy Sequence</p>
                            <p className="text-xs font-bold text-slate-400 group-hover:text-indigo-100 uppercase tracking-widest italic">Initialize new curriculum</p>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-white transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link href="/admin/intelligence" className="block group">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 transition-all hover:bg-blue-50/50 group-hover:bg-emerald-600 group-hover:border-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white uppercase tracking-tight">Intelligence Vault</p>
                            <p className="text-xs font-bold text-slate-400 group-hover:text-emerald-100 uppercase tracking-widest italic">Manage AI content drafts</p>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-white transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* System Vitality Monitor */}
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all duration-300 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Vitality Sync</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Real-time platform diagnostics</CardDescription>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                        <Activity className="h-6 w-6" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-2 space-y-4">
              {/* System Protocol Status */}
              <div className="flex items-center justify-between p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-900/10 relative overflow-hidden group hover:border-emerald-300 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield className="h-12 w-12" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 uppercase">Master Protocol</p>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest italic">All systems nominal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hidden sm:block">OPERATIONAL</span>
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                </div>
              </div>

              {/* Data Link */}
              <div className="flex items-center justify-between p-5 rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-900/10 relative overflow-hidden group hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-blue-900 dark:text-blue-300 uppercase">Neural Cache</p>
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest italic">Encrypted and synchronized</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-8 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                </div>
              </div>

              {/* Intelligence Stream */}
              <div className="flex items-center justify-between p-5 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-900/10 relative overflow-hidden group hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-amber-900 dark:text-amber-300 uppercase">Attention Stream</p>
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest italic">Zero protocol deviations</p>
                  </div>
                </div>
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest border border-amber-300/30 px-2 py-0.5 rounded-md">CLEAR</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
