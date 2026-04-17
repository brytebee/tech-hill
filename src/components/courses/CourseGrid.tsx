"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Filter, ChevronRight, Zap, Clock, Star, X } from "lucide-react";
import Link from "next/link";

interface CoursePricing {
  currentPrice: number;
  originalPrice: number;
  discountPercentage: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  difficulty: string;
  duration: number;
  thumbnail?: string;
  tags?: string[];
  pricing: CoursePricing;
}

const DIFFICULTIES = ["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const difficultyColors: Record<string, string> = {
  ALL: "bg-blue-600 text-white",
  BEGINNER: "bg-emerald-600 text-white",
  INTERMEDIATE: "bg-indigo-600 text-white",
  ADVANCED: "bg-purple-600 text-white",
};

export function CourseGrid({ courses }: { courses: Course[] }) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("ALL");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.shortDescription || c.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesDifficulty = difficulty === "ALL" || c.difficulty === difficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [courses, search, difficulty]);

  return (
    <>
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-md">
        {/* Search */}
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses (React, Python, AI...)"
            className="w-full h-11 pl-10 pr-10 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600 text-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Difficulty filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 h-9 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                difficulty === d
                  ? difficultyColors[d]
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {d === "ALL" ? "All Levels" : d}
            </button>
          ))}

          <div className="hidden sm:flex items-center ml-3 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
            {filtered.length} / {courses.length} results
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-slate-800 rounded-3xl">
          <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No courses found</h3>
          <p className="text-slate-500 text-sm">
            {search ? `No results for "${search}"` : "Try a different filter"}
          </p>
          <Button
            variant="outline"
            className="mt-6 border-slate-700 text-slate-400 hover:text-white rounded-xl"
            onClick={() => { setSearch(""); setDifficulty("ALL"); }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="group block">
              <div className="relative h-full bg-slate-900/40 rounded-2xl border border-slate-800/60 overflow-hidden hover:bg-slate-800/60 hover:border-slate-700 hover:-translate-y-1 transition-all duration-300">
                {/* Thumbnail */}
                <div className="aspect-[16/9] relative bg-slate-800 overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
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
                    <span className="bg-slate-950/80 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded-md text-slate-400 border border-slate-700/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.duration}h
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-[10px] text-slate-500 font-medium ml-1">4.9 (120+ reviews)</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
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
                          <span className="text-sm text-slate-500 line-through">
                            ₦{course.pricing.originalPrice.toLocaleString()}
                          </span>
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
      )}
    </>
  );
}
