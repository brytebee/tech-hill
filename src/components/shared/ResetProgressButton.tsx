"use client";
// components/shared/ResetProgressButton.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RotateCcw, Loader2, AlertTriangle } from "lucide-react";

interface ResetProgressButtonProps {
  /** The Enrollment.id to reset (NOT the courseId). */
  enrollmentId: string;
  courseTitle: string;
  /** Visual variant. "admin" renders a ghost+rose button; "student" renders a subtle outlined button. */
  variant?: "admin" | "student";
  /** Called after a successful reset so the parent can refresh without a full page reload. */
  onSuccess?: () => void;
  className?: string;
}

export function ResetProgressButton({
  enrollmentId,
  courseTitle,
  variant = "student",
  onSuccess,
  className,
}: ResetProgressButtonProps) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleReset = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/enrollments/${enrollmentId}/reset`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setOpen(false);

      if (onSuccess) {
        onSuccess();
      } else {
        // Full page refresh so server components re-fetch the latest state.
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerButtonProps =
    variant === "admin"
      ? {
          variant: "ghost" as const,
          className: `text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-black uppercase tracking-widest text-[10px] h-9 px-3 rounded-xl ${className ?? ""}`,
        }
      : {
          variant: "outline" as const,
          className: `border-slate-200 dark:border-slate-700 hover:border-amber-500/50 font-black uppercase tracking-widest text-[10px] h-9 px-3 rounded-xl text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 ${className ?? ""}`,
        };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...triggerButtonProps}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          {variant === "admin" ? "Force Reset" : "Retake Course"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <DialogHeader className="space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Reset Course Progress
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500 font-medium leading-relaxed">
            This will permanently erase all progress, quiz attempts, and
            completion records for{" "}
            <span className="font-black text-slate-900 dark:text-white">
              "{courseTitle}"
            </span>
            . The student will start fresh from the beginning.
            <br />
            <span className="text-amber-600 dark:text-amber-400 font-black">
              This cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
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
            className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 transition-all"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            {loading ? "Resetting…" : "Yes, Reset Progress"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
