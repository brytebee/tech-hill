"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lock, Award } from "lucide-react";
import * as Icons from "lucide-react";

interface BadgeRecord {
  badge: {
    id: string;
    title: string;
    description: string;
    icon: string;
  };
  earnedAt: string | Date;
}

interface IdentityBadgeShowcaseProps {
  userBadges: BadgeRecord[];
}

export function IdentityBadgeShowcase({ userBadges }: IdentityBadgeShowcaseProps) {
  // We can render Dynamic Icons if needed
  const getIcon = (iconName: string, className: string) => {
    // @ts-ignore
    const IconCmp = Icons[iconName] || Icons.Award;
    return <IconCmp className={className} />;
  };

  if (!userBadges || userBadges.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 rounded-[2rem] overflow-hidden">
        <CardHeader className="pb-2 p-6 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Identity Badges
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Your earned credentials
              </CardDescription>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          </div>
          <h4 className="font-bold text-slate-400 mb-2 uppercase tracking-widest text-sm">No Badges Yet</h4>
          <p className="text-xs text-slate-500">Complete topics and courses to acquire XP and unlock identity badges.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 rounded-[2rem] overflow-hidden">
      <CardHeader className="pb-2 p-6 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Identity Badges
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Your earned credentials
            </CardDescription>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userBadges.map((record) => (
            <div 
              key={record.badge.id} 
              className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-all hover:-translate-y-1 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-700 group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-3 shadow-inner group-hover:shadow-amber-500/20 transition-all">
                {getIcon(record.badge.icon, "w-8 h-8 text-amber-600 dark:text-amber-400 drop-shadow-sm")}
              </div>
              <h5 className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-tight mb-1 leading-tight h-8 flex items-center justify-center">
                {record.badge.title}
              </h5>
              <p className="text-[9px] text-slate-500 font-medium line-clamp-2 px-1">
                {record.badge.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
