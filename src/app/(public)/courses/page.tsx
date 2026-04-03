import { CourseService } from "@/lib/services/courseService";
import { PromotionService } from "@/lib/services/promotionService";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Filter, ChevronRight, Zap, Clock, Shield, Star } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const { courses: techHillCourses } = await CourseService.getCourses({ status: "PUBLISHED" }, 1, 100);

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

        {/* Filter Bar (Simplified for V1) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 p-2 rounded-2xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-md">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search courses (React, Python, UI/UX...)" 
              className="w-full h-11 pl-10 pr-4 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-initial h-11 border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <div className="hidden sm:flex items-center gap-1 ml-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Showing {coursesWithPricing.length} Results
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesWithPricing.map((course: any) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="group block">
              <div className="relative h-full bg-slate-900/40 rounded-2xl border border-slate-800/60 overflow-hidden hover:bg-slate-800/60 hover:border-slate-700 hover:-translate-y-1 transition-all duration-300">
                
                {/* Thumbnail Area */}
                <div className="aspect-[16/9] relative bg-slate-800 overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <BookOpen className="w-10 h-10 text-slate-700" />
                    </div>
                  )}
                  {course.pricing.discountPercentage > 0 && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-white" />
                      {course.pricing.discountPercentage}% OFF
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="bg-slate-950/80 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded-md text-blue-400 border border-blue-500/20">
                      {course.difficulty}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium ml-1">4.9 (120+ reviews)</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6">
                    {course.shortDescription || course.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Investment</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">
                          {course.pricing.currentPrice === 0 ? "FREE" : `₦${course.pricing.currentPrice.toLocaleString()}`}
                        </span>
                        {course.pricing.discountPercentage > 0 && (
                          <span className="text-sm text-slate-500 line-through">₦{course.pricing.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-lg h-9 px-4">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer (Simplified) */}
      <footer className="border-t border-slate-800/80 py-12 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Tech Hill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
