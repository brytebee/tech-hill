"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Zap,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Crown,
  Clock,
  Infinity as InfinityIcon,
} from "lucide-react";
import { toast } from "sonner";
import { grantSubscriptionOverride } from "@/app/actions/admin/subscription-actions";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  interval: "MONTHLY" | "YEARLY" | "LIFETIME";
}

interface GrantSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const DURATION_PRESETS = [
  { label: "1 Month", months: 1, icon: Clock },
  { label: "3 Months", months: 3, icon: Clock },
  { label: "6 Months", months: 6, icon: Clock },
  { label: "1 Year", months: 12, icon: Calendar },
];

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function GrantSubscriptionModal({
  isOpen,
  onClose,
  userId,
  userName,
}: GrantSubscriptionModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null); // months
  const [customEndDate, setCustomEndDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlan(null);
      setSelectedPreset(null);
      setCustomEndDate("");
      setSuccess(false);
      return;
    }
    setLoadingPlans(true);
    fetch("/api/admin/plans")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data.plans ?? []);
        if (data.plans?.length > 0) setSelectedPlan(data.plans[0]);
      })
      .catch(() => toast.error("Failed to load plans"))
      .finally(() => setLoadingPlans(false));
  }, [isOpen]);

  const isLifetime = selectedPlan?.interval === "LIFETIME";

  const resolvedEndDate = (): string | null => {
    if (isLifetime) return null;
    if (customEndDate) return new Date(customEndDate).toISOString();
    if (selectedPreset !== null) {
      return addMonths(new Date(), selectedPreset).toISOString();
    }
    return null;
  };

  const canSubmit =
    !!selectedPlan && (isLifetime || !!customEndDate || selectedPreset !== null);

  const handleGrant = () => {
    if (!selectedPlan) return;
    startTransition(async () => {
      try {
        await grantSubscriptionOverride(userId, selectedPlan.id, resolvedEndDate());
        setSuccess(true);
        toast.success(`Subscription granted to ${userName}!`);
        setTimeout(onClose, 1800);
      } catch (err: any) {
        toast.error(err.message || "Failed to grant subscription");
      }
    });
  };

  const intervalBadge = (interval: string) => {
    if (interval === "MONTHLY") return "Monthly";
    if (interval === "YEARLY") return "Annual";
    return "Lifetime";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-0 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />

        <div className="p-6 space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-scale-in">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Access Granted
              </h3>
              <p className="text-slate-500 text-sm">
                Subscription is now active for {userName}.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  <Crown className="h-5 w-5 text-indigo-500" />
                  Grant Subscription Override
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm">
                  Manually activate platform access for{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {userName}
                  </span>{" "}
                  — bypasses payment gateway.
                </DialogDescription>
              </DialogHeader>

              {/* 1. Plan Select */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Select Plan
                </span>
                {loadingPlans ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading plans…
                  </div>
                ) : plans.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                    No active plans found. Create a plan in Promotions first.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => {
                          setSelectedPlan(plan);
                          if (plan.interval === "LIFETIME") {
                            setSelectedPreset(null);
                            setCustomEndDate("");
                          }
                        }}
                        className={`w-full text-left flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                          selectedPlan?.id === plan.id
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                            : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                        }`}
                      >
                        <div>
                          <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                            {plan.name}
                          </p>
                          {plan.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {plan.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className="font-black text-[10px] uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none">
                            {intervalBadge(plan.interval)}
                          </Badge>
                          <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                            {Number(plan.price) === 0
                              ? "FREE"
                              : `₦${Number(plan.price).toLocaleString()}`}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Duration (hidden for LIFETIME) */}
              {selectedPlan && !isLifetime && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Duration
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {DURATION_PRESETS.map((preset) => (
                      <button
                        key={preset.months}
                        onClick={() => {
                          setSelectedPreset(preset.months);
                          setCustomEndDate("");
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                          selectedPreset === preset.months
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                            : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300 dark:hover:border-indigo-700"
                        }`}
                      >
                        <preset.icon className="h-4 w-4 mb-1" />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Or set a custom end date
                    </span>
                    <input
                      type="date"
                      value={customEndDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setCustomEndDate(e.target.value);
                        setSelectedPreset(null);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Lifetime indicator */}
              {isLifetime && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                  <InfinityIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                  <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                    Lifetime — access never expires
                  </p>
                </div>
              )}

              {/* Security note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Any existing active subscription for this user will be
                  cancelled first. This action is logged with your admin ID.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                  className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-xs border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGrant}
                  disabled={!canSubmit || isPending}
                  className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-1.5" />
                      Grant Access
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
