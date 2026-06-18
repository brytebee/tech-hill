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
  ChevronLeft,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { PlaygroundSidebar } from "@/components/shared/PlaygroundSidebar";

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
  { name: "Code Playground", icon: Terminal, action: "playground" as const },
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
  
  // Persisted Collapsed States
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setLeftCollapsed(localStorage.getItem("student-left-sidebar-collapsed") === "true");
      setPlaygroundOpen(localStorage.getItem("student-playground-open") === "true");
    }
  }, []);

  const toggleLeftCollapse = () => {
    const nextState = !leftCollapsed;
    setLeftCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("student-left-sidebar-collapsed", String(nextState));
    }
  };

  const togglePlayground = () => {
    const nextState = !playgroundOpen;
    setPlaygroundOpen(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("student-playground-open", String(nextState));
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
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
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "" : "hidden"}`}
      >
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ease-in-out transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/60">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Tech Hill
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-slate-500 dark:text-slate-400"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="px-3 py-4 flex flex-col h-[calc(100%-80px)] justify-between">
            <nav className="space-y-1">
              {navigation.map((item) => {
                if (item.action === "playground") {
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setPlaygroundOpen(true);
                        setSidebarOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200"
                    >
                      <item.icon className="h-5 w-5 mr-3 text-slate-400 dark:text-slate-500" />
                      {item.name}
                    </button>
                  );
                }
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 mr-3 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 pb-2 space-y-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Theme
                </span>
                <ThemeToggle />
              </div>
              <Button
                onClick={() => signOut()}
                variant="ghost"
                className="w-full justify-start text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div 
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 ease-in-out z-20 ${
          isMounted && leftCollapsed ? "lg:w-20" : "lg:w-72"
        }`}
      >
        <div className="flex flex-col flex-grow bg-white dark:bg-[#080e1a] border-r border-slate-200 dark:border-slate-800 relative z-20 transition-colors duration-300">
          <div className={`flex items-center py-6 font-semibold transition-all duration-300 ${
            isMounted && leftCollapsed ? "justify-center px-2" : "px-6"
          }`}>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                <BookOpen className="w-4.5 h-4.5 text-white" />
              </div>
              {!(isMounted && leftCollapsed) && (
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white ml-1">
                  Tech Hill<span className="text-blue-500">.</span>
                </span>
              )}
            </Link>
          </div>
          <div className="px-4 py-2 flex-1 outline-none">
            {!(isMounted && leftCollapsed) && (
              <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Menu
              </h3>
            )}
            <nav className="space-y-1.5">
              {navigation.map((item) => {
                if (item.action === "playground") {
                  return (
                    <button
                      key={item.name}
                      onClick={togglePlayground}
                      title={isMounted && leftCollapsed ? item.name : undefined}
                      className={`flex items-center transition-all duration-200 ${
                        isMounted && leftCollapsed
                          ? "justify-center h-11 w-11 rounded-xl mx-auto"
                          : "w-full px-4 py-2.5 rounded-xl text-sm font-medium"
                      } ${
                        isMounted && playgroundOpen
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <item.icon
                        className={`transition-colors transition-all duration-200 ${
                          isMounted && leftCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3"
                        } ${isMounted && playgroundOpen ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                      />
                      {!(isMounted && leftCollapsed) && <span>{item.name}</span>}
                    </button>
                  );
                }
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    title={isMounted && leftCollapsed ? item.name : undefined}
                    className={`flex items-center transition-all duration-200 ${
                      isMounted && leftCollapsed
                        ? "justify-center h-11 w-11 rounded-xl mx-auto"
                        : "w-full px-4 py-2.5 rounded-xl text-sm font-medium"
                    } ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <item.icon
                      className={`transition-colors transition-all duration-200 ${
                        isMounted && leftCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3"
                      } ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                    />
                    {!(isMounted && leftCollapsed) && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
            {/* User info */}
            <div className={`flex items-center gap-3 mb-3 ${isMounted && leftCollapsed ? "justify-center px-0" : "px-2 py-2"}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 shadow-sm overflow-hidden shrink-0">
                <ProfileAvatar
                  fallback={<User className="h-5 w-5 text-slate-500 dark:text-slate-400" />}
                  imgClassName="w-full h-full object-cover rounded-full"
                />
              </div>
              {!(isMounted && leftCollapsed) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {session.user.firstName} {session.user.lastName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Student
                  </p>
                </div>
              )}
            </div>
            
            {/* Theme toggle row */}
            {isMounted && leftCollapsed ? (
              <div className="flex justify-center py-2 border-b border-slate-150 dark:border-slate-800/40 mb-2">
                <ThemeToggle />
              </div>
            ) : (
              <div className="flex items-center justify-between px-2 py-2 mb-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Theme
                </span>
                <ThemeToggle />
              </div>
            )}
            
            {/* Sign Out */}
            <Button
              onClick={() => signOut()}
              variant="ghost"
              title={isMounted && leftCollapsed ? "Sign Out" : undefined}
              className={`text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 ${
                isMounted && leftCollapsed ? "w-12 h-12 p-0 mx-auto flex items-center justify-center rounded-xl" : "w-full justify-start text-sm font-medium"
              }`}
            >
              <LogOut className={`h-5 w-5 ${isMounted && leftCollapsed ? "" : "mr-3"}`} />
              {!(isMounted && leftCollapsed) && "Sign Out"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div 
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isMounted && leftCollapsed ? "lg:pl-20" : "lg:pl-72"
        } ${
          isMounted && playgroundOpen ? "lg:pr-[500px]" : "lg:pr-16"
        }`}
      >
        {/* Sticky Header */}
        <header
          className={`sticky top-0 z-30 transition-all duration-300 ${
            scrolled
              ? "bg-white/90 dark:bg-[#080e1a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm"
              : "bg-white/60 dark:bg-[#080e1a]/60 backdrop-blur-sm border-b border-slate-100/80 dark:border-slate-800/50"
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 border-r border-slate-200 dark:border-slate-800 pr-4 lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="text-slate-500 dark:text-slate-400"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                {scrolled && (
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <BookOpen className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Desktop Left Sidebar Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLeftCollapse}
                className="hidden lg:flex text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mr-1 h-8 w-8 rounded-lg"
                title={leftCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {leftCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            </div>

            <div className="flex-1 lg:pl-0 flex flex-col justify-center min-w-0">
              {title && (
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {title}
                </h1>
              )}
            </div>

            {/* Header Right Controls */}
            <div className="flex items-center gap-3 pl-4">
              <NotificationBell />
              
              {/* Mobile-only theme toggle */}
              <div className="lg:hidden">
                <ThemeToggle />
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                  <ProfileAvatar
                    fallback={<User className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
                    imgClassName="w-full h-full object-cover rounded-full"
                  />
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
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>

      {/* Code Playground Sidebar (Symmetrical Collapsible Drawer) */}
      <PlaygroundSidebar 
        isOpen={isMounted && playgroundOpen} 
        onToggle={togglePlayground} 
      />
    </div>
  );
}
