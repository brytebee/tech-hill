// app/(dashboard)/student/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
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
  Clock,
  Award,
  TrendingUp,
  Play,
  Sparkles,
  Zap,
  Activity,
  ChevronRight,
  BookPlus,
  Star,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { EnrollmentService } from "@/lib/services/enrollmentService";
import { CourseService } from "@/lib/services/courseService";
import { EnrollButton } from "@/components/students/EnrollButton";
import { PaymentSuccessToast } from "@/components/checkout/PaymentSuccessToast";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { GamificationWidget } from "@/components/students/GamificationWidget";
import { IdentityBadgeShowcase } from "@/components/students/IdentityBadgeShowcase";

async function getStudentData(userId: string) {
  try {
    const [enrollments, availableCourses, user] = await Promise.all([
      EnrollmentService.getUserEnrollments(userId),
      CourseService.getCourses({ status: "PUBLISHED" }, 1, 10),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          xp: true,
          streakDays: true,
          badges: {
            include: { badge: true },
            orderBy: { earnedAt: "desc" }
          }
        }
      })
    ]);

    return {
      enrollments,
      availableCourses: availableCourses.courses,
      userData: user || { xp: 0, streakDays: 0, badges: [] }
    };
  } catch (error: any) {
    console.error("Error fetching student data:", error);
    return {
      enrollments: [],
      availableCourses: [],
      userData: { xp: 0, streakDays: 0, badges: [] }
    };
  }
}

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { enrollments, availableCourses, userData } = await getStudentData(
    session.user.id,
  );

  const totalTimeSpent = enrollments.reduce(
    (total: any, enrollment: any) => total + (enrollment.totalTimeSpent || 0),
    0,
  );

  const completedCourses = enrollments.filter(
    (e: any) => e.status === "COMPLETED",
  ).length;

  const overallProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum: any, e: any) => sum + e.overallProgress, 0) /
            enrollments.length,
        )
      : 0;

  return (
    <StudentLayout>
      <Suspense fallback={null}>
        <PaymentSuccessToast />
      </Suspense>
      <div className="space-y-10 animate-fade-in">

        {/*
         * ─── HERO BANNER ─────────────────────────────────────────────
         * LIGHT: rich blue-to-indigo gradient so it looks premium + vibrant
         * DARK:  deep slate-900 with subtle blue icon decoration
         * ──────────────────────────────────────────────────────────────
         */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 dark:bg-none dark:bg-slate-900 border-0 dark:border dark:border-slate-800 p-8 lg:p-12 shadow-2xl shadow-blue-500/20 dark:shadow-none group transition-all duration-500">
          {/* Decorative icon — visible on both modes */}
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
            <Zap className="h-48 w-48 text-white rotate-12" />
          </div>
          <div className="relative z-10 max-w-3xl">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" /> Ready to Learn
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-4 uppercase">
              Welcome Back,{" "}
              <span className="text-blue-100 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-indigo-400">
                {session.user.firstName}
              </span>
              .
            </h2>
            <p className="text-blue-100 dark:text-slate-400 text-lg lg:text-xl font-medium mb-8 leading-relaxed">
              We've synced your progress. You are currently enrolled in{" "}
              {enrollments.length} course(s).
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/student/courses">
                <Button className="bg-white hover:bg-blue-50 text-blue-700 dark:text-slate-900 font-black h-12 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg uppercase tracking-widest border-0">
                  <BookPlus className="h-5 w-5 mr-2" /> Expand Catalog
                </Button>
              </Link>
              <Link href="/student/achievements">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 font-black h-12 px-6 rounded-xl transition-all uppercase tracking-widest"
                >
                  Mastery Records <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* NEW: Gamification Top Widget */}
        <GamificationWidget xp={userData.xp} streakDays={userData.streakDays} />

        {/*
         * ─── STAT CARDS ───────────────────────────────────────────────
         * LIGHT: solid white bg, slate-200 border, slate-900 value text
         * DARK:  slate-900/50 glass, slate-800 border, white value text
         * ──────────────────────────────────────────────────────────────
         */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Active Nodes", value: enrollments.length, icon: BookOpen, lightIcon: "bg-blue-50 text-blue-600", darkIcon: "dark:bg-blue-500/10 dark:text-blue-400", sub: "Courses in sync" },
            { label: "Focus Time", value: `${Math.round(totalTimeSpent / 60)}h`, icon: Clock, lightIcon: "bg-emerald-50 text-emerald-600", darkIcon: "dark:bg-emerald-500/10 dark:text-emerald-400", sub: "Cumulative duration" },
            { label: "Mastery Cycles", value: completedCourses, icon: Award, lightIcon: "bg-amber-50 text-amber-600", darkIcon: "dark:bg-amber-500/10 dark:text-amber-400", sub: "Completed sequences" },
            { label: "Core Sync", value: `${overallProgress}%`, icon: Activity, lightIcon: "bg-indigo-50 text-indigo-600", darkIcon: "dark:bg-indigo-500/10 dark:text-indigo-400", sub: "Global completion rate" },
          ].map((stat, i) => (
            <Card
              key={i}
              className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all duration-300 hover:shadow-md dark:hover:shadow-lg hover:-translate-y-0.5"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </CardTitle>
                <div className={`p-1.5 rounded-lg ${stat.lightIcon} ${stat.darkIcon}`}>
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

        {/*
         * ─── CONTENT CARDS ────────────────────────────────────────────
         * LIGHT: solid white bg, slate-200 border — NOT glass (avoids haze)
         * DARK:  slate-900/50 glass with slate-800 border
         * Inner rows: slate-50 light, slate-800/30 dark
         * ──────────────────────────────────────────────────────────────
         */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Active Progress Matrix */}
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all duration-300 rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-2 p-6 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Active Sequences
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium">
                    Continue your cognitive expansion
                  </CardDescription>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {enrollments.length > 0 ? (
                <div className="space-y-4">
                  {enrollments.slice(0, 3).map((enrollment: any) => (
                    <div
                      key={enrollment.id}
                      className="group p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/30 transition-all hover:bg-blue-50/50 dark:hover:bg-slate-800/50 hover:border-blue-200 dark:hover:border-slate-700 hover:shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 flex-1 mr-3">
                          {/* Course Thumbnail */}
                          <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                            {enrollment.course.thumbnail ? (
                              <img src={enrollment.course.thumbnail} alt={enrollment.course.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-white/50" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-tight text-sm">
                              {enrollment.course.title}
                            </h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                              {enrollment.overallProgress}% MASTERY ACQUIRED
                            </span>
                          </div>
                        </div>
                        <Link href={`/student/courses/${enrollment.course.id}`}>
                          <Button
                            size="icon"
                            className="h-9 w-9 bg-slate-900 hover:bg-blue-700 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl shadow-md transition-transform hover:scale-105 shrink-0"
                          >
                            <Play className="h-4 w-4 fill-current" />
                          </Button>
                        </Link>
                      </div>
                      {/* Progress bar — works on both modes */}
                      <div className="w-full bg-slate-200 dark:bg-slate-950/60 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.35)]"
                          style={{ width: `${enrollment.overallProgress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {enrollments.length > 3 && (
                    <Link href="/student/courses" className="block pt-2">
                      <Button
                        variant="outline"
                        className="w-full h-11 font-black border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-slate-700 uppercase tracking-widest text-[10px] text-slate-600 dark:text-slate-300"
                      >
                        Audit All Sequences{" "}
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4 shadow-inner">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">
                    Registry Inactive
                  </h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto mb-6">
                    No curriculum nodes synchronized with your profile.
                  </p>
                  <Link href="/student/courses">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-6 h-10 shadow-lg shadow-blue-500/25 uppercase text-xs tracking-widest">
                      Discover Catalog
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Asset Catalog */}
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all duration-300 rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-2 p-6 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Asset Catalog
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium">
                    Available educational nodes
                  </CardDescription>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Star className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {availableCourses.slice(0, 3).map((course: any) => {
                  const isEnrolled = enrollments.some(
                    (e: any) => e.courseId === course.id,
                  );
                  return (
                    <div
                      key={course.id}
                      className="group p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/30 transition-all hover:bg-blue-50/50 dark:hover:bg-slate-800/50 hover:border-blue-200 dark:hover:border-slate-700 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {/* Course Thumbnail */}
                        <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-white/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="font-black text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-tight line-clamp-1 text-sm">
                              {course.title}
                            </h4>
                            <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-500/20 italic shrink-0">
                              ₦{Number(course.price).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                            {course.shortDescription || course.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />{" "}
                          {course.duration}H DURATION
                        </span>
                        <EnrollButton
                          courseId={course.id}
                          courseTitle={course.title}
                          price={Number(course.price)}
                          isEnrolled={isEnrolled}
                          className={`h-9 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                            isEnrolled
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-none"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                          }`}
                        >
                          {isEnrolled ? "SYNCHRONIZED" : "INITIALIZE"}
                        </EnrollButton>
                      </div>
                    </div>
                  );
                })}
                <Link href="/student/courses" className="block pt-2">
                  <Button
                    variant="outline"
                    className="w-full h-11 font-black border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-slate-700 uppercase tracking-widest text-[10px] text-slate-600 dark:text-slate-300"
                  >
                    View Entire Registry <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Identity Badges */}
          <div className="lg:col-span-2">
            <IdentityBadgeShowcase userBadges={userData.badges as any} />
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
