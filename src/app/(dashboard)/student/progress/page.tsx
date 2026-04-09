// app/(dashboard)/student/progress/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Clock, TrendingUp, Target, Award } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Progress | Tech Hill",
  description: "Track your learning progress across all enrolled courses.",
};

export default async function StudentProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const enrollments = await prisma.enrollment.findMany({
    where: { 
      userId: session.user.id,
      status: { in: ["ACTIVE", "COMPLETED"] }
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          difficulty: true,
          duration: true,
          thumbnail: true,
          modules: {
            include: {
              topics: { select: { id: true, isRequired: true } },
            },
          },
        },
      },
    },
    orderBy: { lastAccessAt: "desc" },
  });

  const topicProgresses = await prisma.topicProgress.findMany({
    where: { userId: session.user.id, status: "COMPLETED" },
    select: { topicId: true },
  });
  const completedTopicSet = new Set(topicProgresses.map((p) => p.topicId));

  const stats = {
    total: enrollments.length,
    completed: enrollments.filter((e) => e.status === "COMPLETED").length,
    inProgress: enrollments.filter((e) => e.status === "ACTIVE").length,
    totalTopicsCompleted: completedTopicSet.size,
  };

  return (
    <StudentLayout title="My Progress" description="Track your learning momentum across all enrolled courses.">
      <div className="space-y-8">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Courses Enrolled", value: stats.total, icon: BookOpen, color: "blue" },
            { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "indigo" },
            { label: "Completed", value: stats.completed, icon: CheckCircle, color: "emerald" },
            { label: "Topics Mastered", value: stats.totalTopicsCompleted, icon: Target, color: "amber" },
          ].map((stat) => (
            <Card key={stat.label} className="border-slate-200 dark:border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Course Progress List */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Course Progress</h2>
          {enrollments.length === 0 ? (
            <Card className="border-dashed border-slate-200 dark:border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-lg font-bold text-slate-900 dark:text-white">No courses yet</p>
                <p className="text-sm text-slate-500 mt-2">Enroll in a course to start tracking your progress.</p>
                <Link href="/student/courses" className="mt-6">
                  <button className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-500 transition-all">
                    Browse Courses
                  </button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            enrollments.map((enrollment) => {
              const allTopicIds = enrollment.course.modules.flatMap((m) =>
                m.topics.map((t) => t.id)
              );
              const completedCount = allTopicIds.filter((id) => completedTopicSet.has(id)).length;
              const liveProgress = allTopicIds.length > 0
                ? Math.round((completedCount / allTopicIds.length) * 100)
                : enrollment.overallProgress;

              return (
                <Link key={enrollment.id} href={`/student/courses/${enrollment.course.id}`}>
                  <Card className="border-slate-200 dark:border-slate-800 hover:border-blue-500/40 hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="py-5 px-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                              {enrollment.course.title}
                            </h3>
                            {enrollment.status === "COMPLETED" && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px] font-black shrink-0">
                                COMPLETED
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{enrollment.course.duration}h</span>
                            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />{completedCount}/{allTopicIds.length} topics</span>
                          </div>
                          <Progress value={liveProgress} className="h-2" />
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{liveProgress}<span className="text-sm text-slate-400">%</span></span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
