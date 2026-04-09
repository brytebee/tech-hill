"use client";

import { useEffect, useState, use } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface Track {
  id: string;
  title: string;
  description: string;
  slug: string;
  isPublished: boolean;
  price: number;
}

export default function TrackEditor({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = use(params);
  const router = useRouter();
  const [track, setTrack] = useState<Partial<Track>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await fetch(`/api/admin/tracks/${trackId}`);
        if (!response.ok) throw new Error("Not found");
        const data = await response.json();
        setTrack({
          ...data,
          price: data.price ? Number(data.price) : 0
        });
      } catch (error) {
        toast.error("Failed to fetch track details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrack();
  }, [trackId]);

  const handleSave = async () => {
    if (!track.title || !track.slug) {
      toast.error("Title and Slug are required.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/tracks/${trackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(track),
      });

      if (!response.ok) {
         throw new Error("Failed to save changes");
      }
      
      toast.success("Track successfully updated");
      router.push("/admin/tracks");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
         <div className="h-96 flex items-center justify-center animate-pulse">
           <div className="w-8 h-8 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin"></div>
         </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Edit Learning Track"
      description="Modify the core metadata for this career path sequence."
    >
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-6 hover:bg-slate-100 dark:hover:bg-slate-800 -ml-4">
          <Link href="/admin/tracks">
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back to Registry
          </Link>
        </Button>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-xl">
            <CardTitle>Track Metadata</CardTitle>
            <CardDescription>Update the public-facing details for this track.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Track Title</Label>
                <Input 
                   value={track.title || ""} 
                   onChange={e => setTrack({...track, title: e.target.value})} 
                   placeholder="e.g. Fullstack Engineer Path" 
                />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input 
                   value={track.slug || ""} 
                   onChange={e => setTrack({...track, slug: e.target.value})} 
                   placeholder="e.g. fullstack-path" 
                />
              </div>
              <div className="space-y-2">
                <Label>Direct Buy Price (NGN) - Optional</Label>
                <Input 
                   type="number"
                   value={track.price || 0} 
                   onChange={e => setTrack({...track, price: Number(e.target.value)})} 
                   placeholder="0 for standalone" 
                />
                <p className="text-xs text-slate-500">If 0, track is only accessible via Monthly Subscription plans.</p>
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center space-x-2 py-2">
                  <input 
                     type="checkbox" 
                     id="isPublished"
                     className="w-4 h-4 rounded border-slate-300 bg-white"
                     checked={track.isPublished || false} 
                     onChange={e => setTrack({...track, isPublished: e.target.checked})} 
                  />
                  <Label htmlFor="isPublished">Publish Track publicly</Label>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea 
                   value={track.description || ""} 
                   onChange={e => setTrack({...track, description: e.target.value})} 
                   rows={4}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-xl px-6 py-4 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-8">
              {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}
