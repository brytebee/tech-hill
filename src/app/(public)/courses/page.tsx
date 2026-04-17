import { CourseService } from "@/lib/services/courseService";
import { PromotionService } from "@/lib/services/promotionService";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { Map, ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const { courses: techHillCourses } = await CourseService.getCourses({ status: "PUBLISHED" }, 1, 200);

  const coursesWithPricing = await Promise.all(
    techHillCourses.map(async (course: any) => {
      const pricing = await PromotionService.getCurrentPrice(course.id);
      return { ...course, pricing };
    })
  );

  return (
    <div className="dark min-h-screen bg-[#080e1a] text-white selection:bg-blue-500/30 antialiased">
      <PublicHeader />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
            Master the <span className="gradient-text-blue">Future of Tech</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Project-based courses engineered for the Nigerian market. From zero to career-ready with expert mentorship and verified certificates.
          </p>
        </div>

        {/* Career Paths Cross-Promotion Banner */}
        <Link href="/career-paths" className="group block mb-10">
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/20 backdrop-blur-sm p-5 sm:p-6 hover:border-blue-400/40 transition-all duration-300">
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Map className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Not sure where to start?</p>
                  <p className="text-white font-black text-base">
                    Follow a guided{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                      Career Path
                    </span>{" "}
                    — from Zero to Hired.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-black text-sm uppercase tracking-widest group-hover:gap-3 transition-all whitespace-nowrap flex-shrink-0">
                Explore Paths <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* Interactive Course Grid — client component handles search & filter */}
        <CourseGrid courses={coursesWithPricing} />
      </main>

      <footer className="border-t border-slate-800/80 py-12 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Tech Hill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
