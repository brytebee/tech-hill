import { Suspense } from "react";
import { VerifyEmailClient } from "./verify-email-client";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Account | Tech Hill",
  description: "Verify your Tech Hill account.",
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#080e1a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute inset-0 grid-overlay opacity-20 dark:opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full space-y-8">
        <Suspense 
          fallback={
            <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-8 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading verification details...</p>
            </div>
          }
        >
          <VerifyEmailClient />
        </Suspense>
      </div>
    </div>
  );
}
