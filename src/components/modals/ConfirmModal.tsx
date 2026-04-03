"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HelpCircle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}: ConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl sm:max-w-md overflow-hidden">
        {/* Top edge subtle glow strip */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
        
        <AlertDialogHeader className="pt-2 px-2">
           <div className="flex flex-col sm:flex-row sm:items-start gap-4 text-left">
              <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center border shadow-inner bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 mt-1">
                 {loading ? (
                   <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                 ) : (
                   <HelpCircle className="h-6 w-6 text-blue-500 drop-shadow-sm" />
                 )}
              </div>
              <div className="space-y-1.5">
                <AlertDialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {description}
                </AlertDialogDescription>
              </div>
           </div>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 gap-3 sm:gap-0">
          <AlertDialogCancel 
            disabled={loading}
            className="h-11 px-6 rounded-xl font-semibold border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:bg-slate-800"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="h-11 px-8 rounded-xl font-bold tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 border-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
