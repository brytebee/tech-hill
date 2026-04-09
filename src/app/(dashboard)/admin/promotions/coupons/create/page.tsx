// app/(dashboard)/admin/promotions/coupons/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Tag, Ticket } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateCouponPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxUses: "",
    expiresAt: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    maxUsesPerUser: "1",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) {
      toast.error("Code and discount value are required.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/promotions/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          discountValue: parseFloat(form.discountValue),
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          maxUsesPerUser: parseInt(form.maxUsesPerUser),
          minPurchaseAmount: form.minPurchaseAmount ? parseFloat(form.minPurchaseAmount) : null,
          maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
          expiresAt: form.expiresAt || null,
        }),
      });

      if (res.ok) {
        toast.success("Coupon created successfully.");
        router.push("/admin/promotions");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create coupon.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="New Coupon" description="Create a new discount coupon code">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/promotions">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Promotions
            </Button>
          </Link>
        </div>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Ticket className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-black">New Token</CardTitle>
                <CardDescription>Discount code for students to redeem</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="code" className="font-bold uppercase text-xs tracking-wider text-slate-500">Coupon Code *</Label>
                  <Input id="code" name="code" placeholder="e.g. LAUNCH50" value={form.code} onChange={handleChange} className="font-mono uppercase" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType" className="font-bold uppercase text-xs tracking-wider text-slate-500">Discount Type *</Label>
                  <select id="discountType" name="discountType" value={form.discountType} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-sm">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₦)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="discountValue" className="font-bold uppercase text-xs tracking-wider text-slate-500">Discount Value *</Label>
                  <Input id="discountValue" name="discountValue" type="number" min="0" placeholder={form.discountType === "PERCENTAGE" ? "e.g. 25" : "e.g. 5000"} value={form.discountValue} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses" className="font-bold uppercase text-xs tracking-wider text-slate-500">Max Total Uses</Label>
                  <Input id="maxUses" name="maxUses" type="number" min="1" placeholder="Leave blank for unlimited" value={form.maxUses} onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxUsesPerUser" className="font-bold uppercase text-xs tracking-wider text-slate-500">Max Uses Per Student</Label>
                  <Input id="maxUsesPerUser" name="maxUsesPerUser" type="number" min="1" value={form.maxUsesPerUser} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt" className="font-bold uppercase text-xs tracking-wider text-slate-500">Expiry Date</Label>
                  <Input id="expiresAt" name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={handleChange} />
                </div>
              </div>

              {form.discountType === "PERCENTAGE" && (
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountAmount" className="font-bold uppercase text-xs tracking-wider text-slate-500">Max Discount Cap (₦)</Label>
                  <Input id="maxDiscountAmount" name="maxDiscountAmount" type="number" min="0" placeholder="Leave blank for no cap" value={form.maxDiscountAmount} onChange={handleChange} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold uppercase text-xs tracking-wider text-slate-500">Internal Description</Label>
                <Input id="description" name="description" placeholder="e.g. Launch week promo — 50% off" value={form.description} onChange={handleChange} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href="/admin/promotions">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8">
                  <Tag className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Coupon"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
