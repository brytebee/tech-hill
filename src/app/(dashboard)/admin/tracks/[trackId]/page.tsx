"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronUp, ChevronDown, Trash2, BookPlus, Loader2, ArrowLeft,
  Layers, Settings2, Clock, BookOpen, Save, SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { CourseInjectionModal } from "@/components/admin/CourseInjectionModal";
import { TrackTopicEditorSheet } from "@/components/admin/TrackTopicEditorSheet";

interface TopicOption { id: string; title: string; topicType: string; duration?: number; orderIndex: number; }
interface ModuleOption { id: string; title: string; order: number; topics: TopicOption[]; }
interface TrackCourseRow {
  id: string;
  courseId: string;
  order: number;
  includedTopicIds: string[];
  course: {
    id: string; title: string; shortDescription?: string;
    difficulty: string; duration: number; thumbnail?: string; status: string;
    modules: ModuleOption[];
  };
}
interface TrackDetail {
  id: string; title: string; description: string;
  price: string | number; isPublished: boolean;
  courses: TrackCourseRow[];
}

export default function AdminTrackDetailPage() {
  const { trackId } = useParams();
  const router = useRouter();
  const [track, setTrack] = useState<TrackDetail | null>(null);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [trackPrice, setTrackPrice] = useState("0");
  const [showInjectModal, setShowInjectModal] = useState(false);
  const [editorSheet, setEditorSheet] = useState<TrackCourseRow | null>(null);

  useEffect(() => { fetchData(); }, [trackId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [trackData, coursesData] = await Promise.all([
        fetch(`/api/admin/tracks/${trackId}`).then(r => r.json()),
        fetch(`/api/courses?limit=200`).then(r => r.json()),
      ]);
      setTrack(trackData);
      setTrackPrice((trackData.price || 0).toString());
      setAllCourses(coursesData.courses ?? []);
    } catch {
      toast.error("Failed to load track details");
      router.push("/admin/tracks");
    } finally {
      setIsLoading(false);
    }
  };

  const moveRow = async (idx: number, direction: "up" | "down") => {
    if (!track) return;
    const rows = [...track.courses];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= rows.length) return;

    // Swap in local state immediately (optimistic)
    [rows[idx], rows[swapIdx]] = [rows[swapIdx], rows[idx]];
    const reordered = rows.map((r, i) => ({ ...r, order: i }));
    setTrack(prev => prev ? { ...prev, courses: reordered } : prev);

    // Persist
    setIsSavingOrder(true);
    try {
      const res = await fetch(`/api/admin/tracks/${trackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          courses: reordered.map(r => ({ id: r.id, order: r.order })),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Order saved");
    } catch {
      toast.error("Failed to save order");
      fetchData(); // Revert
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleRemove = async (row: TrackCourseRow) => {
    if (!confirm(`Remove "${row.course.title}" from this path?`)) return;
    try {
      await fetch(`/api/admin/tracks/${trackId}/courses/${row.id}`, { method: "DELETE" });
      toast.success("Course removed");
      fetchData();
    } catch { toast.error("Removal failed"); }
  };

  const handleUpdatePrice = async () => {
    setIsUpdatingPrice(true);
    try {
      const res = await fetch(`/api/admin/tracks/${trackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: trackPrice }),
      });
      if (res.ok) { toast.success("Price updated"); fetchData(); }
      else toast.error("Failed to update price");
    } catch { toast.error("Failed to update price"); }
    finally { setIsUpdatingPrice(false); }
  };

  if (isLoading) return <AdminLayout title="Loading…"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></AdminLayout>;
  if (!track) return null;

  const existingCourseIds = track.courses.map(tc => tc.courseId);
  const totalTopics = track.courses.reduce((sum, tc) =>
    sum + (tc.includedTopicIds.length || tc.course.modules.flatMap(m => m.topics).length), 0);
  const totalDuration = track.courses.reduce((sum, tc) => sum + (tc.course.duration || 0), 0);

  return (
    <AdminLayout title={track.title} description="Configure course sequence and topic injection for this career path.">
      <div className="space-y-6 max-w-6xl mx-auto">
        <Link href="/admin/tracks" className="inline-flex items-center gap-2 text-sm font-black text-blue-600 uppercase tracking-widest hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Tracks
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Sequence Builder */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/60 flex flex-row items-center justify-between py-4 px-6 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-500" /> Path Sequence
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 ml-1">
                    {track.courses.length} course{track.courses.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
                {isSavingOrder && <Loader2 className="animate-spin h-4 w-4 text-blue-500" />}
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {track.courses.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <Layers className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-bold text-sm">No courses yet. Inject a course to get started.</p>
                  </div>
                ) : track.courses.map((tc, idx) => {
                  const allTopicCount = tc.course.modules.flatMap(m => m.topics).length;
                  const isFiltered = tc.includedTopicIds.length > 0;
                  const topicLabel = isFiltered ? `${tc.includedTopicIds.length} topics` : "All topics";
                  return (
                    <div key={tc.id} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 group hover:border-blue-500/30 hover:shadow-md transition-all">
                      {/* Sequence badge */}
                      <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500">
                        {String(idx + 1).padStart(2, "0")}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm truncate">{tc.course.title}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className="text-[9px] font-black uppercase">{tc.course.difficulty}</Badge>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <Clock className="h-3 w-3" />{tc.course.duration}h
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-medium">
                            <BookOpen className="h-3 w-3" />
                            <span className={isFiltered ? "text-amber-600 dark:text-amber-400 font-black" : "text-slate-400"}>
                              {topicLabel}
                              {isFiltered && <span className="text-slate-400 font-normal"> / {allTopicCount}</span>}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Up/Down */}
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveRow(idx, "up")} disabled={idx === 0 || isSavingOrder}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 transition-colors"
                            title="Move up">
                            <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                          </button>
                          <button onClick={() => moveRow(idx, "down")} disabled={idx === track.courses.length - 1 || isSavingOrder}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 transition-colors"
                            title="Move down">
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                          </button>
                        </div>
                        {/* Edit Topics */}
                        <Button variant="ghost" size="sm" onClick={() => setEditorSheet(tc)}
                          className="h-8 px-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 rounded-xl gap-1">
                          <SlidersHorizontal className="h-3.5 w-3.5" /> Topics
                        </Button>
                        {/* Remove */}
                        <Button variant="ghost" size="sm" onClick={() => handleRemove(tc)}
                          className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Inject button */}
                <button onClick={() => setShowInjectModal(true)}
                  className="w-full mt-2 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:border-blue-500/40 hover:text-blue-500 hover:bg-blue-500/5 transition-all text-sm font-black uppercase tracking-widest">
                  <BookPlus className="h-4 w-4" /> Inject Course
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-5">
            {/* Intelligence Insights */}
            <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Settings2 className="h-4 w-4" /> Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {[
                  { label: "Courses", value: track.courses.length },
                  { label: "Est. Duration", value: `${totalDuration}h` },
                  { label: "Total Topics", value: totalTopics },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link href={`/admin/tracks/${trackId}/edit`}>
                    <Button variant="outline" className="w-full rounded-xl font-black uppercase text-xs tracking-widest h-9">
                      Edit Metadata
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Monetization */}
            <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm border-t-4 border-t-amber-500">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">Monetization</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Price (₦)</label>
                  <input type="number" value={trackPrice} onChange={e => setTrackPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 font-bold text-slate-900 dark:text-white" />
                  <p className="text-[10px] text-slate-400">0 = free path. Subscribers bypass this price.</p>
                </div>
                <Button onClick={handleUpdatePrice} disabled={isUpdatingPrice}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest h-11 rounded-xl">
                  {isUpdatingPrice ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="h-4 w-4 mr-2" />Commit Pricing</>}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Course Injection Modal */}
      <CourseInjectionModal
        open={showInjectModal}
        onClose={() => setShowInjectModal(false)}
        existingCourseIds={existingCourseIds}
        allCourses={allCourses}
        nextOrder={track.courses.length}
        trackId={trackId as string}
        onSuccess={() => { setShowInjectModal(false); fetchData(); toast.success("Course injected!"); }}
      />

      {/* Topic Editor Sheet */}
      {editorSheet && (
        <TrackTopicEditorSheet
          open={!!editorSheet}
          onClose={() => setEditorSheet(null)}
          trackId={trackId as string}
          trackCourseId={editorSheet.id}
          courseTitle={editorSheet.course.title}
          modules={editorSheet.course.modules}
          currentIncludedTopicIds={editorSheet.includedTopicIds}
          onSuccess={() => { setEditorSheet(null); fetchData(); toast.success("Topic selection saved!"); }}
        />
      )}
    </AdminLayout>
  );
}
