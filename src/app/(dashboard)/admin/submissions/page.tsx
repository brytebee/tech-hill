"use client";

import { useState } from "react";
import useSWR from "swr";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Filter, ClipboardCheck, ExternalLink, Calendar, User, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminSubmissionsPage() {
  const [statusFilter, setStatusFilter] = useState("PENDING"); // Combined visual filter
  const { data, error, isLoading, mutate } = useSWR(`/api/admin/submissions`, fetcher);

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter client-side based on tabs
  const filteredSubmissions = data?.submissions?.filter((sub: any) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return sub.status === "SUBMITTED" || sub.status === "RESUBMITTED";
    return sub.status === statusFilter;
  }) || [];

  const handleReview = async (decision: "APPROVED" | "CHANGES_REQUIRED" | "REJECTED") => {
    if (!selectedSubmission) return;
    if ((decision === "CHANGES_REQUIRED" || decision === "REJECTED") && !reviewNotes.trim()) {
      toast.error("Review notes are required for changes or rejection.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/submissions/${selectedSubmission.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reviewNotes }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);
      
      toast.success(`Project marked as ${decision.replace("_", " ")}`);
      setSelectedSubmission(null);
      setReviewNotes("");
      mutate(); // Refresh the list
    } catch (e: any) {
      toast.error(e.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-medium hover:bg-green-100">Approved</Badge>;
      case "CHANGES_REQUIRED":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 font-medium hover:bg-yellow-100">Changes Required</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-medium hover:bg-red-100">Rejected</Badge>;
      case "SUBMITTED":
      case "RESUBMITTED":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-medium hover:bg-blue-100">{status === "RESUBMITTED" ? "Resubmitted" : "Needs Review"}</Badge>;
      default:
        return <Badge variant="outline">{status.replace("_", " ")}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-indigo-500" />
              Project Submissions
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              Review and grade student capstone projects.
            </p>
          </div>
        </div>

        <Tabs defaultValue="PENDING" onValueChange={setStatusFilter} className="mb-6">
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <TabsTrigger value="PENDING" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-400">
              Action Required
            </TabsTrigger>
            <TabsTrigger value="APPROVED">Approved</TabsTrigger>
            <TabsTrigger value="CHANGES_REQUIRED">Changes Required</TabsTrigger>
            <TabsTrigger value="ALL">All Submissions</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No submissions found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  There are currently no student submissions matching this filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 text-sm font-medium">
                      <th className="p-4 pl-6">Student</th>
                      <th className="p-4">Project Topic</th>
                      <th className="p-4">Submitted At</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredSubmissions.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400">
                              {sub.user.firstName?.[0] || <User className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                {sub.user.firstName} {sub.user.lastName}
                              </p>
                              <p className="text-xs text-slate-500">{sub.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-slate-900 dark:text-slate-200 text-sm">{sub.topic.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{sub.topic.module.course.title}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4 opacity-70" />
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 ml-6">
                            Attempt {sub.attemptNumber}
                          </p>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setReviewNotes("");
                            }}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
          <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-xl">Review Project Submission</DialogTitle>
              <DialogDescription>
                Evaluate {selectedSubmission?.user.firstName}'s work for "{selectedSubmission?.topic.title}"
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Project Link</label>
                <a 
                  href={selectedSubmission?.content} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-wrap items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium break-all"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  {selectedSubmission?.content}
                </a>
              </div>

              {selectedSubmission?.description && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Student Notes</label>
                  <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300">
                    {selectedSubmission.description}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  Tutor Feedback
                  <span className="text-xs font-normal text-slate-500">(Required for rejection/changes)</span>
                </label>
                <textarea
                  className="w-full min-h-[120px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="Provide constructive feedback, critique code quality, or explain what needs fixing..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                disabled={isSubmitting || !reviewNotes.trim()}
                onClick={() => handleReview("REJECTED")}
              >
                Reject Project
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900/50 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                disabled={isSubmitting || !reviewNotes.trim()}
                onClick={() => handleReview("CHANGES_REQUIRED")}
              >
                Request Changes
              </Button>
              <Button 
                className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white"
                disabled={isSubmitting}
                onClick={() => handleReview("APPROVED")}
              >
                Approve & Unlock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
