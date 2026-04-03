"use client";

import React from "react";
import { useLoader } from "@/hooks/use-loader";

export function GlobalLoader() {
  const { isLoading, message } = useLoader();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-500 animate-in fade-in zoom-in-95">
      <div className="relative flex flex-col items-center gap-8 p-12 rounded-[2rem] bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 shadow-2xl overflow-hidden">
        
        {/* Animated Background Ring */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 blur-3xl -z-10 animate-pulse" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        {/* Premium Breathing Ring Core */}
        <div className="relative flex items-center justify-center w-24 h-24">
           {/* Dual Rotating Rings */}
           <div className="absolute inset-0 border-[5px] border-transparent border-t-blue-600 dark:border-t-blue-500 rounded-full animate-[spin_1s_cubic-bezier(0.5,0.1,0.5,0.9)_infinite]" />
           <div className="absolute inset-2 border-[5px] border-transparent border-b-indigo-500 dark:border-b-indigo-400 rounded-full animate-[spin_1.5s_cubic-bezier(0.5,0.1,0.5,0.9)_infinite_reverse]" />
           
           {/* Inner Beating Core */}
           <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse" />
        </div>

        {/* Text Area */}
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            {message || "Securing Connection..."}
          </h3>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase animate-pulse flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Executing Function
          </p>
        </div>

        {/* Infinite Pipeline Tracker */}
        <div className="w-56 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2 relative shadow-inner">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 rounded-full animate-loader-progress w-2/3 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loader-progress {
          0% {
            transform: translateX(-150%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .animate-loader-progress {
          animation: loader-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
