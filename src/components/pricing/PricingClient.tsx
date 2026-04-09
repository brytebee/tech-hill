"use client";

import { useState } from "react";
import { Check, Loader2, Zap, Star, Mail, ChevronRight, Info, BookOpen, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

// Mirror server-side fee calculator for live display
function calcPaystackFee(net: number) {
  const raw = (net + 100) / (1 - 0.015);
  const fee = Math.min(2000, Math.ceil(raw - net));
  return { gross: net + fee, fee };
}

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: string;   // serialized Decimal
  interval: "MONTHLY" | "YEARLY" | "LIFETIME";
  features: string[];
}

export function PricingClient({ plans }: { plans: Plan[] }) {
  const [billing, setBilling] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Find the primary subscription plan for the current interval
  const proPlan = plans.find(
    (p) => (p.name.toLowerCase().includes("pro") || p.name.toLowerCase().includes("all access")) && p.interval === billing
  ) || plans.find(p => p.interval === billing);

  const subscribe = async (plan: Plan) => {
    setLoadingId(plan.id);
    try {
      const res = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message);
      setLoadingId(null);
    }
  };

  return (
    <div className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#080e1a]" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">Investment Tiers</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-5">
            Your Future, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Priced for Impact.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Choose the level of commitment that fits your goals. From individual mastery to all-access career transformation.
          </p>
        </div>

        {/* Billing Toggle (Only affects the Pro Card) */}
        <div className="flex justify-center mb-16">
          <div className="relative flex rounded-full bg-slate-800/60 p-1.5 border border-slate-700/50 backdrop-blur-sm shadow-xl">
            {(["MONTHLY", "YEARLY"] as const).map((interval) => (
              <button
                key={interval}
                onClick={() => setBilling(interval)}
                className={`relative rounded-full px-8 py-2.5 text-sm font-bold transition-all duration-300 ${
                  billing === interval
                    ? "bg-white text-blue-700 shadow-lg scale-105"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {interval === "MONTHLY" ? "Monthly" : "Annually"}
                {interval === "YEARLY" && (
                  <span className="ml-2 py-0.5 px-2 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full border border-emerald-500/30">
                    SAVE 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3-Tier Pricing Model ── */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Tier 1: A La Carte */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 flex flex-col hover:border-slate-700 transition-all duration-300 group">
            <div className="mb-8">
              <h3 className="text-slate-400 text-sm font-black uppercase tracking-widest mb-2">Standalone Mastery</h3>
              <div className="text-3xl font-black text-white mb-2">Pay-As-You-Go</div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Purchase specific courses or career paths individually for lifetime access.
              </p>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Lifetime access to content",
                "Self-paced learning",
                "Digital certificates",
                "Community forum access",
                "No recurring billing"
              ].map(feat => (
                <li key={feat} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <Button variant="outline" className="w-full h-12 font-bold border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white group-hover:border-slate-500 transition-all" asChild>
              <Link href="/courses">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Catalog
              </Link>
            </Button>
          </div>

          {/* Tier 2: The Pro All-Access (Centerpiece) */}
          <div className="relative rounded-3xl border-2 border-blue-500/50 bg-[#0a1222] p-8 flex flex-col shadow-2xl shadow-blue-500/10 ring-4 ring-blue-500/5 py-10 lg:-mt-4 lg:mb-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider ring-4 ring-[#080e1a]">
                <Zap className="w-3.5 h-3.5 fill-white" /> Recommended
              </span>
            </div>

            <div className="mb-8">
              <h3 className="text-blue-400 text-sm font-black uppercase tracking-widest mb-2">Tech Hill Pro</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-white tracking-tighter">
                  ₦{proPlan ? Number(proPlan.price).toLocaleString() : "..."}
                </span>
                <span className="text-slate-400 font-bold">
                  /{billing === "MONTHLY" ? "mo" : "yr"}
                </span>
              </div>
              <p className="text-blue-100/70 text-sm leading-relaxed">
                Full access to every track, every course, and all live sessions.
              </p>
              
              {proPlan && calcPaystackFee(Number(proPlan.price)).fee > 0 && (
                <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  + ₦{calcPaystackFee(Number(proPlan.price)).fee.toLocaleString()} Paystack processing fee
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {(proPlan?.features || [
                "Unlocks ALL Career Paths",
                "All Individual Courses included",
                "Weekly Live Coding Sessions",
                "Access to Class Archives",
                "Priority Mentor Support",
                "Exclusive Discord Server"
              ]).map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white">
                  <Check className="w-5 h-5 mt-0.5 text-blue-400 shrink-0 bg-blue-500/10 rounded-full p-1" />
                  <span className="font-medium text-slate-200">{feat}</span>
                </li>
              ))}
            </ul>

            <Button 
              onClick={() => proPlan && subscribe(proPlan)}
              disabled={!!loadingId}
              className="w-full h-14 font-black text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loadingId === proPlan?.id ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>Get Pro Access <ChevronRight className="w-5 h-5 ml-1" /></>
              )}
            </Button>
          </div>

          {/* Tier 3: Mentorship / Enterprise */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 flex flex-col hover:border-violet-500/30 transition-all duration-300">
            <div className="mb-8">
              <h3 className="text-violet-400 text-sm font-black uppercase tracking-widest mb-2">Elite Track</h3>
              <div className="text-3xl font-black text-white mb-2">1-on-1 Mentorship</div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Dedicated coaching and tailored roadmaps for professionals and corporate teams.
              </p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Personalized learning roadmap",
                "3x weekly private sessions",
                "Direct WhatsApp with instructor",
                "Portfolio & CV architecture",
                "Job interview mock trials",
                "Corporate team training"
              ].map(feat => (
                <li key={feat} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 mt-0.5 text-violet-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <Button variant="outline" className="w-full h-12 font-bold border-violet-900/50 text-violet-300 hover:bg-violet-900/20 hover:text-white transition-all" asChild>
              <a href="mailto:hello@techhill.io?subject=Mentorship Enquiry">
                <Mail className="w-4 h-4 mr-2" />
                Get a Quote
              </a>
            </Button>
          </div>
        </div>

        {/* ── Trust Indicators / FAQ Strip ── */}
        <div className="mt-24 space-y-16">
          <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Add payment logos here if available in assets */}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 border-t border-slate-800/50 pt-16 px-4">
            <div>
              <h4 className="flex items-center gap-2 text-white font-bold mb-4">
                <UserCheck className="w-5 h-5 text-emerald-400" /> Professional Grade
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Our curriculum isn't aggregate content. It's built by engineers working in the industry, designed to take you from hello world to production.
              </p>
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-white font-bold mb-4">
                <Star className="w-5 h-5 text-yellow-400" /> Live Feedback
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Unlike static MOOCs, Tech Hill subscribers get weekly face-time during live sessions to debug code and ask complex architectural questions.
              </p>
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-white font-bold mb-4">
                <Zap className="w-5 h-5 text-blue-400" /> Fast Integration
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                We focus on the tools that matter: Next.js, TypeScript, PostgreSQL, and AI-driven development workflows. No fluff, just the stack that pays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
