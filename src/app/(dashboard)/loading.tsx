import React from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 w-full">
      <div className="relative flex items-center justify-center bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 backdrop-blur-sm shadow-xl shadow-blue-500/5">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <div className="absolute inset-0 border-2 border-blue-600/10 rounded-2xl animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-base font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
          Preparing your dashboard
        </p>
        <p className="text-xs text-slate-400 font-medium">
          Fetching latest data
        </p>
      </div>
    </div>
  );
}
