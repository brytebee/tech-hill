import { TrackService } from "@/lib/services/trackService";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Lock,
  Map,
  Rocket,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  INTERMEDIATE: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  ADVANCED: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default async function CareerPathDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const track = await TrackService.getTrackBySlug(slug);

  if (!track) notFound();

  const totalHours = track.courses.reduce(
    (sum: number, tc: any) => sum + (tc.course.duration || 0),
    0
  );
  const isPaid = Number(track.price) > 0;

  return (
    <div className="dark min-h-screen bg-[#080e1a] text-white antialiased selection:bg-blue-500/30 overflow-hidden relative">
      {/* Ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vh] bg-indigo-900/10 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <PublicHeader />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-10">
          <Link href="/career-paths" className="hover:text-blue-400 transition-colors">
            Career Paths
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-300 font-medium">{track.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* ── Left Column: Content ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">
            {/* Hero */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-5">
                <Map className="w-3.5 h-3.5" /> Career Path
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                {track.title}
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-6">
                {track.description ||
                  "A fully sequenced, project-gated learning path engineered to take you from zero to career-ready in record time."}
              </p>

              {/* Meta Chips */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-sm font-bold text-slate-300">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  {track.courses.length} Courses
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-sm font-bold text-slate-300">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  {totalHours}h Total
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-sm font-bold text-slate-300">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Certificate Included
                </div>
              </div>
            </div>

            {/* ── Course Roadmap ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">
                Your Roadmap
              </h2>

              <div className="relative">
                {/* Connecting vertical line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500/60 via-indigo-500/40 to-purple-500/20 rounded-full" />

                <div className="space-y-4">
                  {track.courses.map((tc: any, idx: number) => {
                    const course = tc.course;
                    const isLast = idx === track.courses.length - 1;

                    return (
                      <div key={tc.id} className="relative flex gap-5 items-start group">
                        {/* Step Node */}
                        <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center font-black text-sm transition-all duration-300 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 group-hover:text-blue-400 text-slate-400">
                          {String(idx + 1).padStart(2, "0")}
                        </div>

                        {/* Course Card */}
                        <div className="flex-1 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-5 transition-all duration-300 group-hover:bg-slate-900/80 group-hover:border-slate-700/80 group-hover:-translate-y-0.5">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1">
                              <div className="flex items-center flex-wrap gap-2 mb-2">
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                                    DIFFICULTY_COLORS[course.difficulty] ??
                                    DIFFICULTY_COLORS.BEGINNER
                                  }`}
                                >
                                  {course.difficulty}
                                </span>
                                {isLast && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest text-purple-400 bg-purple-500/10 border-purple-500/20">
                                    Capstone
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-black text-white mb-1 group-hover:text-blue-300 transition-colors">
                                {course.title}
                              </h3>
                              <p className="text-slate-400 text-sm line-clamp-2">
                                {course.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {course.duration}h
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Finish Line */}
                  <div className="relative flex gap-5 items-center">
                    <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-2xl border border-amber-500/20 p-5">
                      <h3 className="font-black text-amber-300 uppercase text-sm tracking-widest mb-1">
                        Career Ready
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Receive your verified Tech Hill certificate and unlock career resources.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Sticky Enroll Card ─────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-800/80 p-6 shadow-2xl shadow-blue-500/5">
                {/* Price */}
                <div className="mb-6 pb-6 border-b border-slate-800/60">
                  {isPaid ? (
                    <>
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                        Full Path Investment
                      </div>
                      <div className="text-4xl font-black text-white">
                        ₦{Number(track.price).toLocaleString()}
                      </div>
                      <p className="text-sm text-slate-400 mt-2">
                        Or unlock with an active subscription.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                        Full Path Investment
                      </div>
                      <div className="text-4xl font-black text-emerald-400">FREE</div>
                      <p className="text-sm text-slate-400 mt-2">No payment required.</p>
                    </>
                  )}
                </div>

                {/* What you get */}
                <ul className="space-y-3 mb-6">
                  {[
                    `${track.courses.length} sequenced courses`,
                    `${totalHours}+ hours of content`,
                    "Project-gated progression",
                    "Expert quiz checkpoints",
                    "Verified completion certificate",
                    "Focus-locked learning system",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Enroll CTA */}
                <Link href="/register">
                  <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest rounded-xl text-sm border-0 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all">
                    <Zap className="w-4 h-4 mr-2 fill-white" /> Start This Path
                  </Button>
                </Link>

                <p className="text-center text-xs text-slate-600 mt-4 font-medium">
                  One active path at a time. Commit and grow.
                </p>
              </div>

              {/* Focus Lock Callout */}
              <div className="flex gap-3 p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-black text-amber-400">Focus System:</span> Tech Hill allows only one active
                  course or career path at a time. This builds real commitment and dramatically
                  improves completion rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-10 bg-slate-950/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Tech Hill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
