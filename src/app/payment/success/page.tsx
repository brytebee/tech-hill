import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#080e1a] text-white flex flex-col font-sans selection:bg-blue-500/30 dark">
      {/* Background Ambience matches marking pages */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] opacity-10 blur-xl mix-blend-screen pointer-events-none" />
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

      <PublicHeader />
      
      <main className="flex-grow flex items-center justify-center p-6 relative z-10 pt-32 pb-24">
        <div className="w-full max-w-lg">
          {/* Main Success Container */}
          <div className="bg-slate-900/50 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden text-center">
            
            {/* Subtle inner top glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <div className="relative mx-auto w-24 h-24 mb-8">
              {/* Outer Pulse */}
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-75" />
              {/* Inner Circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-300">
                <CheckCircle2 className="h-12 w-12 text-white drop-shadow-md" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Payment Confirmed
            </h1>
            
            <p className="text-lg text-slate-300 mb-10 leading-relaxed font-medium">
              Your transaction was successfully verified. The learning infrastructure has provisioned your new access protocols.
            </p>
            
            <div className="space-y-4">
              <Link href="/dashboard" className="block w-full">
                <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-xl shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.02] border border-blue-500/30">
                   Initialize Environment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Footer Security Badge */}
          <div className="mt-8 text-center flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             Secure handshake completed via Paystack HTTPS
          </div>
        </div>
      </main>
    </div>
  );
}
