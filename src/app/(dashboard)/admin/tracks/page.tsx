"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Layers, Users, ExternalLink, Edit, Search, X,
  ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Track {
  id: string;
  title: string;
  description: string;
  slug: string;
  isPublished: boolean;
  _count: { courses: number; enrollments: number };
}

const PAGE_SIZE = 9; // 3×3 grid

export default function AdminTracksPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";

  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const updateUrl = useCallback((updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== null && v !== "") params.set(k, String(v));
      else params.delete(k);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false } as any);
  }, [searchParams, router, pathname]);

  const fetchTracks = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/tracks");
      const data = await response.json();
      setAllTracks(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch tracks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTracks(); }, [fetchTracks]);
  useEffect(() => { setSearchInput(searchQuery); }, [searchQuery]);

  // Client-side filter + page (tracks list is small, no need for server-side)
  const filtered = allTracks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchInput, page: null });
  };

  const handleSearchClear = () => {
    setSearchInput("");
    updateUrl({ search: null, page: null });
  };

  return (
    <AdminLayout
      title="Learning Tracks"
      description="Design career paths by sequencing individual courses into cohesive curriculum journeys."
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Track Matrix</h2>
            <p className="text-slate-500 text-sm font-bold">
              {isLoading ? "Loading..." : `${filtered.length} learning paths`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 h-11 shadow-lg shadow-blue-500/20">
            <Plus className="mr-2 h-5 w-5" /> Create New Path
          </Button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tracks by name..."
              className="pl-10 pr-10 h-11 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500/20 shadow-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" className="h-11 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">
            Search
          </Button>
        </form>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((track) => (
                <Card key={track.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant={track.isPublished ? "default" : "outline"}
                        className={track.isPublished ? "bg-emerald-500 text-white" : "text-slate-400"}
                      >
                        {track.isPublished ? "LIVE" : "DRAFT"}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                      {track.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                      {track.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>
                  <div className="px-6 flex gap-4 text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50 py-3 border-y border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5"><Layers className="h-3 w-3" /> {track._count.courses} Courses</div>
                    <div className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {track._count.enrollments} Enrolled</div>
                  </div>
                  <CardFooter className="p-4 mt-auto flex justify-between gap-2">
                    <Button variant="outline" size="sm" className="flex-1 font-bold rounded-lg h-9 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800" asChild>
                      <Link href={`/admin/tracks/${track.id}/edit`}>
                        <Edit className="h-3 w-3 mr-2" /> Modify Path
                      </Link>
                    </Button>
                    <Button size="sm" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg h-9 px-4" asChild>
                      <Link href={`/admin/tracks/${track.id}`}>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {paginated.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <div className="bg-slate-100 dark:bg-slate-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layers className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {searchQuery ? "No tracks match your search" : "Empty Track Registry"}
                  </h3>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try a different keyword.`
                      : "Zero learning paths found. Create your first career track to begin curriculum sequencing."
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 px-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Page {safePage} of {totalPages} &nbsp;·&nbsp; {filtered.length} tracks
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => updateUrl({ page: safePage - 1 })}
                    className="h-9 border-slate-200 dark:border-slate-800 font-medium"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === safePage ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateUrl({ page: p })}
                      className={`h-8 w-8 p-0 text-xs font-bold ${p === safePage ? "bg-blue-600 hover:bg-blue-500 text-white border-0" : "border-slate-200 dark:border-slate-800"}`}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => updateUrl({ page: safePage + 1 })}
                    className="h-9 border-slate-200 dark:border-slate-800 font-medium"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
