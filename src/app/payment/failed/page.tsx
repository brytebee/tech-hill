import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[#080e1a] text-white flex flex-col font-sans selection:bg-rose-500/30 dark">
      {/* Background Ambience matches marking pages */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] opacity-10 blur-xl mix-blend-screen pointer-events-none" />
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      <PublicHeader />
      
      <main className="flex-grow flex items-center justify-center p-6 relative z-10 pt-32 pb-24">
        <div className="w-full max-w-lg">
          {/* Main Failure Container */}
          <div className="bg-slate-900/50 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden text-center">
            
            {/* Subtle inner top glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

            <div className="mx-auto w-24 h-24 mb-8 bg-gradient-to-br from-rose-400/20 to-red-600/20 rounded-full flex items-center justify-center border border-red-500/30 shadow-inner">
               <XCircle className="h-12 w-12 text-rose-500 drop-shadow-md" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Transaction Reverted!
            </h1>
            
            <p className="text-lg text-slate-300 mb-10 leading-relaxed font-medium">
              We were unable to secure the handshake for this payment. Your account has not been charged, and no access protocols were provisioned.
            </p>
            
            <div className="flex flex-col gap-4">
              <Link href="/dashboard" className="block w-full">
                <Button className="w-full h-14 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-lg shadow-xl shadow-red-500/20 rounded-xl transition-all hover:scale-[1.02] border border-red-500/30">
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Attempt Handshake Again
                </Button>
              </Link>
              
              <Link href="/contact" className="block w-full">
                <Button variant="outline" className="w-full h-14 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold text-base rounded-xl transition-all">
                  Request Support Override
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Footer Warning Badge */}
          <div className="mt-8 text-center flex items-center justify-center gap-2 text-sm text-slate-500 font-medium bg-slate-900/40 w-fit mx-auto px-4 py-2 rounded-full border border-slate-800 shadow-inner">
             <span className="text-rose-500 font-bold">Error 104</span> • Insufficient Funds / Bank Decline 
          </div>
        </div>
      </main>
    </div>
  );
}
