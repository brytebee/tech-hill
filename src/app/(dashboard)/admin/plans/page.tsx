"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Edit, Trash, Settings, MoreVertical } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  isActive: boolean;
  features: string[];
  paystackPlanCode: string;
  _count: {
    subscriptions: number;
  }
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<Plan>>({ features: [] });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // The route returns { plans: [] } due to override modal compatibility
      const response = await fetch("/api/admin/plans");
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      toast.error("Failed to fetch plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!currentPlan.name || currentPlan.price === undefined) {
        toast.error("Name and price are required");
        return;
      }

      const url = currentPlan.id ? `/api/admin/plans/${currentPlan.id}` : "/api/admin/plans";
      const method = currentPlan.id ? "PUT" : "POST";

      const payload = {
        name: currentPlan.name,
        description: currentPlan.description,
        price: Number(currentPlan.price),
        currency: "NGN",
        interval: currentPlan.interval || "MONTHLY",
        features: Array.isArray(currentPlan.features) && currentPlan.features.length > 0 
          ? currentPlan.features 
          : ["Standard Feature"],
        paystackPlanCode: currentPlan.paystackPlanCode || null,
        isActive: currentPlan.isActive !== false,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save plan");
      
      toast.success(`Plan ${currentPlan.id ? "updated" : "created"} successfully`);
      setIsEditing(false);
      fetchPlans();
    } catch (err) {
      toast.error("Failed to save plan. Check console.");
      console.error(err);
    }
  };

  const handleDisable = async (id: string) => {
    if (!confirm("Are you sure you want to disable this plan? Active subscriptions will remain, but new ones cannot be created.")) return;
    try {
      await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
      toast.success("Plan disabled");
      fetchPlans();
    } catch (err) {
      toast.error("Failed to disable plan");
    }
  };

  const openEditor = (plan?: Plan) => {
    if (plan) {
      setCurrentPlan({ ...plan });
    } else {
      setCurrentPlan({ features: [""], interval: "MONTHLY", isActive: true });
    }
    setIsEditing(true);
  };

  return (
    <AdminLayout
      title="Subscription Plans"
      description="Manage the pricing tiers and feature sets for your pay-as-you-go career paths."
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div>
             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Tiers</h2>
             <p className="text-slate-500 text-sm font-bold">{plans.length} configured plans</p>
           </div>
           <Button onClick={() => openEditor()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 h-11 shadow-lg shadow-blue-500/20">
             <Plus className="mr-2 h-5 w-5" /> Create Plan
           </Button>
        </div>

        {isEditing && (
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl mb-8">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-xl">
              <CardTitle>{currentPlan.id ? "Edit Plan" : "Create New Plan"}</CardTitle>
              <CardDescription>Configure pricing and features</CardDescription>
            </CardHeader>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input value={currentPlan.name || ""} onChange={e => setCurrentPlan({...currentPlan, name: e.target.value})} placeholder="e.g. Pro Monthly" />
              </div>
              <div className="space-y-2">
                <Label>Price (NGN)</Label>
                <Input type="number" value={currentPlan.price || ""} onChange={e => setCurrentPlan({...currentPlan, price: Number(e.target.value)})} placeholder="e.g. 5000" />
              </div>
              <div className="space-y-2">
                <Label>Billing Interval</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:focus:ring-slate-800 dark:focus:ring-offset-slate-900" 
                  value={currentPlan.interval || "MONTHLY"}
                  onChange={e => setCurrentPlan({...currentPlan, interval: e.target.value})}
                >
                   <option value="MONTHLY">Monthly</option>
                   <option value="YEARLY">Yearly</option>
                   <option value="LIFETIME">Lifetime / One-off</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Paystack Plan Code (Optional)</Label>
                <Input value={currentPlan.paystackPlanCode || ""} onChange={e => setCurrentPlan({...currentPlan, paystackPlanCode: e.target.value})} placeholder="PLN_xxxxx" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={currentPlan.description || ""} onChange={e => setCurrentPlan({...currentPlan, description: e.target.value})} placeholder="Brief description for sales page" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Features (One per line)</Label>
                <Textarea 
                  rows={4}
                  value={currentPlan.features?.join("\n") || ""} 
                  onChange={e => setCurrentPlan({...currentPlan, features: e.target.value.split("\n").filter(f => f.trim().length > 0)})} 
                  placeholder="Access to all courses\nPremium support" 
                />
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                 <input type="checkbox" id="isActive" checked={currentPlan.isActive !== false} onChange={e => setCurrentPlan({...currentPlan, isActive: e.target.checked})} className="rounded border-slate-300" />
                 <Label htmlFor="isActive">Make active and visible strictly on checkout overrides and sales pages</Label>
              </div>
            </div>
            <CardFooter className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-xl flex justify-end gap-3">
               <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
               <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save Plan Configuration</Button>
            </CardFooter>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="border-slate-200 dark:border-slate-800 flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={plan.isActive ? "default" : "secondary"} className={plan.isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "text-slate-500"}>
                      {plan.isActive ? "ACTIVE" : "DISABLED"}
                    </Badge>
                    <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900">{plan.interval}</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold uppercase tracking-tight">{plan.name}</CardTitle>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                    ₦{plan.price.toLocaleString()}
                  </div>
                </CardHeader>
                <div className="px-6 py-2 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800 flex-1">
                   <p className="text-sm text-slate-500 font-medium mb-3">{plan.description}</p>
                   <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                     {plan.features?.slice(0, 3).map((f, i) => (
                       <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{f}</span>
                       </li>
                     ))}
                     {(plan.features?.length > 3) && <li className="text-slate-400 italic">+{plan.features.length - 3} more features</li>}
                   </ul>
                   <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                     <CreditCard className="h-3.5 w-3.5 mr-1" />
                     {plan._count?.subscriptions || 0} Built-in Subscribers
                   </div>
                </div>
                <CardFooter className="p-4 flex gap-2">
                  <Button variant="outline" className="flex-1 text-sm font-bold h-9" onClick={() => openEditor(plan)}>
                    <Edit className="h-3 w-3 mr-2" /> Modify
                  </Button>
                  <Button variant="destructive" className="h-9 w-9 p-0" title="Disable Plan" onClick={() => handleDisable(plan.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
