"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

export function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing from the URL.");
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyToken = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok || data.alreadyVerified) {
          setStatus("success");
          setMessage("Your account is now verified! You can sign in to continue.");
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify account.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again later.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="space-y-8 w-full">
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
          </div>
        </Link>
      </div>

      <Card className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <CardContent className="pt-8 pb-8 text-center flex flex-col items-center justify-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">
                Verifying Account
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">
                Verification Successful!
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{message}</p>
              <Button
                className="mt-6 w-full max-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => router.push("/login?message=Account%20verified.%20Please%20sign%20in.")}
              >
                Sign In
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">
                Verification Failed
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{message}</p>
              
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => router.push("/login")}>
                  Go to Login
                </Button>
                <Button onClick={() => router.push("/register")}>
                  Register Again
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
