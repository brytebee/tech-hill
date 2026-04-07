// components/layout/AdminLayout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/shared/NotificationBell";
import {
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  UserCheck,
  Tag,
  Award,
  ClipboardCheck,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Submissions", href: "/admin/submissions", icon: ClipboardCheck },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Promotions", href: "/admin/promotions", icon: Tag },
  { name: "Certificates", href: "/admin/certificates", icon: Award },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({
  children,
  title,
  description,
}: AdminLayoutProps) {
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
    if (!session || session.user.role !== "ADMIN") {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060a12] flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060a12] text-slate-900 dark:text-slate-100 selection:bg-red-500/20 transition-colors duration-300">

      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ease-in-out transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/60">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Admin
              </span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-slate-500 dark:text-slate-400">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="px-3 py-4 flex flex-col h-[calc(100%-80px)] justify-between">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${isActive ? "text-red-500 dark:text-red-400" : "text-slate-400 dark:text-slate-500"}`} />
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform duration-300">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white ml-1">
                Admin<span className="text-red-500">.</span>
              </span>
            </Link>
          </div>

          {/* Nav */}
          <div className="px-4 py-2 flex-1">
            <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Management
            </h3>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? "text-red-500 dark:text-red-400" : "text-slate-400 dark:text-slate-500"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-100 to-rose-50 dark:from-red-900/40 dark:to-rose-900/20 flex items-center justify-center border border-red-200 dark:border-red-800/50 shadow-sm">
                <Shield className="h-5 w-5 text-red-500 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {session.user.firstName} {session.user.lastName}
                </p>
                <p className="text-xs text-red-500 dark:text-red-400 font-medium truncate">
                  Administrator
                </p>
              </div>
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
              ? "bg-white/80 dark:bg-[#080e1a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm"
              : "bg-transparent border-transparent"
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
              {/* Theme Toggle */}
              <div className="border-r border-slate-200 dark:border-slate-800 pr-3 mr-1">
                <ThemeToggle />
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center border border-red-200 dark:border-red-800/50">
                  <Shield className="h-4 w-4 text-red-500 dark:text-red-400" />
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
