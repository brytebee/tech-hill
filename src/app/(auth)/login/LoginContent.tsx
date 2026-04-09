"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import Link from "next/link";
import { BookOpen, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LoginContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#080e1a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">

      {/* Absolute Header for Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 grid-overlay opacity-20 dark:opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full space-y-8">

        {/* Session expired banner */}
        {reason === "session_expired" && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/10 px-4 py-3.5 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
              Your session was signed out because this account was accessed from another device. Sign in again to continue.
            </p>
          </div>
        )}

        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="group flex flex-col items-center gap-4 hover:opacity-90 transition-opacity"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                Tech Hill<span className="text-blue-500">.</span>
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Welcome back to your dashboard
              </p>
            </div>
          </Link>
        </div>

        <LoginForm className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-xl" />
      </div>
    </div>
  );
}
