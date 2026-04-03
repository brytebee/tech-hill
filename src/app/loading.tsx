import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-700">
      
      {/* Premium Breathing Ring Core */}
      <div className="relative flex items-center justify-center w-20 h-20">
         {/* Background Pulse Orb */}
         <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-xl animate-pulse" />
         
         {/* Dual Rotating Rings */}
         <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-500 rounded-full animate-[spin_1s_cubic-bezier(0.5,0.1,0.5,0.9)_infinite]" />
         <div className="absolute inset-2 border-4 border-transparent border-b-indigo-500 rounded-full animate-[spin_1.5s_cubic-bezier(0.5,0.1,0.5,0.9)_infinite_reverse]" />
         
         {/* Inner Beating Core */}
         <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse" />
      </div>

      <div className="flex flex-col items-center gap-1.5 mt-2">
        <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Fetching State
        </h3>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse tracking-widest uppercase">
          Initializing...
        </p>
      </div>

    </div>
  );
}
