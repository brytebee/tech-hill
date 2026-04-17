import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Award,
  Zap,
  Code2,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Play,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Globe2,
} from "lucide-react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { CourseService } from "@/lib/services/courseService";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tech Hill — The Future of African Tech Education",
  description:
    "Join 10,000+ Nigerians building world-class tech careers. Project-based courses in web development, data, and digital skills. Start free.",
};

// ── Stat pill ──────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-3xl font-extrabold text-white tracking-tight">
        {value}
      </span>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

// ── Feature card ───────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative p-px rounded-2xl overflow-hidden bg-gradient-to-b from-slate-700/40 to-transparent hover:from-blue-500/30 transition-all duration-500">
      <div className="relative bg-slate-900/90 rounded-2xl p-7 h-full">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${gradient}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Social proof avatar stack ──────────────────────────────────────────────
function AvatarStack() {
  const colors = [
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-pink-500",
    "bg-emerald-500",
  ];
  return (
    <div className="flex -space-x-3">
      {colors.map((color, i) => (
        <div
          key={i}
          className={`w-8 h-8 rounded-full ${color} border-2 border-slate-950 flex items-center justify-center text-xs text-white font-bold`}
        >
          {String.fromCharCode(65 + i)}
        </div>
      ))}
    </div>
  );
}

// ── Course preview card ────────────────────────────────────────────────────
function CoursePreviewCard({
  title,
  tag,
  progress,
  color,
}: {
  title: string;
  tag: string;
  progress: number;
  color: string;
}) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}
        >
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{title}</p>
          <p className="text-xs text-slate-400">{tag}</p>
        </div>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1.5">{progress}% complete</p>
    </div>
  );
}

// ── AI course feature cards (curated, always shown) ──────────────────────
const AI_FEATURED_COURSES = [
  {
    id: "ai-assistant",
    title: "AI as Your Personal Assistant",
    shortDescription:
      "ChatGPT, Gemini, Claude — tools that make you 10× faster at everything.",
    difficulty: "BEGINNER",
    thumbnail: "/courses/ai-assistant.png",
    href: "/courses",
    pricing: {
      currentPrice: 120000,
      originalPrice: 120000,
      discountPercentage: 0,
    },
  },
  {
    id: "ai-content-studio",
    title: "Your AI Content Studio",
    shortDescription:
      "AI video, repurposing engines, and YouTube SEO that gets you to 10k views.",
    difficulty: "INTERMEDIATE",
    thumbnail: "/courses/ai-content-studio.png",
    href: "/courses",
    pricing: {
      currentPrice: 180000,
      originalPrice: 180000,
      discountPercentage: 0,
    },
  },
  {
    id: "ai-power-user",
    title: "AI Power User",
    shortDescription:
      "Make.com automation, OpenAI API, and running local LLMs with Ollama.",
    difficulty: "ADVANCED",
    thumbnail: "/courses/ai-power-user.png",
    href: "/courses",
    pricing: {
      currentPrice: 180000,
      originalPrice: 180000,
      discountPercentage: 0,
    },
  },
  {
    id: "nextjs-ai",
    title: "Next.js + AI: Build AI-Native Web Apps",
    shortDescription:
      "Streaming AI chat, RAG systems, and a deployed AI SaaS — all in Next.js.",
    difficulty: "ADVANCED",
    thumbnail: "/courses/ai-nextjs.png",
    href: "/courses",
    pricing: {
      currentPrice: 260000,
      originalPrice: 260000,
      discountPercentage: 0,
    },
  },
];

// ── Main Page ──────────────────────────────────────────────────────────────
export default async function HomePage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {}

  if (session?.user?.role) {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  // Fetch live stats
  const [studentCount, { total: courseCount }] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    CourseService.getCourseStats(),
  ]);

  // Always use curated AI courses for homepage showcase
  const featuredCourses = AI_FEATURED_COURSES;

  return (
    <div className="dark min-h-screen bg-[#080e1a] text-white selection:bg-blue-500/30 antialiased">
      <PublicHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-24 overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-30" />

        {/* Radial glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/12 blur-[120px] animate-orb" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] animate-orb delay-1000" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 announcement-badge rounded-full px-4 py-1.5 text-sm font-medium mb-10 animate-fade-in opacity-0">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            Introducing Tech Hill 2.0 — Now with AI Mentoring
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.05] mb-8 animate-fade-in-up opacity-0 delay-100">
            The Future of{" "}
            <span className="gradient-text-blue">African Tech</span>
            <br className="hidden sm:block" /> Education.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up opacity-0 delay-200">
            Project-based courses built for Nigeria's next generation of
            engineers, designers, and digital professionals. Learn fast. Build
            real. Get hired.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-in-up opacity-0 delay-300">
            <Link href="/register">
              <Button
                size="lg"
                className="btn-glow h-13 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
              >
                Start Learning Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                variant="outline"
                size="lg"
                className="h-13 px-8 text-base font-semibold rounded-xl border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700/60 hover:text-white hover:border-slate-600 backdrop-blur-sm transition-all duration-200"
              >
                <Play className="mr-2 w-4 h-4" />
                Explore Courses
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-4 animate-fade-in-up opacity-0 delay-500">
            <AvatarStack />
            <div className="text-left">
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Loved by{" "}
                <span className="text-white font-semibold">10,000+</span>{" "}
                students across Nigeria
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard preview card floating */}
        <div className="relative z-10 mt-20 w-full max-w-4xl mx-auto px-4 animate-fade-in-up opacity-0 delay-700">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900/70 backdrop-blur-md shadow-2xl shadow-black/50 p-px">
            <div className="rounded-2xl overflow-hidden bg-[#0d1424]">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-4 h-10 border-b border-slate-800 bg-slate-900/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 mx-4 h-5 bg-slate-800 rounded-md flex items-center px-3">
                  <span className="text-[11px] text-slate-500">
                    techhill.io/student
                  </span>
                </div>
              </div>

              {/* Dashboard UI mockup */}
              <div className="p-6 grid grid-cols-12 gap-5">
                {/* Sidebar */}
                <div className="col-span-3 space-y-2 hidden md:block">
                  {[
                    "Dashboard",
                    "My Courses",
                    "Progress",
                    "Certificates",
                    "Settings",
                  ].map((item, i) => (
                    <div
                      key={item}
                      className={`h-8 rounded-lg flex items-center px-3 text-xs ${i === 1 ? "bg-blue-600/20 text-blue-400 font-semibold" : "text-slate-500"}`}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="col-span-12 md:col-span-9 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Hours Learned",
                        value: "48h",
                        color: "text-blue-400",
                      },
                      {
                        label: "Courses Active",
                        value: "3",
                        color: "text-emerald-400",
                      },
                      {
                        label: "Streak",
                        value: "12d 🔥",
                        color: "text-orange-400",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40"
                      >
                        <p className="text-[11px] text-slate-500 mb-1">
                          {s.label}
                        </p>
                        <p className={`text-lg font-bold ${s.color}`}>
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Continue learning — AI-themed */}
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Continue learning
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CoursePreviewCard
                      title="AI as Your Assistant"
                      tag="Beginner · ChatGPT"
                      progress={68}
                      color="bg-blue-600"
                    />
                    <CoursePreviewCard
                      title="Next.js + AI Streaming"
                      tag="Advanced · OpenAI"
                      progress={35}
                      color="bg-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Glow under card */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-blue-600/20 blur-3xl rounded-full" />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ─────────────────────────────────────────────── */}
      <section className="border-y border-slate-800 py-10 bg-slate-900/40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatPill
              value={`${(studentCount + 1000).toLocaleString()}+`}
              label="Active Students"
            />
            <StatPill value={`${courseCount}+`} label="Expert Courses" />
            <StatPill value="95%" label="Completion Rate" />
            <StatPill value="24/7" label="Unlimited Access" />
          </div>
        </div>
      </section>

      {/* ── WHAT YOU WILL BUILD ────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">
                Portfolio Driven
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Stop watching{" "}
                <span className="gradient-text-blue">tutorials.</span>
                <br />
                Start building{" "}
                <span className="gradient-text-blue">products.</span>
              </h2>
            </div>
            <p className="text-slate-400 max-w-sm text-right hidden md:block">
              Every course at Tech Hill is architected around a final,
              production-ready project that becomes the cornerstone of your
              portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Nexus Finance App",
                category: "Fintech Lab",
                desc: "A high-frequency dashboard with glassmorphic charts and real-time transaction streams.",
                imageSrc: "/projects/nexus-finance.png",
                skills: ["React", "Lucide", "Framer Motion"],
              },
              {
                title: "Social Content Factory",
                category: "Automation Path",
                desc: "AI-powered tool that converts long-form text into cinematic 60-second viral video scripts.",
                imageSrc: "/projects/content-factory.png",
                skills: ["Next.js", "Llama 3.2", "FFmpeg"],
              },
              {
                title: "Enterprise HR OS",
                category: "Full-Stack Mastery",
                desc: "A robust internal system for managing employee lifecycle with biometric security.",
                imageSrc: "/projects/hr-os.png",
                skills: ["Prisma", "NextAuth", "TypeScript"],
              },
            ].map((p, i) => (
              <div
                key={p.title}
                className="group relative flex flex-col bg-slate-900/50 border border-slate-800/60 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-500"
              >
                <div className="aspect-[16/10] bg-slate-800 relative overflow-hidden">
                  <img
                    src={p.imageSrc}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 flex gap-1.5">
                    {p.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-slate-900/80 text-[10px] text-slate-300 border border-slate-700/50"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5 block">
                    {p.category}
                  </span>
                  <h4 className="text-xl font-bold text-white mb-2">
                    {p.title}
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {p.desc}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-slate-400 group-hover:text-white group-hover:bg-slate-800 rounded-xl px-4 border border-transparent group-hover:border-slate-700 transition-all"
                  >
                    View Project Spec
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY TECH HILL ────────────────────────────────────────────────── */}
      <section className="py-28 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">
              Why Tech Hill
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5">
              Built for serious learners.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              We cut the fluff. Every course is engineered around real,
              deployable projects — so your portfolio speaks before you do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard
              icon={Code2}
              title="Project-Based Learning"
              description="Every lesson ends with something you built — not just something you watched. Deploy real apps from day one."
              gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            />
            <FeatureCard
              icon={BarChart2}
              title="Adaptive Progress Tracking"
              description="Our system learns how you learn. Personalized paths, spaced repetition, and smart review nudges keep you on track."
              gradient="bg-gradient-to-br from-violet-500 to-indigo-600"
            />
            <FeatureCard
              icon={Award}
              title="Verified Certificates"
              description="Blockchain-anchored certificates with a public verification link. Share to LinkedIn and make recruiters come to you."
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <FeatureCard
              icon={Users}
              title="Expert Instructors"
              description="Learn from engineers who've shipped at scale — not just academics. Real experience, real mentorship."
              gradient="bg-gradient-to-br from-orange-500 to-rose-600"
            />
            <FeatureCard
              icon={Globe2}
              title="Nigeria-First Curriculum"
              description="Pricing in Naira. Case studies from African markets. Cohorts that run in your timezone. No compromise."
              gradient="bg-gradient-to-br from-pink-500 to-fuchsia-600"
            />
            <FeatureCard
              icon={Shield}
              title="Lifetime Access"
              description="Pay once, keep forever. Course material, community, and updates — all yours for life. No surprise renewals."
              gradient="bg-gradient-to-br from-slate-600 to-slate-800"
            />
          </div>
        </div>
      </section>

      {/* ── CURRICULUM PATHS ─────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-transparent" />
        <div className="absolute left-1/4 top-0 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-start gap-16">
            {/* Copy */}
            <div className="lg:w-2/5 lg:sticky lg:top-28">
              <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">
                AI-First Curriculum
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5">
                The AI skills that are{" "}
                <span className="gradient-text-blue">printing money.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Employers are paying 3× more for AI-skilled engineers. These are
                Nigeria's most in-demand AI courses — built for people who ship,
                not just study.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "AI Prompting & ChatGPT Mastery",
                  "AI Content & Video Creation",
                  "AI Automation with Make.com",
                  "Next.js + AI Web Development",
                  "Local LLMs with Ollama",
                  "AI Agency Blueprint",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-slate-300 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl"
                >
                  View All Plans <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="lg:w-3/5 grid sm:grid-cols-2 gap-5 w-full">
              {featuredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={course.href || `/courses/${course.id}`}
                >
                  <div className="group relative bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-700/30 transition-all duration-300 hover:bg-slate-800/60 hover:-translate-y-1 cursor-pointer">
                    {/* Thumbnail */}
                    {course.thumbnail && (
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                        <span className="absolute bottom-3 left-3 inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 backdrop-blur-sm border border-blue-500/30">
                          {course.difficulty}
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                        {course.shortDescription}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Investment
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">
                              {course.pricing.currentPrice === 0
                                ? "FREE"
                                : `₦${course.pricing.currentPrice.toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-blue-400 transition-colors">
                          Explore <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ──────────────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-5 h-5 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <blockquote className="text-2xl sm:text-3xl font-semibold text-white leading-relaxed mb-8">
            "Tech Hill took me from a JAMB student who could barely use Excel to
            a<span className="gradient-text-blue"> frontend engineer</span>{" "}
            earning
            <span className="gradient-text-blue"> ₦400k/month</span> remote — in
            8 months."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">Amaka O.</p>
              <p className="text-slate-400 text-xs">
                Frontend Engineer, Flutterwave · Lagos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        {/* Radial glow background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-blue-600/12 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">
            Ready to start?
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
            One decision that changes
            <br />
            your career trajectory.
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            No hidden fees. No long-term contracts. Start with free courses and
            upgrade when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="btn-glow h-14 px-10 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-xl shadow-xl shadow-blue-500/25"
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="ghost"
                size="lg"
                className="h-14 px-8 text-base font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                View Pricing <Clock className="ml-2 w-4 h-4 opacity-60" />
              </Button>
            </Link>
          </div>
          <p className="text-slate-500 text-sm mt-6">
            Free forever. No credit card required.
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-xl text-white">
                  Tech Hill<span className="text-blue-400">.</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Empowering the next generation of African tech talent with
                world-class education, real-world projects, and a thriving
                community.
              </p>
            </div>

            {[
              {
                title: "Platform",
                links: [
                  { label: "Courses", href: "/student/courses" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "Certificates", href: "/verify" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About", href: "/about" },
                  { label: "Blog", href: "/blog" },
                  { label: "Careers", href: "/careers" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Contact Us", href: "/contact" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
            <p>
              &copy; {new Date().getFullYear()} Tech Hill. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5">
              Made with <span className="text-red-400">❤</span> in Nigeria
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
