"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Tag, ShieldCheck, Info, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Paystack fee calculator passthrough (mirrors backend logic)
function calcPaystackFee(netAmount: number): { grossAmount: number; fee: number } {
  const RATE = 0.015;
  const FLAT = 100;
  const MAX_FEE = 2000;
  const rawGross = (netAmount + FLAT) / (1 - RATE);
  const rawFee = rawGross - netAmount;
  if (rawFee >= MAX_FEE) return { grossAmount: netAmount + MAX_FEE, fee: MAX_FEE };
  const fee = Math.ceil(rawFee);
  return { grossAmount: netAmount + fee, fee };
}

interface Plan {
  id: string;
  name: string;
  price: string | number;
  interval: "MONTHLY" | "YEARLY";
  features: string[];
}

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: {
    id: string;
    title: string;
    plans: Plan[];
  };
  allAccessPlans: Plan[];
}

export function SubscriptionCheckoutModal({
  isOpen,
  onClose,
  track,
  allAccessPlans,
}: SubscriptionCheckoutModalProps) {
  const hasTrackPlans = track && track.plans && track.plans.length > 0;
  const [tier, setTier] = useState<"track" | "all-access">(hasTrackPlans ? "track" : "all-access");
  const [interval, setInterval] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Filter plans based on tier and interval selection
  const availablePlans = tier === "track" ? track.plans : allAccessPlans;
  const selectedPlan = availablePlans.find((p) => p.interval === interval) || availablePlans[0];

  const basePrice = selectedPlan ? Number(selectedPlan.price) : 0;
  const netPrice = Math.max(0, basePrice - discount);
  const { grossAmount, fee } = calcPaystackFee(netPrice);
  const isFree = netPrice <= 0;

  // Reset coupon state when selected plan changes
  useEffect(() => {
    setCouponCode("");
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponError(null);
  }, [tier, interval]);

  // Reset overall state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInterval("MONTHLY");
      setCouponCode("");
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponError(null);
    } else {
      const currentHasTrackPlans = track && track.plans && track.plans.length > 0;
      setTier(currentHasTrackPlans ? "track" : "all-access");
    }
  }, [isOpen, track]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), planId: selectedPlan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid coupon code");

      let discountAmount = 0;
      if (data.coupon.discountType === "PERCENTAGE") {
        discountAmount = (basePrice * Number(data.coupon.discountValue)) / 100;
        if (data.coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, Number(data.coupon.maxDiscountAmount));
        }
      } else {
        discountAmount = Number(data.coupon.discountValue);
      }

      setDiscount(discountAmount);
      setAppliedCoupon(couponCode.trim());
      toast.success("Coupon applied!");
    } catch (err: any) {
      setCouponError(err.message);
      setDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          couponCode: appliedCoupon || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize subscription checkout");

      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  if (!selectedPlan) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900/95 dark:backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-0 rounded-3xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Unlock Career Path
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
              Choose your access tier to enroll in the <span className="font-extrabold text-slate-900 dark:text-white uppercase">{track.title}</span> mastery sequence.
            </DialogDescription>
          </DialogHeader>

          {/* Access Tiers Toggle */}
          {hasTrackPlans && (
            <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
              <button
                onClick={() => setTier("track")}
                className={`py-2 px-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  tier === "track"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Path Only
              </button>
              <button
                onClick={() => setTier("all-access")}
                className={`py-2 px-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  tier === "all-access"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Pro All-Access
              </button>
            </div>
          )}

          {/* Billing Frequency Toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setInterval("MONTHLY")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                interval === "MONTHLY"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setInterval("YEARLY")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 ${
                interval === "YEARLY"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              Annually (Save 20%)
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black px-1 rounded-sm uppercase tracking-tighter">
                Best Value
              </span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Price Breakdown */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-inner">
              <div className="p-4 space-y-2.5 text-sm">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 font-medium">
                  <span>Subscription Type</span>
                  <span className="text-slate-800 dark:text-slate-200 font-extrabold uppercase text-[10px] tracking-widest bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {tier === "track" ? "Target Path" : "All-Access"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
                  <span>Tier Rate</span>
                  <span>₦{basePrice.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-extrabold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Coupon discount
                    </span>
                    <span>– ₦{discount.toLocaleString()}</span>
                  </div>
                )}

                {!isFree && (
                  <div className="flex justify-between text-slate-400 dark:text-slate-500 text-xs border-t border-slate-200/50 dark:border-slate-850 pt-2.5 mt-1">
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Paystack processing fee
                    </span>
                    <span>₦{fee.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="px-4 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex justify-between items-center">
                <span className="font-extrabold text-slate-955 dark:text-white uppercase text-xs tracking-wider">Total charged</span>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                    {isFree ? "FREE" : `₦${grossAmount.toLocaleString()}`}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    /{interval === "MONTHLY" ? "month" : "year"}
                  </span>
                </div>
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Features Included:</span>
              <div className="grid grid-cols-1 gap-2 p-1.5">
                {selectedPlan.features.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupons */}
            {!appliedCoupon ? (
              <div className="space-y-1.5">
                <Label htmlFor="coupon" className="text-[10px] font-black uppercase tracking-widest text-slate-450">
                  Have a coupon?
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    placeholder="Enter discount code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono text-sm h-10 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    className="whitespace-nowrap border-slate-200 dark:border-slate-800 rounded-xl h-10"
                  >
                    {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs font-medium text-rose-500 mt-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {couponError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 dark:border-emerald-900/30 text-xs">
                <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider">
                  <Tag className="w-4 h-4 shrink-0" />
                  {appliedCoupon} applied (save ₦{discount.toLocaleString()})
                </span>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 underline font-semibold"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/40 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 text-xs leading-relaxed">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                Secured via Paystack. Subscriptions renew automatically. Cancel anytime.
              </p>
            </div>
          </div>

          {/* Checkout Action Buttons */}
          <div className="flex flex-col gap-2.5 mt-8">
            <Button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full h-12 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/10 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all rounded-2xl"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isFree ? (
                "Enroll for Free →"
              ) : (
                `Pay ₦${grossAmount.toLocaleString()} →`
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold uppercase tracking-widest"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
