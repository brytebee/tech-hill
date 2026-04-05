"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Loader2, CreditCard, Tag, ShieldCheck, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Mirrors PaystackService.calculateFeePassthrough — kept client-side for live preview
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

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  price: number;
}

export function CheckoutModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  price,
}: CheckoutModalProps) {
  const [couponCode, setCouponCode]         = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon]   = useState<string | null>(null);
  const [discount, setDiscount]             = useState(0);
  const [isLoading, setIsLoading]           = useState(false);
  const [couponError, setCouponError]       = useState<string | null>(null);

  const netPrice                            = Math.max(0, price - discount);
  const { grossAmount, fee }                = calcPaystackFee(netPrice);
  const isFree                              = netPrice <= 0;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCouponCode("");
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponError(null);
    }
  }, [isOpen]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid coupon code");

      let discountAmount = 0;
      if (data.coupon.discountType === "PERCENTAGE") {
        discountAmount = (price * Number(data.coupon.discountValue)) / 100;
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
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          couponCode: appliedCoupon || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize checkout");

      if (data.free) {
        toast.success("Enrolled successfully!");
        onClose();
        window.location.href = `/student/courses/${courseId}`;
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch (err: any) {
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] bg-white dark:bg-slate-900/90 dark:backdrop-blur-2xl border border-slate-200 dark:border-slate-700/50 shadow-2xl overflow-hidden p-0">

        {/* Top colour band */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />

        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Complete Purchase
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
              You're enrolling in <span className="font-semibold text-slate-700 dark:text-slate-200">{courseTitle}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">

            {/* ── Price Breakdown ── */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 overflow-hidden">
              <div className="px-4 py-3 space-y-2 text-sm">
                {/* Base price */}
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Course price</span>
                  <span>₦{price.toLocaleString()}</span>
                </div>

                {/* Discount */}
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Coupon discount
                    </span>
                    <span>– ₦{discount.toLocaleString()}</span>
                  </div>
                )}

                {/* Processing fee — only shown if not free */}
                {!isFree && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs border-t border-slate-200 dark:border-slate-700 pt-2 mt-1">
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Processing fee (Paystack 1.5% + ₦100)
                    </span>
                    <span>₦{fee.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 flex justify-between items-center">
                <span className="font-semibold text-slate-900 dark:text-white">Total charged</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {isFree ? "FREE" : `₦${grossAmount.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* ── Coupon ── */}
            {!appliedCoupon ? (
              <div className="space-y-1.5">
                <Label htmlFor="coupon" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Have a coupon?
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    className="whitespace-nowrap border-slate-200 dark:border-slate-700"
                  >
                    {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs font-medium text-rose-500 mt-1.5 flex items-center gap-1.5 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {couponError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm">
                <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <Tag className="w-4 h-4" />
                  {appliedCoupon} applied — saving ₦{discount.toLocaleString()}
                </span>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs underline"
                >
                  Remove
                </button>
              </div>
            )}

            {/* ── Security note ── */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 text-xs leading-relaxed">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                Secured by Paystack. The processing fee covers their payment infrastructure and is non-refundable.
              </p>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col gap-2.5 mt-6">
            <Button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
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
              className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
