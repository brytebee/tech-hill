// components/layout/ManagerLayout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import {
  Users,
  BookOpen,
  FileText,
  UserCheck,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  Award,
} from "lucide-react";

interface ManagerLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const navigation = [
  { name: "Dashboard", href: "/manager", icon: Home },
  { name: "My Courses", href: "/manager/courses", icon: BookOpen },
  { name: "Students", href: "/manager/students", icon: Users },
  { name: "Reports", href: "/manager/reports", icon: BarChart3 },
  { name: "Submissions", href: "/manager/submissions", icon: FileText },
  { name: "Certificates", href: "/manager/certificates", icon: Award },
];

export function ManagerLayout({
  children,
  title,
  description,
}: ManagerLayoutProps) {
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
    if (
      !session ||
      (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")
    ) {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060a12] flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (
    !session ||
    (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060a12] text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 transition-colors duration-300">

      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ease-in-out transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/60">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Manager
              </span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-slate-500 dark:text-slate-400">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="px-3 py-4 flex flex-col h-[calc(100%-80px)] justify-between">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/manager" && pathname.startsWith(item.href));
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
        <div className="flex flex-col flex-grow bg-white dark:bg-[#080e1a] border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
          {/* Logo */}
          <div className="flex items-center px-6 py-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white ml-1">
                Manager<span className="text-blue-500">.</span>
              </span>
            </Link>
          </div>

          {/* Nav */}
          <div className="px-4 py-2 flex-1">
            <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Overview
            </h3>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/manager" && pathname.startsWith(item.href));
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

          {/* Footer */}
          <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 px-2 py-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/20 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 shadow-sm overflow-hidden shrink-0">
                <ProfileAvatar
                    fallback={<UserCheck className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
                    imgClassName="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {session.user.firstName} {session.user.lastName}
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-400 font-medium truncate">
                  {session.user.role === "ADMIN" ? "Administrator" : "Manager"}
                </p>
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

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col min-h-screen">

        {/* Sticky Header */}
        <header
          className={`sticky top-0 z-40 transition-all duration-300 ${
            scrolled
              ? "bg-white/90 dark:bg-[#080e1a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm"
              : "bg-white/60 dark:bg-[#080e1a]/60 backdrop-blur-sm border-b border-slate-100/80 dark:border-slate-800/50"
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-500 dark:text-slate-400"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              {title && (
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">{description}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              {/* Mobile-only theme toggle (desktop toggle lives in sidebar footer) */}
              <div className="lg:hidden">
                <ThemeToggle />
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 overflow-hidden shrink-0">
                  <ProfileAvatar
                      fallback={<UserCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
                      imgClassName="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                  {session.user.firstName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
