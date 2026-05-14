"use client";

import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ArrowRight, CheckCircle, Clock, BookOpen, Star, Rocket, ChevronRight, Loader2, Crown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ResetTrackButton } from "@/components/shared/ResetTrackButton";

interface Track {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail?: string;
  courses: {
    course: {
      id: string;
      title: string;
      duration: number;
    }
  }[];
  _count: {
    courses: number;
    enrollments: number;
  }
}

export default function StudentTracksPage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const response = await fetch("/api/student/tracks");
      if (!response.ok) throw new Error("Failed to load");
      const data = await response.json();
      // API now returns { tracks, hasSubscription }
      setTracks(data.tracks ?? data);
      setHasSubscription(data.hasSubscription ?? false);
    } catch (error) {
      toast.error("Failed to load learning paths");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (trackId: string) => {
    setIsEnrolling(trackId);
    try {
      const resp = await fetch(`/api/student/tracks/${trackId}/enroll`, { method: "POST" });
      const data = await resp.json();
      if (data.success) {
        toast.success("Enrolled in career path!");
        router.push(`/student/tracks/${trackId}`);
      } else {
        toast.error(data.error || "Enrollment failed");
      }
    } catch (err) {
      toast.error("Network error during enrollment");
    } finally {
      setIsEnrolling(null);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto py-12 px-6">
        <header className="mb-10">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
               Accelerated <span className="text-blue-600">Career Paths</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed mb-6">
              Master an entire industry domain by following expertly curated course sequences designed for maximum retention.
            </p>
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search career paths…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-11 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-blue-500/20 shadow-sm"
              />
            </div>
        </header>

        {/* My Paths — enrolled career paths strip */}
        {(() => {
          const enrolledTracks = tracks.filter((t: any) => t.enrollmentStatus);
          if (enrolledTracks.length === 0) return null;
          return (
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 px-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">My Paths</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                  {enrolledTracks.length} path{enrolledTracks.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
                {enrolledTracks.map((track: any) => {
                  const total     = track._count?.courses ?? track.courses?.length ?? 1;
                  const done      = track.completedCoursesCount ?? 0;
                  const pct       = total > 0 ? Math.round((done / total) * 100) : 0;
                  const completed = track.enrollmentStatus === "COMPLETED";
                  return (
                    <div key={track.id} className="snap-start shrink-0 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all overflow-hidden flex flex-col">
                      {/* Progress bar accent */}
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${completed ? "bg-emerald-500" : "bg-indigo-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1 gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-snug line-clamp-2 flex-1">
                            {track.title}
                          </h3>
                          <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg ${completed ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"}`}>
                            {completed ? "Done" : "Active"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${completed ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-[10px] font-black tabular-nums ${completed ? "text-emerald-600" : "text-slate-500"}`}>
                            {done}/{total} courses · {pct}%
                          </span>
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <Button
                            size="sm"
                            onClick={() => router.push(`/student/tracks/${track.id}`)}
                            className={`flex-1 h-9 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${completed ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900"}`}
                          >
                            <Layers className="h-3 w-3 mr-1.5" />
                            {completed ? "Review" : "Continue"}
                          </Button>
                          {track.trackEnrollmentId && (
                            <ResetTrackButton
                              trackEnrollmentId={track.trackEnrollmentId}
                              trackTitle={track.title}
                              courseCount={total}
                              variant="student"
                              onSuccess={() => fetchTracks()}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1,2].map(i => <div key={i} className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : (() => {
          const filteredTracks = tracks.filter(
            (t) =>
              !query ||
              t.title.toLowerCase().includes(query.toLowerCase()) ||
              t.description?.toLowerCase().includes(query.toLowerCase())
          );
          return filteredTracks.length === 0 ? (
            <div className="text-center py-24">
              <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">No Paths Found</h3>
              <p className="text-slate-400 font-medium">Try a different search term.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredTracks.map((track) => (
          <Card key={track.id} className="border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col">
                {/* Thumbnail Hero */}
                <div className="relative w-full aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  {(track as any).thumbnail ? (
                    <img
                      src={(track as any).thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                      <Layers className="h-14 w-14 text-white/20" />
                    </div>
                  )}
                  {/* Dark overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  {/* Badges over image */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white/90 uppercase tracking-widest drop-shadow">Career Path</span>
                    {hasSubscription && Number((track as any).price) > 0 && (
                      <Badge className="bg-indigo-600/90 text-white border-none font-black text-[9px] uppercase flex items-center gap-1 backdrop-blur-sm">
                        <Crown className="h-2.5 w-2.5" /> Subscription
                      </Badge>
                    )}
                  </div>
                </div>
                <CardHeader className="p-8 pb-4">
                  <div className="flex gap-2 mb-4">
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-none font-black text-[10px] px-2 py-0.5 uppercase">Professional Track</Badge>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-none font-black text-[10px] px-2 py-0.5 uppercase">Certification Included</Badge>
                    {hasSubscription && Number((track as any).price) > 0 && (
                      <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-none font-black text-[10px] px-2 py-0.5 uppercase flex items-center gap-1">
                        <Crown className="h-2.5 w-2.5" /> Subscription Access
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                    {track.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-8 pt-0 flex-1">
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                    {track.description || "Master the core principles and advanced strategies of this specialized career path."}
                  </p>
                  
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    <Layers className="h-4 w-4" /> Curriculum Breakdown
                  </h4>
                  <div className="space-y-3">
                    {track.courses.map((tc, idx) => (
                      <div key={tc.course.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 group/item hover:bg-white dark:hover:bg-slate-800 transition-all">
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-black text-slate-300 dark:text-slate-700 w-4">{idx + 1}</span>
                           <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover/item:text-blue-500">{tc.course.title}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover/item:text-blue-500 group-hover/item:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-4">
                   {(track as any).enrollmentStatus ? (
                     <div className="flex flex-col sm:flex-row gap-3 flex-1">
                       <Button
                         onClick={() => router.push(`/student/tracks/${track.id}`)}
                         className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[11px] tracking-widest h-12 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                       >
                         <CheckCircle className="mr-2 h-4 w-4" /> Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                       </Button>
                       {(track as any).trackEnrollmentId && (
                         <ResetTrackButton
                           trackEnrollmentId={(track as any).trackEnrollmentId}
                           trackTitle={track.title}
                           courseCount={track._count.courses}
                           variant="student"
                           onSuccess={() => router.refresh()}
                         />
                       )}
                     </div>
                   ) : (
                     <Button
                        onClick={() => handleEnroll(track.id)}
                        disabled={isEnrolling === track.id}
                        className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[11px] tracking-widest h-12 rounded-2xl shadow-xl shadow-slate-900/20 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all"
                     >
                        {isEnrolling === track.id ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        Enroll In Mastery Path <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                   )}
                </CardFooter>
              </Card>
            ))}
          </div>
          );
        })()}
      </div>
    </StudentLayout>
  );
}
