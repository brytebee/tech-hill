"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Layers, Users, BookOpen, ExternalLink, MoreVertical, Trash, Edit, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Track {
  id: string;
  title: string;
  description: string;
  slug: string;
  isPublished: boolean;
  _count: {
    courses: number;
    enrollments: number;
  }
}

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const response = await fetch("/api/admin/tracks");
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      toast.error("Failed to fetch tracks");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Learning Tracks"
      description="Design career paths by sequencing individual courses into cohesive curriculum journeys."
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div>
             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Track Matrix</h2>
             <p className="text-slate-500 text-sm font-bold">{tracks.length} active learning paths</p>
           </div>
           <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 h-11 shadow-lg shadow-blue-500/20">
             <Plus className="mr-2 h-5 w-5" /> Create New Path
           </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <Card key={track.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={track.isPublished ? "default" : "outline"} className={track.isPublished ? "bg-emerald-500 text-white" : "text-slate-400"}>
                      {track.isPublished ? "LIVE" : "DRAFT"}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {track.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px]">
                    {track.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <div className="px-6 flex gap-4 text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50 py-3 border-y border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-1.5"><Layers className="h-3 w-3" /> {track._count.courses} Courses</div>
                   <div className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {track._count.enrollments} Enrolled</div>
                </div>
                <CardFooter className="p-4 mt-auto flex justify-between gap-2">
                   <Button variant="outline" size="sm" className="flex-1 font-bold rounded-lg h-9 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                     <Edit className="h-3 w-3 mr-2" /> Modify Path
                   </Button>
                   <Button size="sm" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg h-9 px-4" asChild>
                      <Link href={`/admin/tracks/${track.id}`}>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                   </Button>
                </CardFooter>
              </Card>
            ))}
            
            {tracks.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                 <div className="bg-slate-100 dark:bg-slate-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Layers className="h-8 w-8 text-slate-400" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Empty Track Registry</h3>
                 <p className="text-slate-500 max-w-xs mx-auto mt-2">Zero learning paths found. Create your first career track to begin curriculum sequencing.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
