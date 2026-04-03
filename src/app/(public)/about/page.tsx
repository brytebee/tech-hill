import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Compass, Globe2, Code2, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="dark min-h-screen bg-[#080e1a] text-white selection:bg-blue-500/30 antialiased">
      <PublicHeader />

      <main className="pt-32 pb-24 overflow-hidden">
        {/* Intro */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center mb-24">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-8">
            Our Mission
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
            Empowering the Next <br />
            <span className="gradient-text-blue">Generation of African</span> Tech.
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Tech Hill is more than an educational platform. We are building the infrastructure for professional mastery in Nigeria and beyond, focusing on project-based curriculum that leads directly to career outcomes.
          </p>
        </section>

        {/* The Why */}
        <section className="relative py-24 bg-slate-900/40 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 tracking-tight">Why Tech Hill?</h2>
                <div className="space-y-8">
                  {[
                    { 
                      icon: Globe2, 
                      title: "Nigeria-First Curriculum", 
                      desc: "We prioritize local market needs, from Naira pricing to case studies and community cohorts that fit your timezone." 
                    },
                    { 
                      icon: Code2, 
                      title: "Project-First Mastery", 
                      desc: "Skip the theory-only modules. Our courses are structured around building real-world applications that recruiters actually want to see." 
                    },
                    { 
                      icon: Award, 
                      title: "Verified Credentials", 
                      desc: "Our blockchain-anchored certificates provide an immutable record of your skills, making verification seamless for global employers." 
                    }
                  ].map((item, i) => (
                    <div key={item.title} className="flex gap-5">
                      <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1.5">{item.title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden bg-slate-800 border border-slate-700/50 shadow-2xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-slate-700 opacity-50" />
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-blue-600 p-8 rounded-2xl shadow-xl shadow-blue-500/30">
                  <p className="text-3xl font-black text-white">10,000+</p>
                  <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mt-1">Students Learning</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 max-w-2xl mx-auto">
            Ready to join the community building the future?
          </h2>
          <Link href="/register">
            <Button size="lg" className="btn-glow bg-blue-600 hover:bg-blue-500 text-white px-10 h-14 rounded-xl font-bold">
              Become a Student
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 py-12 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Tech Hill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
