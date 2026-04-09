"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, PlayCircle, Award, ArrowRight, Loader2, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Link from "next/link";

interface TrackProgress {
    id: string;
    title: string;
    description: string;
    enrollment: {
        completedCourses: string[];
        currentCourseId: string;
        status: string;
    } | null;
    courses: {
        course: {
            id: string;
            title: string;
            description: string;
            thumbnail: string;
        }
    }[];
}

export default function StudentTrackLearningPage() {
    const { trackId } = useParams();
    const router = useRouter();
    const [track, setTrack] = useState<TrackProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, [trackId]);

    const fetchProgress = async () => {
        try {
            const resp = await fetch(`/api/student/tracks/${trackId}`);
            if (!resp.ok) throw new Error("Failed to load");
            const data = await resp.json();
            setTrack(data);
        } catch (err) {
            toast.error("Failed to load path progress");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <StudentLayout><div className="p-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div></StudentLayout>;
    if (!track) return <StudentLayout><div className="p-20 text-center">Path not found</div></StudentLayout>;

    const courses = track.courses ?? [];
    const completedCourses = track.enrollment?.completedCourses ?? [];
    const completedCount = completedCourses.length;
    const totalCount = courses.length || 1; // prevent division by zero
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    return (
        <StudentLayout>
            <div className="max-w-5xl mx-auto py-12 px-6">
                <div className="mb-12 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full -mr-20 -mt-20" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Mastery Journey</span>
                            {progressPercent === 100 && <span className="bg-emerald-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Completed</span>}
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{track.title}</h1>
                        <p className="text-slate-400 font-medium max-w-xl mb-8">{track.description}</p>
                        
                        <div className="space-y-2">
                             <div className="flex justify-between text-sm font-black uppercase tracking-widest text-slate-400">
                                <span>Path Completion</span>
                                <span>{progressPercent}%</span>
                             </div>
                             <Progress value={progressPercent} className="h-3 bg-slate-800" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {courses.map((tc, idx) => {
                        const isCompleted = completedCourses.includes(tc.course.id);
                        const isCurrent = track.enrollment?.currentCourseId === tc.course.id || (!track.enrollment?.currentCourseId && !isCompleted && idx === 0);
                        const isLocked = !isCompleted && !isCurrent && idx > completedCount;

                        return (
                            <Card key={tc.course.id} className={`border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden transition-all duration-300 ${isLocked ? 'opacity-60 grayscale' : 'hover:shadow-xl hover:translate-x-2'}`}>
                                <CardContent className="p-0 flex flex-col md:flex-row items-center">
                                    <div className={`p-8 flex items-center justify-center ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/20' : isCurrent ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-slate-50 dark:bg-slate-900'}`}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                        ) : isLocked ? (
                                            <Circle className="h-10 w-10 text-slate-300" />
                                        ) : (
                                            <PlayCircle className="h-10 w-10 text-blue-500 animate-pulse" />
                                        ) }
                                    </div>
                                    <div className="p-8 flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Phase 0{idx + 1}</span>
                                            {isCurrent && <Badge className="bg-blue-600 font-black text-[9px] uppercase h-5">Up Next</Badge>}
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{tc.course.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1">{tc.course.description}</p>
                                    </div>
                                    <div className="p-8 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5">
                                        {isLocked ? (
                                            <Button disabled className="rounded-xl font-bold uppercase text-[10px] bg-slate-100 text-slate-400">Locked</Button>
                                        ) : (
                                            <Button asChild className={`${isCompleted ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black uppercase text-[11px] tracking-widest h-11 px-8 rounded-xl shadow-lg transition-all`}>
                                                <Link href={`/student/courses/${tc.course.id}`}>
                                                    {isCompleted ? 'Review Course' : 'Launch Course'} <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {progressPercent === 100 && (
                    <Card className="mt-12 bg-gradient-to-br from-blue-600 to-indigo-700 border-none rounded-3xl p-10 text-center text-white shadow-2xl">
                         <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                            <Award className="h-10 w-10 text-white" />
                         </div>
                         <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Mastery Achieved</h2>
                         <p className="text-blue-100 font-medium mb-8 max-w-sm mx-auto">You have successfully navigated the entire {track.title} path. Your verified mastery certificate is now ready.</p>
                         <Button className="bg-white text-blue-700 font-black uppercase text-xs tracking-widest h-12 px-10 rounded-2xl shadow-xl hover:bg-blue-50 transition-all">
                             Claim Tracking Certificate
                         </Button>
                    </Card>
                )}
            </div>
        </StudentLayout>
    );
}
