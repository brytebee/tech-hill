"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText?: string;
  variant?: "default" | "warning" | "error" | "success";
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  description,
  buttonText = "Got it",
  variant = "default",
}: AlertModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "error":
        return "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/25 border-0";
      case "warning":
        return "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 border-0";
      case "success":
        return "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25 border-0";
      default:
        return "bg-slate-900 border-slate-800 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-lg border-0";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "error":
        return <XCircle className="h-6 w-6 text-red-500 drop-shadow-sm" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-amber-500 drop-shadow-sm" />;
      case "success":
        return <CheckCircle className="h-6 w-6 text-emerald-500 drop-shadow-sm" />;
      default:
        return <Info className="h-6 w-6 text-blue-500 drop-shadow-sm" />;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl sm:max-w-md overflow-hidden">
        {/* Top edge glow strip based on variant */}
        <div className={`absolute top-0 inset-x-0 h-1 ${
           variant === 'error' ? 'bg-red-500' :
           variant === 'warning' ? 'bg-amber-500' :
           variant === 'success' ? 'bg-emerald-500' :
           'bg-blue-500'
        }`} />
        
        <AlertDialogHeader className="pt-2 px-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-left">
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center border shadow-inner ${
                variant === 'error' ? 'bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/20' :
                variant === 'warning' ? 'bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20' :
                variant === 'success' ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                'bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20'
            }`}>
              {getIcon()}
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="pt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <AlertDialogAction onClick={onClose} className={`h-11 px-8 rounded-xl font-bold transition-all ${getVariantStyles()}`}>
            {buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
