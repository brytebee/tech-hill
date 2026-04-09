"use client";

import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ArrowRight, CheckCircle, Clock, BookOpen, Star, Rocket, ChevronRight, Loader2, Crown } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Track {
  id: string;
  title: string;
  description: string;
  slug: string;
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
        <header className="mb-12">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
               Accelerated <span className="text-blue-600">Career Paths</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
              Master an entire industry domain by following expertly curated course sequences designed for maximum retention.
            </p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1,2].map(i => <div key={i} className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {tracks.map((track) => (
              <Card key={track.id} className="border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col">
                <div className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600 w-full" />
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
                     <Button
                       onClick={() => router.push(`/student/tracks/${track.id}`)}
                       className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[11px] tracking-widest h-12 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                     >
                       <CheckCircle className="mr-2 h-4 w-4" /> Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
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
        )}
      </div>
    </StudentLayout>
  );
}
