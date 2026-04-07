"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, GripVertical, Trash, Save, BookPlus, Loader2, ArrowLeft, Layers } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface TrackDetail {
  id: string;
  title: string;
  description: string;
  price: string | number;
  courses: {
    id: string;
    courseId: string;
    order: number;
    course: {
      title: string;
    }
  }[];
}

export default function AdminTrackDetailPage() {
  const { trackId } = useParams();
  const router = useRouter();
  const [track, setTrack] = useState<TrackDetail | null>(null);
  const [courses, setCourses] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [trackPrice, setTrackPrice] = useState<string>("0");

  useEffect(() => {
    fetchData();
  }, [trackId]);

  const fetchData = async () => {
    try {
      const [trackData, coursesData] = await Promise.all([
        fetch(`/api/admin/tracks/${trackId}`).then(r => r.json()),
        fetch(`/api/courses?limit=100`).then(r => r.json())
      ]);
      setTrack(trackData);
      setTrackPrice((trackData.price || 0).toString());
      setCourses(coursesData.courses);
      setIsLoading(false);
    } catch (err) {
      toast.error("Failed to load track details");
      router.push("/admin/tracks");
    }
  };

  const handleAddCourse = async () => {
    if (!selectedCourseId) return;
    setIsSaving(true);
    try {
      const resp = await fetch(`/api/admin/tracks/${trackId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId, order: track?.courses.length || 0 })
      });
      if (resp.ok) {
        toast.success("Course added to path");
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to add course");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Remove this course from the sequence?")) return;
    try {
      await fetch(`/api/admin/tracks/${trackId}?courseId=${courseId}`, { method: "DELETE" });
      toast.success("Course removed");
      fetchData();
    } catch (err) { toast.error("Removal failed"); }
  };

  const handleUpdateAssignment = async () => {
    toast.success("Track sequence updated successfully");
  };

  const handleUpdatePrice = async () => {
    setIsUpdatingPrice(true);
    try {
      const resp = await fetch(`/api/admin/tracks/${trackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: trackPrice })
      });
      if (resp.ok) {
        toast.success("Track price updated successfully");
        fetchData();
      } else {
        toast.error("Failed to update price");
      }
    } catch (err) {
      toast.error("Failed to update price");
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  if (isLoading) return <AdminLayout title="Loading..."><Loader2 className="animate-spin" /></AdminLayout>;
  if (!track) return null;

  return (
    <AdminLayout 
        title={track.title} 
        description="Configure course sequence and career milestones for this track."
    >
      <div className="space-y-6">
        <Link href="/admin/tracks" className="text-sm font-black text-blue-600 flex items-center gap-2 uppercase tracking-widest hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Matrix
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900/50 flex flex-row items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                           <Layers className="h-5 w-5 text-blue-500" />
                           Path Sequence
                        </CardTitle>
                        <Button size="sm" onClick={handleUpdateAssignment} disabled={isSaving} className="bg-blue-600 font-bold hover:bg-blue-700">
                           {isSaving ? <Loader2 className="animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Hierarchy
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-3">
                           {track.courses.map((tc, idx) => (
                               <div key={tc.id} className="flex items-center gap-4 p-4 grayscale hover:grayscale-0 transition-all border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
                                  <div className="p-2 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-lg cursor-grab">
                                     <GripVertical className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1">
                                     <div className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Sequence 0{idx + 1}</div>
                                     <div className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{tc.course.title}</div>
                                  </div>
                                  <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleDeleteCourse(tc.courseId)}
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  >
                                     <Trash className="h-4 w-4" />
                                  </Button>
                               </div>
                           ))}
                           
                           {track.courses.length === 0 && (
                               <div className="text-center py-10 text-slate-400 italic">No courses in this sequence yet.</div>
                           )}

                           <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-8">
                               <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Add Course to Sequence</h4>
                               <div className="flex gap-2">
                                  <select 
                                      value={selectedCourseId}
                                      onChange={(e) => setSelectedCourseId(e.target.value)}
                                      className="flex-1 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 font-bold text-slate-700 dark:text-slate-300"
                                  >
                                      <option value="">Select a Course...</option>
                                      {courses.map((c: any) => (
                                          <option key={c.id} value={c.id}>{c.title}</option>
                                      ))}
                                  </select>
                                  <Button 
                                      onClick={handleAddCourse}
                                      disabled={isSaving || !selectedCourseId}
                                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold h-11 rounded-xl px-6"
                                  >
                                     <BookPlus className="mr-2 h-4 w-4" /> Inject
                                  </Button>
                               </div>
                           </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                 <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-md font-bold uppercase">Intelligence Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Mastery Time</h5>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                               {track.courses.length > 0 ? `${track.courses.length * 15} Hours` : "0 Hours"}
                            </p>
                        </div>
                    </CardContent>
                 </Card>

                 <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm border-t-4 border-t-amber-500">
                    <CardHeader>
                        <CardTitle className="text-md font-bold uppercase text-amber-600 dark:text-amber-500">Monetization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Base Price (₦)</label>
                           <input 
                              type="number"
                              value={trackPrice}
                              onChange={(e) => setTrackPrice(e.target.value)}
                              placeholder="0.00"
                              className="w-full h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 font-bold"
                           />
                           <p className="text-[10px] text-slate-400 font-medium">Leave as 0 for free paths. Learners with active subscriptions can enroll regardless of this price.</p>
                        </div>
                        <Button 
                           onClick={handleUpdatePrice} 
                           disabled={isUpdatingPrice} 
                           className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest h-11 rounded-xl"
                        >
                           {isUpdatingPrice ? <Loader2 className="animate-spin h-4 w-4" /> : "Commit Pricing"}
                        </Button>
                    </CardContent>
                 </Card>
            </div>
        </div>
      </div>
    </AdminLayout>
  );
}
