"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Zap,
  XCircle,
  Shield,
  CalendarClock,
  Infinity as InfinityIcon,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { GrantSubscriptionModal } from "@/components/admin/GrantSubscriptionModal";
import { revokeSubscription } from "@/app/actions/admin/subscription-actions";

interface ActiveSubscription {
  id: string;
  plan: { name: string; features: string[] };
  status: string;
  startDate: string | null;
  endDate: string | null;
  provider: string;
}

interface Props {
  userId: string;
  userName: string;
  activeSubscription: ActiveSubscription | null;
}

export function SubscriptionControls({ userId, userName, activeSubscription }: Props) {
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isManual = activeSubscription?.provider === "MANUAL_OVERRIDE";
  const isActive = activeSubscription?.status === "ACTIVE";
  const isExpired =
    activeSubscription?.endDate &&
    new Date(activeSubscription.endDate) < new Date();

  const handleRevoke = () => {
    if (!activeSubscription) return;
    startTransition(async () => {
      try {
        await revokeSubscription(activeSubscription.id, userId);
        toast.success("Subscription revoked successfully.");
      } catch (err: any) {
        toast.error(err.message || "Failed to revoke subscription.");
      }
    });
  };

  return (
    <>
      <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Access Control
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Subscription status and administrative override
              </CardDescription>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Crown className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {activeSubscription && isActive && !isExpired ? (
            <div className="space-y-5">
              {/* Active subscription details */}
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/60 dark:bg-emerald-950/20">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {activeSubscription.plan.name}
                    </span>
                    <Badge className="bg-emerald-500 text-white font-black text-[8px] uppercase tracking-widest px-1.5 py-0 border-none">
                      ACTIVE
                    </Badge>
                    {isManual && (
                      <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-[8px] uppercase tracking-widest px-1.5 py-0 border border-indigo-200 dark:border-indigo-800">
                        MANUAL
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-wrap text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {activeSubscription.startDate && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        Started:{" "}
                        {new Date(activeSubscription.startDate).toLocaleDateString()}
                      </span>
                    )}
                    {activeSubscription.endDate ? (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3 text-amber-400" />
                        Expires:{" "}
                        {new Date(activeSubscription.endDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-indigo-400">
                        <InfinityIcon className="h-3 w-3" />
                        LIFETIME — Never Expires
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowGrantModal(true)}
                  className="h-11 rounded-xl font-black uppercase tracking-widest text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                >
                  <Zap className="h-4 w-4 mr-1.5" />
                  Override
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRevoke}
                  disabled={isPending}
                  className="h-11 rounded-xl font-black uppercase tracking-widest text-xs border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Revoke
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* No active subscription state */}
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/30">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    No Active Subscription
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeSubscription
                      ? `Last status: ${activeSubscription.status}`
                      : "This user has never subscribed to a plan."}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowGrantModal(true)}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all"
              >
                <Crown className="h-4 w-4 mr-2" />
                Grant Subscription Override
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <GrantSubscriptionModal
        isOpen={showGrantModal}
        onClose={() => setShowGrantModal(false)}
        userId={userId}
        userName={userName}
      />
    </>
  );
}
