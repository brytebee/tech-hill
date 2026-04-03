"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidEmail } from "@/lib/utils";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSubmitted(true);
      toast.success("Reset link sent if email exists.");
    } catch (error: any) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080e1a] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden transition-colors duration-500">
      
      {/* Dynamic Backgrounds matching Auth Flow */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] opacity-[0.03] dark:opacity-10 blur-xl mix-blend-screen pointer-events-none" />
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Global Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Marker */}
        <div className="flex justify-center mb-8">
           <Link href="/" className="inline-flex items-center gap-2">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10">
               <span className="text-white font-black text-xl tracking-tighter">TH</span>
             </div>
           </Link>
        </div>

        {/* Glassmorphic Container */}
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Forgot password?
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No worries. Enter your email and we'll send you recovery instructions.
            </p>
          </div>

          <div className="mt-8">
            {isSubmitted ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30 shadow-inner">
                    <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="space-y-2">
                   <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                     If a verified account exists for <br/><strong className="text-slate-900 dark:text-white mt-1 block">{email}</strong>
                   </p>
                   <p className="text-sm text-slate-500 dark:text-slate-400">You will receive a password reset link shortly.</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-12 font-bold border-2 border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try another email
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-2 relative group">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                    Registered Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={isLoading}
                    className="h-14 bg-slate-50 border-slate-200 dark:bg-slate-950/50 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all font-medium"
                  />
                  <div className="absolute inset-0 -z-10 rounded-xl bg-blue-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                </div>
                <Button 
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.02] border border-blue-500/30 mt-2" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Dispatching Protocol...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <Link
              href="/login"
              className="flex items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Authentication Segment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
