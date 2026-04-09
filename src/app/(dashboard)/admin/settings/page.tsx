// app/(dashboard)/admin/settings/page.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PasskeySettings } from "@/components/shared/passkey-settings";
import { ProfileSettingsForm } from "@/components/shared/profile-settings-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Bell, Lock, Key, Smartphone, Fingerprint, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
  return (
    <AdminLayout 
      title="Platform Settings" 
      description="Manage administrative security and operational preferences"
    >
      <div className="max-w-5xl space-y-10 animate-fade-in pb-20">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-4">
             <div className="sticky top-24 space-y-2">
                 <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest pl-2 mb-4">Settings Modules</h3>
                 
                 <div className="bg-white dark:bg-slate-900/80 border border-blue-500 shadow-sm shadow-blue-500/20 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                       <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="font-black text-slate-900 dark:text-white uppercase text-sm">Security Matrix</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Authentication & Access</p>
                    </div>
                 </div>

                 <div className="hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                       <Bell className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="font-black text-slate-900 dark:text-white uppercase text-sm">Notifications</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Alerts & Directives</p>
                    </div>
                 </div>
                 
                 <div className="hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                       <Activity className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="font-black text-slate-900 dark:text-white uppercase text-sm">Session Control</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Device Management</p>
                    </div>
                 </div>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
              
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 shadow-2xl min-h-[140px] flex items-center border border-slate-800">
                 <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                     <Lock className="h-32 w-32 text-indigo-400 rotate-12" />
                 </div>
                 <div className="relative z-10 w-full flex items-center justify-between">
                     <div>
                         <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 text-[10px] font-black tracking-widest px-3 py-1">ADMINISTRATIVE PROTOCOLS ACTIVE</Badge>
                         <h2 className="text-2xl font-black text-white uppercase tracking-tight">Security Matrix</h2>
                         <p className="text-sm font-medium text-slate-400">Manage your high-privilege biometric keys</p>
                     </div>
                 </div>
              </div>

              {/* Profile Config */}
              <ProfileSettingsForm />

              {/* Passkeys Integration Component */}
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060a12]/50 dark:backdrop-blur-xl shadow-lg border border-indigo-500/10 overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800 pb-6 px-8 pt-8">
                   <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                           <Fingerprint className="h-5 w-5" />
                       </div>
                       <div>
                           <CardTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Biometric Passkeys</CardTitle>
                           <CardDescription className="text-xs">Passwordless authentication methods</CardDescription>
                       </div>
                   </div>
                </CardHeader>
                <CardContent className="p-8">
                   <PasskeySettings settingsPath="/admin/settings" />
                </CardContent>
              </Card>

              {/* Account Recovery Block (Readonly Visual Mockup) */}
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden">
                 <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div className="flex items-start gap-4">
                           <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                               <Key className="h-5 w-5 text-slate-500" />
                           </div>
                           <div>
                               <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm mb-1">Traditional Password</h3>
                               <p className="text-xs text-slate-500 leading-relaxed max-w-sm">Use a high-entropy passphrase as a fallback if biometric verification is temporarily unavailable.</p>
                           </div>
                       </div>
                       <button className="h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest transition-colors shrink-0">
                           Update Key
                       </button>
                    </div>
                 </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden">
                 <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div className="flex items-start gap-4">
                           <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                               <Smartphone className="h-5 w-5 text-emerald-600" />
                           </div>
                           <div>
                               <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm mb-1 flex items-center gap-2">Two-Factor Auth <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] tracking-widest px-1.5 py-0">ON</Badge></h3>
                               <p className="text-xs text-slate-500 leading-relaxed max-w-sm">Your administrative account is secured by default. Authenticator apps and hardware keys supported.</p>
                           </div>
                       </div>
                       <button className="h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest transition-colors shrink-0">
                           Configure
                       </button>
                    </div>
                 </CardContent>
              </Card>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
