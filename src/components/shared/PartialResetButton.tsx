"use client";
// components/shared/PartialResetButton.tsx
// Inline hover button on each completed topic row that triggers a partial reset.

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2, ArrowDownFromLine } from "lucide-react";

interface Props {
  enrollmentId: string;
  topicId: string;
  topicTitle: string;
  topicsAfterCount: number; // how many topics will be wiped (including this one)
  onSuccess?: () => void;
}

export function PartialResetButton({
  enrollmentId,
  topicId,
  topicTitle,
  topicsAfterCount,
  onSuccess,
}: Props) {
  const router  = useRouter();
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/enrollments/${enrollmentId}/reset-from-topic`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed.");
      setOpen(false);
      if (onSuccess) onSuccess();
      else router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="opacity-0 group-hover/topic:opacity-100 focus:opacity-100 transition-opacity ml-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 px-2 py-1 rounded-lg hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 whitespace-nowrap"
          title={`Reset from "${topicTitle}" onwards`}
        >
          <RotateCcw className="h-2.5 w-2.5" />
          Reset from here
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <DialogHeader className="space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
            <ArrowDownFromLine className="h-7 w-7 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Partial Reset
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500 font-medium leading-relaxed">
            This will clear progress for{" "}
            <span className="font-black text-slate-900 dark:text-white">
              "{topicTitle}"
            </span>{" "}
            and the{" "}
            <span className="font-black text-slate-900 dark:text-white">
              {topicsAfterCount - 1} lesson{topicsAfterCount - 1 !== 1 ? "s" : ""} after it
            </span>
            .
            <br />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              ✓ Earlier lessons are preserved.
            </span>
            <br />
            <span className="text-rose-500 font-bold text-[11px]">
              Quiz attempts for those lessons will also be cleared.
            </span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-xs border-slate-200 dark:border-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReset}
            disabled={loading}
            className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-xs bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            {loading ? "Resetting…" : "Reset from Here"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
