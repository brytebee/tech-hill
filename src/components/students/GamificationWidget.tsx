"use client";

import { Flame, Zap, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GamificationWidgetProps {
  xp: number;
  streakDays: number;
  nextThreshold?: number;
}

export function GamificationWidget({ xp, streakDays, nextThreshold = 1000 }: GamificationWidgetProps) {
  // A simple function to determine next boundary for purely visual top-bar purposes
  const getNextLevelThreshold = (currentXp: number) => {
    if (currentXp < 1000) return 1000;
    if (currentXp < 5000) return 5000;
    if (currentXp < 10000) return 10000;
    return Math.ceil(currentXp / 5000) * 5000;
  };

  const threshold = nextThreshold || getNextLevelThreshold(xp);
  const progressPercent = Math.min(100, Math.round((xp / threshold) * 100));

  return (
    <div className="flex items-center gap-6 bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-sm transition-all hover:shadow-md">
      
      {/* Streak Indicator */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all ${streakDays > 0 ? "bg-orange-50 dark:bg-orange-500/10 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
          <Flame className={`h-5 w-5 ${streakDays > 0 ? "fill-orange-500 animate-pulse" : ""}`} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
            {streakDays}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Day Streak
          </span>
        </div>
      </div>

      <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />

      {/* XP Indicator */}
      <div className="flex items-center gap-3 flex-1 min-w-[200px]">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Zap className="h-5 w-5 fill-current" />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">
              {xp.toLocaleString()} XP
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider">
              NEXT: {threshold.toLocaleString()}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
