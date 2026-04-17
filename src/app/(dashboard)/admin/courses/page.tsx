// app/(dashboard)/admin/courses/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Edit, Trash2, MoreHorizontal, Eye, BookPlus, Loader2,
  Users, Clock, DollarSign, Layers, Upload, Search, X
} from "lucide-react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  difficulty: string;
  duration: number;
  price: number;
  createdAt: string;
  publishedAt: string | null;
  creator: { id: string; firstName: string; lastName: string };
  _count: { enrollments: number; modules: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const PAGE_SIZE = 15;

const courseColumns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: "Course Identity",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex flex-col max-w-[300px]">
          <span className="font-bold text-slate-900 dark:text-white leading-tight mb-1 truncate">
            {course.title}
          </span>
          <span className="text-xs text-slate-500 line-clamp-1 leading-normal">
            {course.description}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "creator",
    header: "Architect",
    cell: ({ row }) => {
      const creator = row.original.creator;
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              {creator.firstName[0]}{creator.lastName[0]}
            </span>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {creator.firstName} {creator.lastName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Publish State",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      if (status === "PUBLISHED") {
        return (
          <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-100 shadow-none font-bold px-2 py-0.5 uppercase tracking-wider">
            PUBLISHED
          </Badge>
        );
      }
      if (status === "DRAFT") {
        return (
          <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 hover:bg-amber-100 shadow-none font-bold px-2 py-0.5 uppercase tracking-wider">
            DRAFT
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="text-slate-400 border-slate-200 dark:border-slate-800 font-bold px-2 py-0.5 uppercase tracking-wider">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    cell: ({ row }) => {
      const difficulty = row.getValue("difficulty") as string;
      const colors: Record<string, string> = {
        BEGINNER: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30",
        INTERMEDIATE: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30",
        ADVANCED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/30",
      };
      return (
        <Badge className={`${colors[difficulty] || "bg-slate-500/10 text-slate-600 border-slate-200"} shadow-none font-bold px-2 py-0.5`}>
          {difficulty}
        </Badge>
      );
    },
  },
  {
    accessorKey: "metrics",
    header: "Engagement",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}h</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course._count.enrollments}</span>
          <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {course._count.modules}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Valuation",
    cell: ({ row }) => {
      const price = Number(row.getValue("price"));
      if (price === 0) return <span className="text-sm font-black text-emerald-500 uppercase italic">Free</span>;
      return (
        <div className="flex items-center font-black text-slate-900 dark:text-white">
          <DollarSign className="h-3 w-3 text-slate-400" />
          <span>{price.toLocaleString()}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CourseActions course={row.original} />,
  },
];

function CourseActions({ course }: { course: Course }) {
  const { toast } = useToast();

  const handleArchive = async () => {
    if (!confirm("Confirm archiving course sequence? Students will lose enrollment access.")) return;
    try {
      const response = await fetch(`/api/courses/${course.id}/archive`, { method: "POST" });
      if (!response.ok) throw new Error((await response.json()).error);
      toast({ title: "Sequence Archived", description: "Course has been decommissioned." });
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleUnpublish = async () => {
    if (!confirm("Revert course to draft state?")) return;
    try {
      const response = await fetch(`/api/courses/${course.id}/publish`, { method: "PUT" });
      if (!response.ok) throw new Error((await response.json()).error);
      toast({ title: "Sequence Retracted", description: "Course reverted to draft status." });
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Permanent deletion of course data structure? This cannot be undone.")) return;
    try {
      const response = await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).error);
      toast({ title: "Sequence Deleted", description: "All database records purged." });
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  };

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/courses/${course.id}/publish`, { method: "POST" });
      if (!response.ok) throw new Error((await response.json()).error);
      toast({ title: "Sequence Live", description: "Course published to platform matrix." });
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <MoreHorizontal className="h-4 w-4 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-200 dark:border-slate-800 p-1">
        <DropdownMenuItem asChild className="cursor-pointer font-medium rounded-lg p-2 focus:bg-slate-50 dark:focus:bg-slate-800">
          <Link href={`/admin/courses/${course.id}`}>
            <Eye className="h-4 w-4 mr-2 text-slate-400" /> View Catalog
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer font-medium rounded-lg p-2 focus:bg-slate-50 dark:focus:bg-slate-800">
          <Link href={`/admin/courses/${course.id}/edit`}>
            <Edit className="h-4 w-4 mr-2 text-slate-400" /> Edit Manifest
          </Link>
        </DropdownMenuItem>
        {course.status === "DRAFT" && (
          <DropdownMenuItem onClick={handlePublish} className="cursor-pointer font-bold text-emerald-600 dark:text-emerald-400 p-2 focus:bg-emerald-50 dark:focus:bg-emerald-900/30">
            <Plus className="h-4 w-4 mr-2" /> Push to Live
          </DropdownMenuItem>
        )}
        {course.status === "PUBLISHED" && (
          <>
            <DropdownMenuItem onClick={handleUnpublish} className="cursor-pointer font-medium rounded-lg p-2 focus:bg-slate-50 dark:focus:bg-slate-800">
              <Edit className="h-4 w-4 mr-2 text-slate-400" /> Unpublish
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive} className="cursor-pointer font-medium rounded-lg p-2 focus:bg-slate-50 dark:focus:bg-slate-800">
              <Trash2 className="h-4 w-4 mr-2 text-slate-400" /> Archive
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={handleDelete} className="cursor-pointer font-bold text-red-600 p-2 focus:bg-red-50 dark:focus:bg-red-950/30 border-t border-slate-100 dark:border-slate-800 mt-1">
          <Trash2 className="h-4 w-4 mr-2" /> Purge Sequence
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";

  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const updateUrl = useCallback((updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== null && v !== "" && v !== 0) params.set(k, String(v));
      else params.delete(k);
    });
    // Always reset to page 1 when search changes (unless page is explicitly set)
    router.push(`${pathname}?${params.toString()}`, { scroll: false } as any);
  }, [searchParams, router, pathname]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
        ...(searchQuery ? { search: searchQuery } : {}),
      });
      const response = await fetch(`/api/courses?${params}`);
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data.courses);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Sync local search input when URL changes externally
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchInput, page: null });
  };

  const handleSearchClear = () => {
    setSearchInput("");
    updateUrl({ search: null, page: null });
  };

  if (loading && courses.length === 0) {
    return (
      <AdminLayout title="Catalog Manager" description="Orchestrate platform intellectual property and curriculum modules">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="relative h-12 w-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin absolute" />
            <div className="h-12 w-12 border-4 border-blue-100 dark:border-blue-900/30 rounded-full" />
          </div>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
            Syncing catalog matrix...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Catalog Manager" description="Orchestrate platform intellectual property and curriculum modules">
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:backdrop-blur-sm">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Curriculum Hub</h2>
            <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1">
              {pagination.total} educational assets currently in circulation
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/courses/import">
              <Button variant="outline" className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 h-11 px-4 font-bold rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center shadow-sm">
                <Upload className="h-4 w-4 mr-2" /> Bulk Import
              </Button>
            </Link>
            <Link href="/admin/courses/create">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 h-11 px-6 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center">
                <BookPlus className="h-5 w-5 mr-2" /> New Sequence
              </Button>
            </Link>
          </div>
        </div>

        {/* Search bar — server-side, URL-persisted */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Query course registry..."
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
          {loading && courses.length > 0 && (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          )}
        </form>

        {/* Table with server-side pagination */}
        <DataTable
          columns={courseColumns}
          data={courses}
          serverPagination={{
            currentPage,
            totalPages: pagination.pages,
            totalCount: pagination.total,
            pageSize: PAGE_SIZE,
            onPageChange: (page) => updateUrl({ page }),
          }}
        />
      </div>
    </AdminLayout>
  );
}
