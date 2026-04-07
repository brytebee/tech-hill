import { TrackService } from "@/lib/services/trackService";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Map, Zap, Layers, Rocket, Shield, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CareerPathsPage() {
  // Fetch all published tracks
  const tracks = await TrackService.getAllTracks(true);

  return (
    <div className="dark min-h-screen bg-[#080e1a] text-white selection:bg-blue-500/30 antialiased overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-indigo-900/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <PublicHeader />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700/50 text-blue-400 text-xs font-black uppercase tracking-widest backdrop-blur-sm">
             <Map className="w-4 h-4" /> Comprehensive Roadmaps
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            The Direct Path to a <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Tech Career.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Stop jumping between random tutorials. Our premium Career Paths provide a fully sequenced, step-by-step roadmap from absolute beginner to job-ready professional.
          </p>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {tracks.map((track: any) => (
            <Link key={track.id} href={`/career-paths/${track.slug}`} className="group block">
              <div className="relative h-full bg-slate-900/40 rounded-[2rem] border border-slate-800/60 overflow-hidden hover:bg-slate-900/80 hover:border-slate-600/80 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
                
                {/* Premium Shine Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex flex-col sm:flex-row h-full">
                  {/* Visual Side */}
                  <div className="w-full sm:w-2/5 p-6 border-b sm:border-b-0 sm:border-r border-slate-800/60 flex flex-col justify-between relative overflow-hidden group-hover:bg-slate-950/20 transition-colors">
                     {/* Thematic gradient glow behind image */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 blur-[60px] group-hover:bg-blue-400/30 transition-all" />
                     
                     <div className="relative z-10 flex-1">
                        {track.thumbnail ? (
                          <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-800/50 relative shadow-2xl">
                             <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          </div>
                        ) : (
                          <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-inner group-hover:rotate-3 transition-transform duration-500">
                             <Layers className="w-16 h-16 text-slate-700 group-hover:text-blue-500/40 transition-colors" />
                          </div>
                        )}
                     </div>

                     <div className="mt-6 flex flex-wrap gap-2 relative z-10">
                         <div className="px-2 py-1 rounded-md bg-slate-800/80 text-[10px] font-black text-slate-300 flex items-center gap-1 uppercase tracking-wider backdrop-blur-md">
                            <BookOpen className="w-3 h-3 text-blue-400" /> {track.courses.length} Courses
                         </div>
                         <div className="px-2 py-1 rounded-md bg-slate-800/80 text-[10px] font-black text-slate-300 flex items-center gap-1 uppercase tracking-wider backdrop-blur-md">
                            <Clock className="w-3 h-3 text-indigo-400" /> {track.courses.length * 15}h Est.
                         </div>
                     </div>
                  </div>

                  {/* Content Side */}
                  <div className="w-full sm:w-3/5 p-6 sm:p-8 flex flex-col justify-between relative z-10">
                     <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 px-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest flex items-center">
                                PRO PATH
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-indigo-400 transition-all">
                           {track.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                           {track.description || "Master the end-to-end skills required to dominate this field. Our sequenced roadmap ensures you learn the right things in the exact right order."}
                        </p>
                     </div>

                     <div className="pt-6 border-t border-slate-800/60 mt-auto flex items-center justify-between">
                         <div className="flex flex-col">
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Mastery Investment</span>
                             <div className="text-xl font-black text-white">
                                {Number(track.price) === 0 ? "FREE" : `₦${Number(track.price).toLocaleString()}`}
                             </div>
                         </div>
                         <Button className="bg-slate-100 group-hover:bg-blue-600 text-slate-900 group-hover:text-white font-black hover:scale-105 transition-all w-12 sm:w-auto overflow-hidden">
                             <span className="hidden sm:inline">Explore Path</span>
                             <Zap className="w-4 h-4 sm:ml-2 fill-current" />
                         </Button>
                     </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {tracks.length === 0 && (
             <div className="lg:col-span-2 py-20 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20 backdrop-blur-sm">
                 <Shield className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                 <h3 className="text-xl font-bold text-white mb-2">No active career paths</h3>
                 <p className="text-slate-500">We are currently crafting new high-value roadmaps. Check back later.</p>
             </div>
          )}
        </div>
      </main>

      {/* Footer Simplified */}
      <footer className="border-t border-slate-800/80 py-12 bg-slate-950/50 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} Tech Hill. Building the next generation of engineers.</p>
        </div>
      </footer>
    </div>
  );
}
