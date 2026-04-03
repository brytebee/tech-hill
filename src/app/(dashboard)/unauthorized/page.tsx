// app/(dashboard)/unauthorized/page.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#060a12] p-4 transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 dark:bg-red-500/10 rounded-full blur-[100px]" />
      </div>

      <Card className="max-w-md w-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
        
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 mb-4 shadow-sm">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-500" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Access Denied
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 text-base font-medium mt-2 leading-relaxed">
            Safety first. You don't have the required clearance to view this secure zone.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <Link href="/student" className="block w-full">
            <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold transition-all transform active:scale-[0.98]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
            </Button>
          </Link>
          <Link href="/" className="block w-full">
            <Button variant="outline" className="w-full h-12 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold transition-all transform active:scale-[0.98]">
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Button>
          </Link>
        </CardContent>

        <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                Secure Environment Protocol 04-B
            </p>
        </div>
      </Card>
    </div>
  );
}
