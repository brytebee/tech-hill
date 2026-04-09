// app/(dashboard)/admin/promotions/flash/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Rocket, X, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function CreateFlashSalePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    discountPercentage: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => setCourses(data.courses || data || []))
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleCourse = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.discountPercentage || !form.startTime || !form.endTime) {
      toast.error("Name, discount %, start and end time are required.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/promotions/flash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, courseIds: selectedCourseIds }),
      });

      if (res.ok) {
        toast.success("Flash sale launched!");
        router.push("/admin/promotions");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create flash sale.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Initialize Flash Sale" description="Create a time-limited price reduction campaign">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/promotions">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Promotions
            </Button>
          </Link>
        </div>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Rocket className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-black">Flash Sale Campaign</CardTitle>
                <CardDescription>Temporal price reduction to drive rapid enrollment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold uppercase text-xs tracking-wider text-slate-500">Campaign Name *</Label>
                <Input id="name" name="name" placeholder="e.g. Black Friday Blitz" value={form.name} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="discountPercentage" className="font-bold uppercase text-xs tracking-wider text-slate-500">Discount % *</Label>
                  <Input id="discountPercentage" name="discountPercentage" type="number" min="1" max="100" placeholder="e.g. 40" value={form.discountPercentage} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="font-bold uppercase text-xs tracking-wider text-slate-500">Start Time *</Label>
                  <Input id="startTime" name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="font-bold uppercase text-xs tracking-wider text-slate-500">End Time *</Label>
                  <Input id="endTime" name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold uppercase text-xs tracking-wider text-slate-500">Description</Label>
                <Input id="description" name="description" placeholder="Optional internal notes" value={form.description} onChange={handleChange} />
              </div>

              {/* Course targeting */}
              <div className="space-y-3">
                <Label className="font-bold uppercase text-xs tracking-wider text-slate-500">Target Courses <span className="normal-case font-normal">(leave blank to apply platform-wide)</span></Label>
                {selectedCourseIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCourseIds.map((id) => {
                      const c = courses.find((x) => x.id === id);
                      return (
                        <Badge key={id} className="gap-1.5 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400">
                          {c?.title}
                          <button type="button" onClick={() => toggleCourse(id)}><X className="h-3 w-3" /></button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => toggleCourse(course.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCourseIds.includes(course.id)
                          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedCourseIds.includes(course.id) ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {course.title}
                      </div>
                    </button>
                  ))}
                  {courses.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Loading courses...</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href="/admin/promotions">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-8">
                  <Rocket className="h-4 w-4 mr-2" />
                  {isLoading ? "Launching..." : "Launch Flash Sale"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
