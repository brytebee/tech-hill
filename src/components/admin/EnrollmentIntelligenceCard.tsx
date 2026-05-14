"use client";
// components/admin/EnrollmentIntelligenceCard.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResetProgressButton } from "@/components/shared/ResetProgressButton";
import { ResetTrackButton }    from "@/components/shared/ResetTrackButton";
import {
  BookOpen, Layers, CheckCircle, XCircle, Activity,
  RotateCcw,
} from "lucide-react";

type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED" | "SUSPENDED" | "ON_HOLD";

interface CourseEnrollment {
  id: string;
  status: EnrollmentStatus;
  overallProgress: number;
  enrolledAt: string | Date;
  completedAt: string | Date | null;
  lastAccessAt: string | Date | null;
  totalTimeSpent: number;
  finalGrade: number | null;
  course: {
    id: string;
    title: string;
    shortDescription: string | null;
    status: string;
    difficulty: string;
  };
  [key: string]: any;
}

interface TrackEnrollment {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: string | Date;
  completedAt: string | Date | null;
  completedCourses: string[];
  currentCourseId: string | null;
  track: {
    id: string;
    title: string;
    slug: string;
    _count: { courses: number };
  };
}

interface Props {
  enrollments: CourseEnrollment[];
  trackEnrollments: TrackEnrollment[];
}

function fmtMins(mins: number) {
  if (!mins) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

type Tab = "courses" | "tracks";

export function EnrollmentIntelligenceCard({ enrollments, trackEnrollments }: Props) {
  const [tab, setTab] = useState<Tab>("courses");

  const active    = enrollments.filter(e => e.status === "ACTIVE");
  const completed = enrollments.filter(e => e.status === "COMPLETED");
  const dropped   = enrollments.filter(e => e.status === "DROPPED");
  const onHold    = enrollments.filter(e => !["ACTIVE","COMPLETED","DROPPED"].includes(e.status));

  const trackActive    = trackEnrollments.filter(e => e.status === "ACTIVE");
  const trackCompleted = trackEnrollments.filter(e => e.status === "COMPLETED");
  const trackDropped   = trackEnrollments.filter(e => e.status === "DROPPED");

  const stats = [
    { label: "Active",    count: active.length,    color: "blue"    },
    { label: "Complete",  count: completed.length,  color: "emerald" },
    { label: "Dropped",   count: dropped.length,    color: "rose"    },
    { label: "Paths",     count: trackEnrollments.length, color: "indigo" },
  ];

  return (
    <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Enrollment Intelligence
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium mt-1">
              Full learning history — courses and career paths
            </CardDescription>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {stats.map(s => (
            <div key={s.label} className={`text-center px-3 py-1.5 rounded-xl bg-${s.color}-500/10`}>
              <div className={`text-xl font-black text-${s.color}-600 dark:text-${s.color}-400 leading-none`}>{s.count}</div>
              <div className={`text-[9px] font-black uppercase tracking-widest text-${s.color}-500 mt-0.5`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-fit">
          <button
            onClick={() => setTab("courses")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              tab === "courses"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Courses ({enrollments.length})
          </button>
          <button
            onClick={() => setTab("tracks")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              tab === "tracks"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Career Paths ({trackEnrollments.length})
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8">

        {/* ── COURSES TAB ── */}
        {tab === "courses" && (
          <>
            {enrollments.length === 0 && (
              <p className="text-center text-slate-400 font-bold text-sm py-8">No course enrollments yet.</p>
            )}

            {/* Active */}
            {active.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" /> In Progress ({active.length})
                </h4>
                <div className="space-y-3">
                  {active.map(e => (
                    <div key={e.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 hover:border-blue-500/30 hover:shadow-xl transition-all">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 truncate">{e.course.title}</h5>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex-wrap">
                          <span>Enrolled: {new Date(e.enrolledAt).toLocaleDateString()}</span>
                          {e.lastAccessAt && <span>Last seen: {new Date(e.lastAccessAt).toLocaleDateString()}</span>}
                          <span>Time: {fmtMins(e.totalTimeSpent)}</span>
                          <Badge variant="outline" className="text-[8px] font-black border-slate-200 dark:border-slate-700">{e.course.difficulty}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 mt-4 sm:mt-0 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums leading-none">
                          {e.overallProgress}<span className="text-sm opacity-60">%</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${e.overallProgress}%` }} />
                        </div>
                        <ResetProgressButton enrollmentId={e.id} courseTitle={e.course.title} variant="admin" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" /> Completed ({completed.length})
                </h4>
                <div className="space-y-3">
                  {completed.map(e => (
                    <div key={e.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 hover:shadow-xl transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{e.course.title}</h5>
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex-wrap">
                          <span>Completed: {e.completedAt ? new Date(e.completedAt).toLocaleDateString() : "—"}</span>
                          <span>Time: {fmtMins(e.totalTimeSpent)}</span>
                          {e.finalGrade && <span className="text-emerald-600 dark:text-emerald-400">Score: {e.finalGrade}%</span>}
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 mt-4 sm:mt-0">
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">100<span className="text-sm opacity-60">%</span></div>
                        <div className="w-24 h-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-emerald-500 rounded-full" />
                        </div>
                        <ResetProgressButton enrollmentId={e.id} courseTitle={e.course.title} variant="admin" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dropped */}
            {dropped.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" /> Dropped ({dropped.length})
                </h4>
                <div className="space-y-3">
                  {dropped.map(e => (
                    <div key={e.id} className="p-5 rounded-2xl border border-rose-200/60 dark:border-rose-900/30 bg-rose-50/40 dark:bg-rose-950/10">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                            <h5 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{e.course.title}</h5>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{e.course.shortDescription}</p>
                        </div>
                        <Badge className="bg-rose-500 text-white font-black text-[9px] uppercase tracking-widest border-none shrink-0">DROPPED</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-rose-100 dark:border-rose-900/20">
                        <div className="text-center">
                          <div className="text-xl font-black text-rose-600 dark:text-rose-400">{e.overallProgress}%</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase mt-0.5">Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-black text-slate-900 dark:text-white">{fmtMins(e.totalTimeSpent)}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase mt-0.5">Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-black text-slate-700 dark:text-slate-300">{e.lastAccessAt ? new Date(e.lastAccessAt).toLocaleDateString() : "Never"}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase mt-0.5">Last Active</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-black text-slate-700 dark:text-slate-300">{new Date(e.enrolledAt).toLocaleDateString()}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase mt-0.5">Enrolled</div>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-2 italic">
                        {e.overallProgress === 0 ? "⚠ Dropped without starting."
                          : e.overallProgress < 25 ? "⚠ Dropped early (<25%)."
                          : e.overallProgress < 75 ? "ℹ Dropped midway — consider re-engagement."
                          : "✓ Dropped near completion (≥75%). High-value learner."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* On Hold */}
            {onHold.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" /> On Hold ({onHold.length})
                </h4>
                <div className="space-y-3">
                  {onHold.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/10">
                      <div>
                        <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{e.course.title}</h5>
                        <span className="text-[10px] font-black text-amber-600 uppercase">{e.status}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-amber-600 tabular-nums">{e.overallProgress}%</div>
                        <div className="text-[9px] text-slate-400 uppercase">Progress</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── CAREER PATHS TAB ── */}
        {tab === "tracks" && (
          <>
            {trackEnrollments.length === 0 && (
              <p className="text-center text-slate-400 font-bold text-sm py-8">No Career Path enrollments yet.</p>
            )}

            {/* Active tracks */}
            {trackActive.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500" /> In Progress ({trackActive.length})
                </h4>
                <div className="space-y-3">
                  {trackActive.map(te => {
                    const totalCourses = te.track._count.courses;
                    const done = te.completedCourses.length;
                    const pct  = totalCourses > 0 ? Math.round((done / totalCourses) * 100) : 0;
                    return (
                      <div key={te.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-indigo-200/40 dark:border-indigo-800/30 bg-indigo-50/40 dark:bg-indigo-950/10 hover:shadow-xl transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
                            <h5 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{te.track.title}</h5>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex-wrap">
                            <span>Enrolled: {new Date(te.enrolledAt).toLocaleDateString()}</span>
                            <span>{done} / {totalCourses} courses done</span>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 mt-4 sm:mt-0">
                          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums leading-none">
                            {pct}<span className="text-sm opacity-60">%</span>
                          </div>
                          <div className="w-24 h-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <ResetTrackButton
                            trackEnrollmentId={te.id}
                            trackTitle={te.track.title}
                            courseCount={totalCourses}
                            variant="admin"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed tracks */}
            {trackCompleted.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" /> Completed ({trackCompleted.length})
                </h4>
                <div className="space-y-3">
                  {trackCompleted.map(te => (
                    <div key={te.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 hover:shadow-xl transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                          <h5 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{te.track.title}</h5>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex-wrap">
                          <span>Completed: {te.completedAt ? new Date(te.completedAt).toLocaleDateString() : "—"}</span>
                          <span>{te.track._count.courses} courses</span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 mt-4 sm:mt-0">
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">100<span className="text-sm opacity-60">%</span></div>
                        <div className="w-24 h-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-emerald-500 rounded-full" />
                        </div>
                        <ResetTrackButton
                          trackEnrollmentId={te.id}
                          trackTitle={te.track.title}
                          courseCount={te.track._count.courses}
                          variant="admin"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dropped tracks */}
            {trackDropped.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" /> Dropped ({trackDropped.length})
                </h4>
                <div className="space-y-3">
                  {trackDropped.map(te => {
                    const totalCourses = te.track._count.courses;
                    const done = te.completedCourses.length;
                    const pct  = totalCourses > 0 ? Math.round((done / totalCourses) * 100) : 0;
                    return (
                      <div key={te.id} className="flex items-center justify-between p-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/30 bg-rose-50/40 dark:bg-rose-950/10">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                            <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{te.track.title}</h5>
                          </div>
                          <span className="text-[10px] font-black text-rose-500 uppercase">{done}/{totalCourses} courses completed before drop</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-rose-600 tabular-nums">{pct}%</div>
                          <div className="text-[9px] text-slate-400 uppercase">Progress</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

      </CardContent>
    </Card>
  );
}
