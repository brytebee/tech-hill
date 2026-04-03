"use client";

import { useState } from "react";
import { Check, Loader2, Zap, Star, Mail, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

const TRACKS = [
  {
    slug: "digital-literacy",
    label: "Digital Literacy",
    emoji: "💡",
    tagline: "For absolute beginners",
    color: "from-emerald-500 to-teal-600",
    border: "hover:border-emerald-500/60",
    glow: "shadow-emerald-500/10",
  },
  {
    slug: "frontend-engineering",
    label: "Frontend Engineering",
    emoji: "⚡",
    tagline: "HTML → React → Next.js",
    color: "from-blue-500 to-indigo-600",
    border: "hover:border-blue-500/60",
    glow: "shadow-blue-500/10",
    popular: true,
  },
  {
    slug: "professional-training",
    label: "Professional Training",
    emoji: "🏢",
    tagline: "Corporate & career skills",
    color: "from-violet-500 to-purple-700",
    border: "hover:border-violet-500/60",
    glow: "shadow-violet-500/10",
  },
];

export function PricingClient({ plans }: { plans: Plan[] }) {
  const [billing, setBilling] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [selectedTrack, setSelectedTrack] = useState("frontend-engineering");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Derive track plan and pro plan from the DB plans list
  const trackPlan = plans.find(
    (p) =>
      p.name.toLowerCase().includes(selectedTrack.replace("-", " ").split("-")[0]) &&
      p.interval === billing,
  ) ?? plans.filter((p) => p.interval === billing)[0];

  const proPlan = plans.find(
    (p) => p.name.toLowerCase().includes("pro") && p.interval === billing,
  ) ?? plans.filter((p) => p.interval === billing).at(-1);

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

  const activeTrack = TRACKS.find((t) => t.slug === selectedTrack)!;

  return (
    <div className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#080e1a]" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-5">
            Pick your track. Start building.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            No free trial — only real courses and live weekly coding sessions.
            Free courses are available inside without a subscription.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-14">
          <div className="relative flex rounded-full bg-slate-800/60 p-1.5 border border-slate-700/50 backdrop-blur-sm">
            {(["MONTHLY", "YEARLY"] as const).map((interval) => (
              <button
                key={interval}
                onClick={() => setBilling(interval)}
                className={`relative rounded-full px-7 py-2 text-sm font-semibold transition-all duration-300 ${
                  billing === interval
                    ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {interval === "MONTHLY" ? "Monthly" : "Annual"}
                {interval === "YEARLY" && (
                  <span className="ml-2 text-[10px] font-bold text-emerald-400">
                    SAVE 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Track Selector ── */}
        <div className="mb-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-5">
            Choose your track
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {TRACKS.map((t) => (
              <button
                key={t.slug}
                onClick={() => setSelectedTrack(t.slug)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  selectedTrack === t.slug
                    ? `bg-gradient-to-r ${t.color} text-white border-transparent shadow-lg`
                    : "bg-slate-800/60 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white"
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
                {t.popular && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-400">
                    <Star className="w-3 h-3 fill-yellow-400" /> HOT
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Pricing Cards ── */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 items-stretch">

          {/* ── Track Subscription Card ── */}
          {trackPlan ? (
            <PricingCard
              plan={trackPlan}
              label={`${activeTrack.emoji} ${activeTrack.label} Track`}
              tagline={activeTrack.tagline}
              billing={billing}
              isPopular={activeTrack.popular}
              gradient={activeTrack.color}
              loadingId={loadingId}
              onSubscribe={subscribe}
              highlights={[
                "All courses in this track",
                "Weekly live coding session",
                "Session recording (7 days)",
                "Track community access",
                "Progress tracking & certificates",
              ]}
            />
          ) : (
            <EmptyCard label="Track plan not available yet" />
          )}

          {/* ── Pro All-Access Card ── */}
          {proPlan ? (
            <PricingCard
              plan={proPlan}
              label="⚡ Pro All-Access"
              tagline="Every track. Every live session."
              billing={billing}
              isPro
              gradient="from-blue-600 to-indigo-700"
              loadingId={loadingId}
              onSubscribe={subscribe}
              highlights={[
                "All 3 tracks (+ future tracks)",
                "All weekly live sessions",
                "Full recording archive",
                "Priority community support",
                "All certificates included",
                "Early access to new tracks",
              ]}
            />
          ) : (
            <EmptyCard label="Pro plan not available yet" />
          )}

          {/* ── Enterprise / 1-on-1 Card ── */}
          <EnterpriseCard />
        </div>

        {/* ── Fee note ── */}
        <div className="mt-10 flex items-start justify-center gap-2 text-slate-500 text-xs max-w-xl mx-auto text-center">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-600" />
          <p>
            A Paystack processing fee (1.5% + ₦100, max ₦2,000) is added at checkout
            and is paid by the customer. Displayed prices are before processing fees.
          </p>
        </div>

        {/* ── FAQ Strip ── */}
        <div className="mt-20 border-t border-slate-800 pt-16 grid md:grid-cols-3 gap-10">
          {[
            {
              q: "Are courses permanently available?",
              a: "Access runs for the length of your active subscription. If you cancel, you lose access to premium content but can re-subscribe any time.",
            },
            {
              q: "How do free courses work?",
              a: "Some courses are offered as zero-price or promotional. These can be enrolled in without a subscription — no card required.",
            },
            {
              q: "What are the live sessions?",
              a: "Weekly, track-specific coding sessions streamed on YouTube. Recordings are available to subscribers for 7 days, then archived for Pro members.",
            },
          ].map((item) => (
            <div key={item.q}>
              <h3 className="text-sm font-semibold text-white mb-2">{item.q}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function PricingCard({
  plan,
  label,
  tagline,
  billing,
  highlights,
  isPopular,
  isPro,
  gradient,
  loadingId,
  onSubscribe,
}: {
  plan: Plan;
  label: string;
  tagline: string;
  billing: "MONTHLY" | "YEARLY";
  highlights: string[];
  isPopular?: boolean;
  isPro?: boolean;
  gradient: string;
  loadingId: string | null;
  onSubscribe: (plan: Plan) => void;
}) {
  const net = Number(plan.price);
  const { fee } = calcPaystackFee(net);

  const cardClass = isPro
    ? "relative bg-gradient-to-b from-blue-600 to-indigo-800 border-blue-500 text-white shadow-2xl shadow-blue-500/20 ring-2 ring-blue-400/30"
    : "relative bg-slate-900/80 border-slate-700/60 text-white shadow-xl hover:border-slate-600 transition-colors";

  return (
    <div className={`rounded-2xl border p-8 flex flex-col ${cardClass}`}>
      {isPopular && !isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 bg-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
            <Zap className="w-3 h-3" /> Popular
          </span>
        </div>
      )}
      {isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 bg-white text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
            <Star className="w-3 h-3 fill-blue-500 text-blue-500" /> Best Value
          </span>
        </div>
      )}

      <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {label}
      </div>
      <p className={`text-sm mb-6 ${isPro ? "text-blue-100" : "text-slate-400"}`}>{tagline}</p>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-extrabold">₦{net.toLocaleString()}</span>
          <span className={`text-sm font-medium ${isPro ? "text-blue-200" : "text-slate-400"}`}>
            /{billing === "MONTHLY" ? "mo" : "yr"}
          </span>
        </div>
        <p className={`text-xs mt-1.5 ${isPro ? "text-blue-200" : "text-slate-500"}`}>
          + ₦{fee.toLocaleString()} processing fee at checkout
        </p>
        {billing === "YEARLY" && (
          <p className="text-xs text-emerald-400 mt-1">≈ 20% saved vs monthly</p>
        )}
      </div>

      <Button
        onClick={() => onSubscribe(plan)}
        disabled={!!loadingId}
        className={`w-full h-11 font-semibold mb-8 ${
          isPro
            ? "bg-white text-blue-700 hover:bg-slate-50"
            : `bg-gradient-to-r ${gradient} text-white hover:opacity-90`
        }`}
      >
        {loadingId === plan.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>Get started <ChevronRight className="w-4 h-4 ml-1" /></>
        )}
      </Button>

      <ul className="space-y-3 flex-1">
        {highlights.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPro ? "text-blue-200" : "text-blue-400"}`} />
            <span className={isPro ? "text-blue-50" : "text-slate-300"}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EnterpriseCard() {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-8 flex flex-col justify-between hover:border-violet-500/40 transition-colors">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">
          🎯 1-on-1 Training
        </div>
        <p className="text-sm text-slate-400 mb-6">Focused, multi-session mentorship</p>

        <div className="mb-8">
          <div className="text-3xl font-extrabold text-white">Custom</div>
          <p className="text-xs text-slate-500 mt-1.5">Negotiated quote — reach out to discuss</p>
        </div>

        <ul className="space-y-3 mb-8">
          {[
            "Multiple sessions per week",
            "Dedicated mentor assigned",
            "Custom curriculum for your goals",
            "Code review & portfolio guidance",
            "Direct access to instructor",
            "Flexible scheduling",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-violet-400" />
              <span className="text-slate-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <a href="mailto:hello@techhill.io?subject=1-on-1 Training Enquiry">
        <Button
          variant="outline"
          className="w-full border-violet-500/50 text-violet-300 hover:bg-violet-900/30 hover:text-violet-100 hover:border-violet-400 transition-colors"
        >
          <Mail className="w-4 h-4 mr-2" />
          Get a Quote
        </Button>
      </a>
    </div>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/20 p-8 flex items-center justify-center">
      <p className="text-slate-500 text-sm text-center">{label}</p>
    </div>
  );
}
