// components/quiz/quiz-overview.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Settings,
  Play,
  BarChart3,
  Users,
  Clock,
  Target,
  FileQuestion,
  Zap,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  Activity,
  Sparkles,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { format } from "date-fns";

interface QuizOverviewProps {
  quiz: any;
}

export function QuizOverview({ quiz }: QuizOverviewProps) {
  const router = useRouter();

  const totalPoints = quiz.questions.reduce(
    (sum: number, q: any) => sum + q.points,
    0
  );
  const averageScore =
    quiz.attempts.length > 0
      ? Math.round(
          quiz.attempts.reduce((sum: number, a: any) => sum + a.score, 0) /
            quiz.attempts.length
        )
      : 0;
  const passRate =
    quiz.attempts.length > 0
      ? Math.round(
          (quiz.attempts.filter((a: any) => a.passed).length /
            quiz.attempts.length) *
            100
        )
      : 0;

  const difficultyStats = quiz.questions.reduce(
    (acc: Record<string, number>, q: any) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    },
    {}
  );

  const getDifficultyStyle = (d: string) => {
    if (d === "EASY") return "bg-[var(--tw-color-emerald-50)] dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30";
    if (d === "MEDIUM") return "bg-[var(--tw-color-amber-50)] dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30";
    return "bg-[var(--tw-color-rose-50)] dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30";
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">

      {/* Hero Command Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 lg:p-12 shadow-2xl group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Sparkles className="h-64 w-64 text-blue-400" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge className={`font-black text-[10px] uppercase tracking-wider px-2 py-0.5 border-none ${quiz.isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 animate-pulse" : "bg-slate-700 text-slate-300"}`}>
              {quiz.isActive ? "ACTIVE PROTOCOL" : "OFFLINE"}
            </Badge>
            {quiz.practiceMode && (
              <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/20 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
                PRACTICE MODE
              </Badge>
            )}
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase mb-3">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-slate-400 text-lg font-medium mb-8 max-w-3xl leading-relaxed">
              {quiz.description}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {quiz.questions.length > 0 && (
              <>
                <Button
                  onClick={() => router.push(`/admin/quizzes/${quiz.id}/questions`)}
                  variant="ghost"
                  className="h-11 px-6 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs rounded-xl bg-white/5 backdrop-blur-sm"
                >
                  <Eye className="h-4 w-4 mr-2" /> All Questions
                </Button>
                <Button
                  onClick={() => router.push(`/admin/quizzes/${quiz.id}/builder`)}
                  variant="ghost"
                  className="h-11 px-6 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs rounded-xl bg-white/5 backdrop-blur-sm"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Questions
                </Button>
              </>
            )}
            <Button
              onClick={() => router.push(`/admin/quizzes/${quiz.id}/edit`)}
              className="h-11 px-6 bg-white hover:bg-slate-100 text-slate-900 font-black uppercase tracking-widest text-xs rounded-xl shadow-lg"
            >
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
            <Button
              onClick={() => router.push(`/quiz/${quiz.id}`)}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-blue-500/25"
            >
              <Play className="h-4 w-4 mr-2 fill-current" /> Launch Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Question Matrix", value: quiz._count.questions, sub: `${totalPoints} total pts`, icon: FileQuestion, color: "blue" },
          { label: "Attempt Log", value: quiz._count.attempts, sub: "Total submissions", icon: Users, color: "indigo" },
          { label: "Mean Score", value: `${averageScore}%`, sub: "Across all attempts", icon: BarChart3, color: "emerald" },
          { label: "Pass Rate", value: `${passRate}%`, sub: `${quiz.passingScore}% required`, icon: Target, color: quiz.attempts.length > 0 && passRate >= quiz.passingScore ? "emerald" : "amber" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</CardTitle>
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

      {/* Config & Question Breakdown */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Quiz Config */}
        <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Protocol Config</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Quiz settings and requirements</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[var(--tw-color-indigo-50)] dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Time Limit", value: quiz.timeLimit ? `${quiz.timeLimit} MIN` : "UNLIMITED" },
                { label: "Passing Score", value: `${quiz.passingScore}%` },
                { label: "Max Attempts", value: quiz.maxAttempts ? `${quiz.maxAttempts}x` : "INFINITE" },
                { label: "Shuffle Q's", value: quiz.shuffleQuestions ? "ENABLED" : "OFF" },
                { label: "Shuffle Options", value: quiz.shuffleOptions ? "ENABLED" : "OFF" },
                { label: "Show Feedback", value: quiz.showFeedback ? "YES" : "NO" },
                { label: "Allow Review", value: quiz.allowReview ? "YES" : "NO" },
                { label: "Practice Mode", value: quiz.practiceMode ? "ACTIVE" : "OFF" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{item.label}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>

            {(quiz.adaptiveDifficulty || quiz.requireMastery) && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Advanced Protocols</span>
                <div className="flex flex-wrap gap-2">
                  {quiz.adaptiveDifficulty && (
                    <Badge className="bg-[var(--tw-color-blue-50)] dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
                      <Zap className="h-3 w-3 mr-1" /> Adaptive Difficulty
                    </Badge>
                  )}
                  {quiz.requireMastery && (
                    <Badge className="bg-[var(--tw-color-purple-50)] dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
                      <Target className="h-3 w-3 mr-1" /> Mastery Required
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Breakdown */}
        <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Question Matrix</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Difficulty and type distribution</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[var(--tw-color-blue-50)] dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Difficulty Spectrum</span>
              <div className="space-y-3">
                {Object.entries(difficultyStats).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex items-center justify-between">
                    <Badge className={`${getDifficultyStyle(difficulty)} font-black text-[10px] uppercase tracking-wider px-2 py-0.5`}>
                      {difficulty}
                    </Badge>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${((count as number) / quiz.questions.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-black text-slate-600 dark:text-slate-300 w-8 text-right tabular-nums">
                        {count as number}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Question Types</span>
              <div className="space-y-3">
                {Object.entries(
                  quiz.questions.reduce((acc: Record<string, number>, q: any) => {
                    const type = q.questionType.replace("_", " ").toLowerCase();
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{type}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attempts */}
      {quiz.attempts.length > 0 && (
        <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Attempt Log</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Recent quiz submissions telemetry</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/quizzes/${quiz.id}/attempts`)}
              className="h-10 px-5 font-black uppercase tracking-widest text-[10px] rounded-xl border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <Eye className="h-4 w-4 mr-2" /> View All
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              {quiz.attempts.map((attempt: any) => (
                <div
                  key={attempt.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-blue-500/30 hover:shadow-xl"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${attempt.passed ? "bg-[var(--tw-color-emerald-50)] dark:bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-[var(--tw-color-rose-50)] dark:bg-rose-500/10 text-rose-500 border border-rose-500/20"}`}>
                      {attempt.passed ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {attempt.user.firstName} {attempt.user.lastName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {attempt.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 mt-4 sm:mt-0 pl-0 sm:pl-4">
                    <div className="text-right">
                      <span className={`text-2xl font-black tabular-nums ${attempt.passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {attempt.score}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Time</span>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                        {attempt.timeSpent ? `${Math.round(attempt.timeSpent / 60)}m` : "N/A"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Date</span>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {format(new Date(attempt.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                    {attempt.isPractice && (
                      <Badge className="bg-[var(--tw-color-blue-50)] dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 font-black text-[8px] uppercase tracking-tighter px-1.5 py-0">
                        PRACTICE
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Question Registry</CardTitle>
            <CardDescription className="text-slate-500 font-medium">All questions in this assessment</CardDescription>
          </div>
          {quiz.questions.length > 0 && (
            <Button
              onClick={() => router.push(`/admin/quizzes/${quiz.id}/builder`)}
              className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-blue-500/20"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit Questions
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-8">
          {quiz.questions.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <FileQuestion className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-700 opacity-50" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Registry Offline</h3>
              <p className="text-slate-500 font-medium mb-8">No questions have been injected into this assessment protocol.</p>
              <Button
                onClick={() => router.push(`/admin/quizzes/${quiz.id}/builder`)}
                className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 uppercase tracking-widest"
              >
                Initialize Question Matrix
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {quiz.questions.map((question: any, index: number) => (
                <div
                  key={question.id}
                  className="group relative p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-blue-500/30 hover:shadow-xl"
                >
                  <div className="flex items-start gap-5">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={`${getDifficultyStyle(question.difficulty)} font-black text-[8px] uppercase tracking-tighter px-1.5 py-0 border`}>
                          {question.difficulty}
                        </Badge>
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none font-black text-[8px] uppercase tracking-tighter px-1.5 py-0">
                          {question.questionType.replace("_", " ")}
                        </Badge>
                        <Badge className="bg-[var(--tw-color-blue-50)] dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none font-black text-[8px] uppercase tracking-tighter px-1.5 py-0">
                          {question.points} PTS
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                        {question.questionText}
                      </p>
                      {question.options.length > 0 && (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 italic">
                          {question.options.length} options •{" "}
                          {question.options.filter((o: any) => o.isCorrect).length} correct
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 group-hover:text-blue-500 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
