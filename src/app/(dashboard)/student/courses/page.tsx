// app/(dashboard)/student/courses/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Award,
  Play,
  Search,
  Filter,
  CheckCircle,
  UserCheck,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  ChevronRight,
  SearchCode,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { EnrollmentService } from "@/lib/services/enrollmentService";
import { CourseService } from "@/lib/services/courseService";
import { EnrollButton } from "@/components/students/EnrollButton";
import { PromotionService } from "@/lib/services/promotionService";
import { prisma } from "@/lib/db";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    difficulty?: string;
    page?: string;
  }>;
}

async function getCoursesData(
  userId: string,
  searchParams: {
    search?: string;
    difficulty?: string;
    page?: string;
  },
) {
  try {
    const page = parseInt(searchParams.page || "1");
    const limit = 12;

    const [coursesResult, enrollments, subscription] = await Promise.all([
      CourseService.getCourses(
        {
          status: "PUBLISHED",
          search: searchParams.search,
          difficulty:
            searchParams.difficulty === "none"
              ? undefined
              : (searchParams.difficulty as any),
        },
        page,
        limit,
      ),
      prisma.enrollment.findMany({
        where: {
          userId,
          status: { in: ["ACTIVE", "COMPLETED"] },
        },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  progress: {
                    where: { userId },
                  },
                  topics: {
                    include: {
                      progress: {
                        where: { userId },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.subscription.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } },
          ],
        },
      }),
    ]);

    const enrollmentMap = new Map();
    enrollments.forEach((enrollment: any) => {
      enrollmentMap.set(enrollment.courseId, enrollment);
    });

    const coursesEnhanced = await Promise.all(
      coursesResult.courses.map(async (course: any) => {
        const pricing = await PromotionService.getCurrentPrice(course.id);
        return {
          ...course,
          isEnrolled: enrollmentMap.has(course.id),
          enrollment: enrollmentMap.get(course.id),
          activeFlashSale: pricing.activeFlashSale,
          currentPrice: pricing.currentPrice,
          originalPrice: pricing.originalPrice,
        };
      }),
    );

    return {
      courses: coursesEnhanced,
      totalPages: coursesResult.pagination.pages,
      totalCourses: coursesResult.pagination.total,
      currentPage: page,
      enrollments,
      hasSubscription: !!subscription,
    };
  } catch (error: any) {
    console.error("Error fetching courses data:", error);
    return {
      courses: [],
      totalPages: 1,
      totalCourses: 0,
      currentPage: 1,
      enrollments: [],
      hasSubscription: false,
    };
  }
}

function getDifficultyBadge(difficulty: string) {
  switch (difficulty) {
    case "BEGINNER":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
          BEGINNER
        </Badge>
      );
    case "INTERMEDIATE":
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
          INTERMEDIATE
        </Badge>
      );
    case "ADVANCED":
      return (
        <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
          ADVANCED
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
          GENERAL
        </Badge>
      );
  }
}

function CourseCard({ course, userId, hasSubscription }: { course: any; userId: string; hasSubscription: boolean }) {
  return (
    <Card className="group relative flex flex-col bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500 rounded-3xl overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-all duration-500" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {getDifficultyBadge(course.difficulty)}
            {course.activeFlashSale && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest animate-pulse shadow-lg shadow-orange-500/20">
                    <Zap className="h-3 w-3 fill-current" /> SALE -{course.activeFlashSale.discountPercentage}%
                </div>
            )}
          </div>
          {course.isEnrolled ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 font-black text-[10px] uppercase tracking-widest">
                <UserCheck className="h-3 w-3" /> ENROLLED
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest">
                <Activity className="h-3 w-3" /> AVAILABLE
            </div>
          )}
        </div>
        
        <Link href={`/student/courses/${course.id}`}>
          <CardTitle className="text-xl font-black text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors cursor-pointer">
            {course.title}
          </CardTitle>
        </Link>
        <CardDescription className="line-clamp-2 text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed min-h-[40px]">
          {course.shortDescription || course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-0 relative z-10">
        <div className="space-y-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Clock className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Duration</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{course.duration}h</span>
                </div>
            </div>
            
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                    {course.activeFlashSale && Number(course.originalPrice) > Number(course.currentPrice) && (
                        <span className="text-xs text-slate-400 line-through font-bold">
                          ₦{Number(course.originalPrice).toLocaleString()}
                        </span>
                    )}
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                        {Number(course.currentPrice) === 0
                          ? "FREE"
                          : `₦${Number(course.currentPrice).toLocaleString()}`}
                    </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic leading-none">Market Rate</span>
            </div>
          </div>

          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {course.tags.slice(0, 3).map((tag: string) => (
                <div key={tag} className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                  {tag}
                </div>
              ))}
            </div>
          )}

          {course.isEnrolled && course.enrollment && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-blue-600 dark:text-blue-400">MASTERY LEVEL</span>
                <span className="text-slate-900 dark:text-white">
                  {course.enrollment.overallProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950/60 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                  style={{ width: `${course.enrollment.overallProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {course.isEnrolled ? (
            <>
              <Link href={`/student/courses/${course.id}`} className="flex-1">
                <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-black rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest">
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  {course.enrollment?.status === "COMPLETED" 
                    ? "REVIEW" 
                    : course.enrollment?.overallProgress > 0
                      ? "RESUME"
                      : "START"}
                </Button>
              </Link>
              <EnrollButton
                courseId={course.id}
                isEnrolled={true}
                variant="outline"
                className="w-11 h-11 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 rounded-xl"
              >
                <X className="h-4 w-4 text-rose-500" />
              </EnrollButton>
            </>
          ) : (
            <div className="flex w-full gap-3">
              <Link href={`/student/courses/${course.id}`} className="flex-1">
                <Button variant="outline" className="w-full h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl transition-all">
                  DETAILS
                </Button>
              </Link>
              <EnrollButton
                courseId={course.id}
                courseTitle={course.title}
                price={course.currentPrice}
                isEnrolled={false}
                hasSubscription={hasSubscription}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
              >
                ENROLL
              </EnrollButton>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SearchAndFilters({
  searchParams,
}: {
  searchParams: {
    search?: string;
    difficulty?: string;
    page?: string;
  };
}) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                    placeholder="Query catalog registry..."
                    defaultValue={searchParams.search || ""}
                    name="search"
                    className="pl-10 h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500/20 shadow-sm dark:shadow-none transition-all"
                />
            </div>

            <Select
                defaultValue={searchParams.difficulty || "none"}
                name="difficulty"
            >
                <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 text-slate-600 dark:text-slate-400 font-semibold shadow-sm dark:shadow-none">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Skill Rank" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                    <SelectItem value="none">Entire Range</SelectItem>
                    <SelectItem value="BEGINNER">Core Essentials</SelectItem>
                    <SelectItem value="INTERMEDIATE">Skill Extension</SelectItem>
                    <SelectItem value="ADVANCED">Mastery Level</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <Button type="submit" className="w-full lg:w-40 h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-black rounded-xl transition-all shadow-lg uppercase tracking-widest">
            <Sparkles className="h-4 w-4 mr-2" /> Apply Filter
        </Button>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-3 pt-10">
      <Button variant="outline" disabled={currentPage <= 1} className="h-10 px-4 border-slate-200 dark:border-slate-800 rounded-xl font-bold transition-all disabled:opacity-30">
        PREVIOUS
      </Button>

      <div className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-slate-500">
        PAGE <span className="text-slate-900 dark:text-white">{currentPage}</span> / {totalPages}
      </div>

      <Button variant="outline" disabled={currentPage >= totalPages} className="h-10 px-4 border-slate-200 dark:border-slate-800 rounded-xl font-bold transition-all disabled:opacity-30">
        NEXT
      </Button>
    </div>
  );
}

export default async function StudentCoursesPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;

  const { courses, totalPages, totalCourses, currentPage, enrollments, hasSubscription } =
    await getCoursesData(session.user.id, resolvedSearchParams);

  const enrolledCount = enrollments.filter(
    (e: any) => e.status === "ACTIVE" || e.status === "COMPLETED",
  ).length;

  return (
    <StudentLayout>
      <div className="space-y-10 animate-fade-in">
        {/* Superior Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">
                <BookOpen className="h-3 w-3" /> Educational Matrix
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Sequence Registry</h1>
            <p className="text-slate-500 font-medium mt-3 text-lg">
                Discover and scale your cognitive architecture through our curriculum nodes.
            </p>
          </div>

          <div className="flex items-center gap-6 p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 dark:backdrop-blur-xl shadow-sm dark:shadow-none group">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">AVAILABLE</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalCourses}</span>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 group-hover:h-12 transition-all" />
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SYNCHRONIZED</span>
                <span className="text-2xl font-black text-blue-600 leading-none">{enrolledCount}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Controls */}
        <form method="GET">
          <SearchAndFilters searchParams={resolvedSearchParams} />
        </form>

        {/* Global Registry Grid */}
        {courses.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
              {courses.map((course: any) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  userId={session.user.id}
                  hasSubscription={hasSubscription}
                />
              ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        ) : (
          /* Empty Matrix State */
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl py-24 text-center">
            <CardContent>
              <div className="mx-auto w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 border border-slate-200 dark:border-slate-800 shadow-inner">
                <SearchCode className="h-12 w-12" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Pattern Not Found</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 text-lg leading-relaxed">
                Our scanners yielded zero sequences matching your query. Reconfigure your filter parameters or clear search criteria.
              </p>
              {(resolvedSearchParams.search ||
                (resolvedSearchParams.difficulty &&
                  resolvedSearchParams.difficulty !== "none")) && (
                <Link href="/student/courses">
                  <Button className="h-12 px-8 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-black rounded-xl shadow-lg uppercase tracking-widest">
                    RECONFIG SCANNERS
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
