import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, MapPin, Send, Globe2 } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="dark min-h-screen bg-[#080e1a] text-white selection:bg-blue-500/30 antialiased">
      <PublicHeader />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Info Side */}
          <div className="space-y-12">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
                Get in <span className="gradient-text-blue">Touch.</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                Have questions about our curriculum, pricing, or enterprise solutions? Our team is ready to help you accelerate your tech career.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: Mail, label: "Email Support", value: "support@techhill.io", desc: "Expect a response within 12-24 hours." },
                { icon: MessageCircle, label: "WhatsApp Connect", value: "+234 800 TECH HILL", desc: "Fast support for quick inquiries." },
                { icon: MapPin, label: "Nigeria Office", value: "Innovation Hub, Yaba, Lagos", desc: "For corporate partnerships and physical trainings." },
              ].map((item) => (
                <div key={item.label} className="flex gap-5 group">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</h4>
                    <p className="text-lg font-semibold text-white mb-0.5">{item.value}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <div className="relative p-8 sm:p-10 rounded-3xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-bold mb-8">Send us a Message</h3>
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Amaka Okafor" 
                    className="w-full h-12 px-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="amaka@gmail.com" 
                    className="w-full h-12 px-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">Subject</label>
                <select className="w-full h-12 px-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer">
                  <option>General Inquiry</option>
                  <option>Payment/Course Access</option>
                  <option>Corporate Training</option>
                  <option>Instructor Partnership</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">Your Message</label>
                <textarea 
                  rows={5} 
                  placeholder="How can we help you today?" 
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>
              <Button size="lg" className="w-full btn-glow bg-blue-600 hover:bg-blue-500 h-13 font-bold rounded-xl shadow-blue-500/20">
                Send Message
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-12 bg-slate-950/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Tech Hill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
