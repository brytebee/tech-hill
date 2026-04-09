"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  TrendingUp,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
  Layers,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface StudentLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const navigation = [
  { name: "Dashboard", href: "/student", icon: Home },
  { name: "My Courses", href: "/student/courses", icon: BookOpen },
  { name: "Career Paths", href: "/student/tracks", icon: Layers },
  { name: "Progress", href: "/student/progress", icon: TrendingUp },
  { name: "Achievements", href: "/student/achievements", icon: Award },
  { name: "Profile", href: "/student/profile", icon: User },
  { name: "Security", href: "/student/settings", icon: Settings },
];

export function StudentLayout({
  children,
  title,
  description,
}: StudentLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      // Session was invalidated server-side (e.g. another device logged in,
      // admin suspended account, or token version mismatch). Hard-sign-out
      // flushes the stale JWT cookie so the polling loop stops immediately.
      signOut({ callbackUrl: "/login?reason=session_expired" });
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080e1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060a12] text-slate-900 dark:text-slate-100 selection:bg-blue-500/30 transition-colors duration-300">
      
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ease-in-out transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/60">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Tech Hill
              </span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-slate-500 dark:text-slate-400">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="px-3 py-4 flex flex-col h-[calc(100%-80px)] justify-between">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 pb-2 space-y-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Theme</span>
                <ThemeToggle />
              </div>
              <Button onClick={() => signOut()} variant="ghost" className="w-full justify-start text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300">
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white dark:bg-[#080e1a] border-r border-slate-200 dark:border-slate-800 relative z-20 transition-colors duration-300">
          <div className="flex items-center px-6 py-6 font-semibold">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <BookOpen className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white ml-1">
                Tech Hill<span className="text-blue-500">.</span>
              </span>
            </Link>
          </div>
          <div className="px-4 py-2 flex-1 outline-none">
            <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Menu
            </h3>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
            {/* User info */}
            <div className="flex items-center gap-3 px-2 py-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 shadow-sm">
                <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {session.user.firstName} {session.user.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Student</p>
              </div>
            </div>
            {/* Theme toggle row */}
            <div className="flex items-center justify-between px-2 py-2 mb-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Theme</span>
              <ThemeToggle />
            </div>
            <Button onClick={() => signOut()} variant="ghost" className="w-full justify-start text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300">
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        
        {/* Sticky Header — always has a subtle bg so ThemeToggle is never invisible */}
        <header
          className={`sticky top-0 z-40 transition-all duration-300 ${
            scrolled
              ? "bg-white/90 dark:bg-[#080e1a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm"
              : "bg-white/60 dark:bg-[#080e1a]/60 backdrop-blur-sm border-b border-slate-100/80 dark:border-slate-800/50"
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4 border-r border-slate-200 dark:border-slate-800 pr-4 lg:hidden">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="text-slate-500 dark:text-slate-400">
                <Menu className="h-5 w-5" />
              </Button>
              {scrolled && (
                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <BookOpen className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 lg:pl-0 flex flex-col justify-center min-w-0">
              {title && (
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {title}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-3 pl-4">
               <NotificationBell />
               {/* Mobile-only theme toggle (desktop toggle lives in sidebar footer) */}
               <div className="lg:hidden">  
                 <ThemeToggle />
               </div>
               
               <div className="hidden sm:flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                   <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                 </div>
                 <span className="text-sm font-semibold max-w-[120px] truncate">
                   {session.user.firstName}
                 </span>
               </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {description && (
            <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-3xl">
                {description}
              </p>
            </div>
          )}
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
