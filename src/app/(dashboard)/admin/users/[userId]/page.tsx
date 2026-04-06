// app/(dashboard)/admin/users/[userId]/page.tsx
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
  BookOpen,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Clock,
  GraduationCap,
  FileText,
  Trophy,
  Shield,
  Activity,
  Zap,
  Fingerprint,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  Plus,
  Crown,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { UserService } from "@/lib/services/userService";
import { SubscriptionControls } from "@/components/admin/SubscriptionControls";

async function getUserDetails(userId: string) {
  try {
    const user = await UserService.getUserById(userId);
    return user;
  } catch (error: any) {
    console.error("Fetching user error", error);
    return null;
  }
}

interface UserDetailsPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { userId } = await params;
  const user = await getUserDetails(userId);

  if (!user) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            ACTIVE
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            INACTIVE
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            SUSPENDED
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            ADMINISTRATOR
          </Badge>
        );
      case "MANAGER":
        return (
          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            MANAGER
          </Badge>
        );
      case "STUDENT":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
            STUDENT
          </Badge>
        );
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <AdminLayout
      title="Identity Profile"
      description="Comprehensive telemetry and permission matrix for registered identities"
    >
      <div className="space-y-10 animate-fade-in pb-20">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <ArrowLeft className="h-3 w-3 mr-2" /> Back to Matrix
              </Button>
            </Link>
            <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shadow-inner">
                    <UserIcon className="h-10 w-10" />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                        {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                        UID: <span className="text-slate-900 dark:text-white font-black opacity-60 tabular-nums uppercase">{user.id}</span>
                    </p>
                </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/admin/users/${user.id}/edit`}>
              <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-black h-11 px-6 rounded-xl transition-all shadow-lg uppercase tracking-widest text-xs">
                <Edit className="h-4 w-4 mr-2" /> Modify Profile
              </Button>
            </Link>
            <Button variant="ghost" className="h-11 px-6 rounded-xl font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 uppercase tracking-widest text-xs">
              <Trash2 className="h-4 w-4 mr-2" /> Purge
            </Button>
          </div>
        </div>

        {/* Identity Telemetry Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Matrix Linkage", value: user._count?.enrollments || 0, icon: BookOpen, color: "blue", sub: "Active enrollments" },
            { label: "Mastery Proofs", value: user._count?.certificates || 0, icon: Award, color: "emerald", sub: "Earned certificates" },
            { label: "Sync Efficiency", value: user._count?.quizAttempts || 0, icon: Zap, color: "indigo", sub: "Total quiz attempts" },
            { label: "Action Log", value: user._count?.submissions || 0, icon: Activity, color: "rose", sub: "Portfolio submissions" }
          ].map((stat, i) => (
            <Card key={i} className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </CardTitle>
                <div className={`p-1.5 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-500`}>
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

        {/* Access Control — Subscription Override */}
        <SubscriptionControls
          userId={user.id}
          userName={`${user.firstName} ${user.lastName}`}
          activeSubscription={
            user.subscriptions && user.subscriptions.length > 0
              ? {
                  id: user.subscriptions[0].id,
                  plan: user.subscriptions[0].plan,
                  status: user.subscriptions[0].status,
                  startDate: user.subscriptions[0].startDate?.toISOString?.() ?? null,
                  endDate: user.subscriptions[0].endDate?.toISOString?.() ?? null,
                  provider: user.subscriptions[0].provider,
                }
              : null
          }
        />

        {/* Identity Core & Data Matrix */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Identity Manifest */}
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden group">
            <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity Manifest</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Core biometric and contact telemetry</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Fingerprint className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Mail className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none block mb-1">Neural Address</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Phone className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none block mb-1">Comms Link</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{user.phoneNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none block mb-1">Temporal Node</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                            {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}
                        </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none block mb-1">Physical Sector</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{user.address || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Functional Authorization</span>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex flex-wrap gap-4">
                   <div className="flex-1 min-w-[120px]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block mb-2">Platform Rank</span>
                        {getRoleBadge(user.role)}
                   </div>
                   <div className="flex-1 min-w-[120px]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block mb-2">Protocol Status</span>
                        {getStatusBadge(user.status)}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account System Diagnostics */}
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Diagnostics</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Record of activity and lifecycle nodes</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-indigo-500" />
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Link Initialized</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                            {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-emerald-500" />
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Protocol Variance</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                            {new Date(user.updatedAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-blue-500" />
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Last Auth Log</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "NEVER"}
                        </span>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Security Protocol Override</span>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800">Reset Link</Button>
                        <Button variant="outline" className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800">Lock Matrix</Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Matrix Enrollments (Courses) */}
        {user.enrollments && user.enrollments.length > 0 && (
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Matrix Linkages</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Active educational sequence synchronizations</CardDescription>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                        <BookOpen className="h-6 w-6" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {user.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-blue-500/30 hover:shadow-xl"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {enrollment.course.title}
                        </h4>
                        {enrollment.completedAt && (
                          <Badge className="bg-emerald-500 text-white font-black text-[8px] uppercase tracking-tighter px-1.5 py-0 border-none">COMPLETE</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-500 line-clamp-1 mb-2">
                        {enrollment.course.shortDescription}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 italic">
                           <Calendar className="h-3 w-3" /> INITIALIZED: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-[8px] font-black border-slate-200 dark:border-slate-700">
                          {enrollment.course.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-6 sm:gap-2 mt-4 sm:mt-0 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums leading-none">
                        {enrollment.overallProgress}<span className="text-sm opacity-60">%</span>
                      </div>
                      <div className="flex-1 sm:flex-none">
                          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: `${enrollment.overallProgress}%` }} />
                          </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Architect Nodes (Created Courses) */}
        {user.createdCourses && user.createdCourses.length > 0 && (
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Architect Registry</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Curriculum sequences initialized by this identity</CardDescription>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                        <Plus className="h-6 w-6" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {user.createdCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-500/30 hover:shadow-xl"
                  >
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{course.title}</h4>
                      <p className="text-sm font-medium text-slate-500 line-clamp-1 mb-2">
                        {course.shortDescription}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 italic">
                           <Calendar className="h-3 w-3" /> DEPLOYED: {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5 italic text-indigo-500">
                            {course._count.enrollments} LINKED PEERS
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-6 sm:gap-2 mt-4 sm:mt-0 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
                        <Badge
                            className={`font-black text-[10px] uppercase tracking-widest px-2 py-0.5 border-none shadow-lg ${
                            course.status === "PUBLISHED"
                                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                : course.status === "DRAFT"
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                : "bg-rose-500 text-white shadow-rose-500/20"
                            }`}
                        >
                            {course.status}
                        </Badge>
                      <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                        {Number(course.price) > 0
                          ? `₦${Number(course.price).toLocaleString()}`
                          : "FREE"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Global Mastery Records (Certificates) */}
        {user.certificates && user.certificates.length > 0 && (
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Mastery Proofs</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Validated certificates of educational accomplishment</CardDescription>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Award className="h-6 w-6" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                {user.certificates.slice(0, 6).map((certificate) => (
                  <div
                    key={certificate.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-amber-500/30 hover:shadow-xl"
                  >
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">
                        {certificate.title}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        CID: {certificate.certificateNumber.slice(0, 12)}...
                      </p>
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mt-1 italic">
                        ISSUED {new Date(certificate.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {user.certificates.length > 6 && (
                <div className="mt-8 text-center">
                    <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        View all {user.certificates.length} proofs <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty Intelligence State */}
        {(!user.enrollments || user.enrollments.length === 0) &&
          (!user.createdCourses || user.createdCourses.length === 0) &&
          (!user.certificates || user.certificates.length === 0) && (
            <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <CardContent className="text-center py-20">
                <GraduationCap className="h-20 w-20 mx-auto mb-6 text-slate-300 dark:text-slate-700 opacity-50" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                  Zero Baseline Detected
                </h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                  This identity has not yet synchronized with any matrix sequences or established architect nodes.
                </p>
                <Link href="/admin/users">
                   <Button variant="outline" className="h-10 px-8 rounded-xl font-black uppercase tracking-widest text-xs border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800">Sync Global Matrix</Button>
                </Link>
              </CardContent>
            </Card>
          )}
      </div>
    </AdminLayout>
  );
}
