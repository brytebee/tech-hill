// app/(dashboard)/student/achievements/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Zap, BookOpen, Target, Lock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements | Tech Hill",
  description: "View your learning milestones and earned certificates.",
};

export default async function StudentAchievementsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [completedEnrollments, certificates, quizAttempts, totalTopics] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      include: { course: { select: { id: true, title: true, difficulty: true } } },
    }),
    prisma.certificate.findMany({
      where: { userId: session.user.id },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.quizAttempt.count({
      where: { userId: session.user.id, passed: true },
    }),
    prisma.topicProgress.count({
      where: { userId: session.user.id, status: "COMPLETED" },
    }),
  ]);

  // Define milestone achievements
  const achievements = [
    {
      id: "first_course",
      title: "First Step",
      description: "Complete your first course",
      icon: BookOpen,
      color: "blue",
      earned: completedEnrollments.length >= 1,
      progress: Math.min(completedEnrollments.length, 1),
      max: 1,
    },
    {
      id: "five_courses",
      title: "Knowledge Seeker",
      description: "Complete 5 courses",
      icon: Star,
      color: "amber",
      earned: completedEnrollments.length >= 5,
      progress: Math.min(completedEnrollments.length, 5),
      max: 5,
    },
    {
      id: "ten_topics",
      title: "Topic Master",
      description: "Complete 10 topics",
      icon: Target,
      color: "indigo",
      earned: totalTopics >= 10,
      progress: Math.min(totalTopics, 10),
      max: 10,
    },
    {
      id: "quiz_ace",
      title: "Quiz Ace",
      description: "Pass 5 quizzes",
      icon: Zap,
      color: "orange",
      earned: quizAttempts >= 5,
      progress: Math.min(quizAttempts, 5),
      max: 5,
    },
    {
      id: "certified",
      title: "Certified",
      description: "Earn your first certificate",
      icon: Award,
      color: "emerald",
      earned: certificates.length >= 1,
      progress: Math.min(certificates.length, 1),
      max: 1,
    },
    {
      id: "overachiever",
      title: "Overachiever",
      description: "Complete 3 courses",
      icon: Trophy,
      color: "rose",
      earned: completedEnrollments.length >= 3,
      progress: Math.min(completedEnrollments.length, 3),
      max: 3,
    },
  ];

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <StudentLayout title="Achievements" description="Your learning milestones and earned recognition.">
      <div className="space-y-10">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 opacity-10 p-8">
            <Trophy className="h-48 w-48" />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">Achievement Board</p>
            <h2 className="text-4xl font-black mb-2">{earnedCount} <span className="text-blue-300">/ {achievements.length}</span></h2>
            <p className="text-blue-100 font-medium">milestones earned</p>
          </div>
        </div>

        {/* Achievements Grid */}
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-5">Milestones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              const pct = Math.round((achievement.progress / achievement.max) * 100);
              return (
                <Card key={achievement.id} className={`border-slate-200 dark:border-slate-800 transition-all ${achievement.earned ? "shadow-lg" : "opacity-60 grayscale-[0.4]"}`}>
                  <CardContent className="pt-6 pb-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-${achievement.color}-50 dark:bg-${achievement.color}-900/20 border border-${achievement.color}-200 dark:border-${achievement.color}-800/50`}>
                        <Icon className={`h-6 w-6 text-${achievement.color}-600 dark:text-${achievement.color}-400`} />
                      </div>
                      {achievement.earned ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px] font-black">EARNED</Badge>
                      ) : (
                        <Lock className="h-4 w-4 text-slate-300 dark:text-slate-700" />
                      )}
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white mb-1">{achievement.title}</h3>
                    <p className="text-xs font-medium text-slate-500 mb-4">{achievement.description}</p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`bg-${achievement.color}-500 h-1.5 rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">{achievement.progress} / {achievement.max}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Certificates */}
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-5">Certificates</h2>
          {certificates.length === 0 ? (
            <Card className="border-dashed border-slate-200 dark:border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                <Award className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                <p className="font-bold text-slate-900 dark:text-white">No certificates yet</p>
                <p className="text-sm text-slate-500 mt-2 max-w-xs">Complete a course and request your certificate to see it here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {certificates.map((cert: any) => (
                <Card key={cert.id} className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900 dark:to-amber-900/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 shrink-0">
                        <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white mb-1">{cert.course?.title}</h3>
                        <p className="text-xs text-slate-500 mb-1">Certificate ID: <span className="font-mono">{cert.id.slice(-8).toUpperCase()}</span></p>
                        <p className="text-xs text-slate-400">Issued {new Date(cert.issuedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Courses */}
        {completedEnrollments.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-5">Completed Courses</h2>
            <div className="space-y-3">
              {completedEnrollments.map((enrollment) => (
                <Link key={enrollment.id} href={`/student/courses/${enrollment.course.id}`}>
                  <Card className="border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="py-4 px-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50">
                          <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">{enrollment.course.title}</p>
                          <p className="text-xs text-slate-400">{enrollment.course.difficulty}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px] font-black shrink-0">100%</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
