import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Phone, MapPin, ShieldCheck, CreditCard, Award, Activity, Lock } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | Tech Hill",
  description: "Manage your personal information and student portrait.",
};

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        take: 1,
      },
    },
  });

  if (!user) redirect("/login");

  const activeSubscription = user.subscriptions[0] || null;

  return (
    <StudentLayout title="Identity Portfolio" description="View and manage your student profile">
      <div className="max-w-4xl space-y-8 animate-fade-in relative z-10 pb-20">

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-700 to-indigo-900 border-0 p-8 lg:p-12 shadow-2xl shadow-blue-500/20 group">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-110">
            <User className="h-64 w-64 text-white" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="h-32 w-32 rounded-full bg-white/10 border-4 border-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-2xl relative">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.firstName} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-white uppercase">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
              )}
              {activeSubscription && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-2 border-2 border-indigo-900 shadow-xl" title="Premium Member">
                  <Award className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            
            <div className="text-white space-y-3">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h1 className="text-4xl font-black tracking-tight">{user.firstName} {user.lastName}</h1>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none shrink-0"><ShieldCheck className="h-3 w-3 mr-1" /> VERIFIED</Badge>
              </div>
              <p className="text-blue-200 text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4" /> {user.email}
              </p>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-blue-300 pt-2 justify-center md:justify-start">
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                {user.lastLoginAt && (
                   <>
                     <span className="h-1 w-1 rounded-full bg-blue-400"></span>
                     <span>Last active {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                   </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Identity Form (Readonly visualization for now, pre-filled) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl shadow-sm dark:shadow-none overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-6 bg-slate-50/50 dark:bg-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Personal Demographics</CardTitle>
                    <CardDescription>Your registered identity markers</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><User className="h-3 w-3 text-blue-500" /> First Name</Label>
                    <Input readOnly value={user.firstName} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-medium font-sans" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><User className="h-3 w-3 text-blue-500" /> Last Name</Label>
                    <Input readOnly value={user.lastName} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-medium font-sans" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Phone className="h-3 w-3 text-emerald-500" /> Phone Number</Label>
                    <Input readOnly value={user.phoneNumber || "-"} placeholder="Not provided" className={`h-12 ${!user.phoneNumber ? 'italic text-slate-400' : 'font-medium'} bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-sans`} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Calendar className="h-3 w-3 text-orange-500" /> Date of Birth</Label>
                    <Input readOnly value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "-"} placeholder="Not provided" className={`h-12 ${!user.dateOfBirth ? 'italic text-slate-400' : 'font-medium'} bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-sans`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><MapPin className="h-3 w-3 text-rose-500" /> Physical Address</Label>
                  <Input readOnly value={user.address || "-"} placeholder="Not provided" className={`h-12 ${!user.address ? 'italic text-slate-400' : 'font-medium'} bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-sans`} />
                </div>
                
                <div className="pt-4 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 max-w-none">
                    <span className="flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Identity verification handled by NextAuth</span>
                    <span className="uppercase tracking-widest font-black italic">Read-only View</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Access & Status Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl shadow-sm dark:shadow-none overflow-hidden">
              <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Access Level
                  </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSubscription ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-800/30">
                        <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500">
                             <Award className="h-6 w-6" />
                             <div>
                                 <h4 className="font-black uppercase tracking-tight">{activeSubscription.plan.name} Tier</h4>
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80 italic">Global Unlock Active</p>
                             </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-amber-200/50 dark:border-amber-800/30">
                             <div className="flex justify-between items-center text-sm font-medium">
                                 <span className="text-amber-700/70 dark:text-amber-400/70">Billed via</span>
                                 <span className="font-black text-amber-900 dark:text-amber-300">{activeSubscription.provider}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm font-medium">
                                 <span className="text-amber-700/70 dark:text-amber-400/70">Renews</span>
                                 <span className="font-black text-amber-900 dark:text-amber-300">
                                     {activeSubscription.nextBillingDate ? new Date(activeSubscription.nextBillingDate).toLocaleDateString() : 'Lifetime Access'}
                                 </span>
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-center">
                        <Lock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                        <h4 className="font-black text-slate-900 dark:text-white uppercase mb-1">Standard Access</h4>
                        <p className="text-xs font-medium text-slate-500 mb-4">Pay per course enrollment mode</p>
                        <Badge variant="outline" className="text-slate-500 uppercase tracking-widest font-black text-[10px]">No Active Master Plan</Badge>
                    </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl shadow-sm dark:shadow-none overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Telemetry Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 dark:text-slate-400 font-medium">System UUID</span>
                         <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{user.id.slice(-8).toUpperCase()}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 dark:text-slate-400 font-medium">Role Privilege</span>
                         <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] tracking-widest">{user.role}</Badge>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 dark:text-slate-400 font-medium">Account Status</span>
                         <Badge className="bg-emerald-500 border-none text-white font-black text-[10px] tracking-widest">{user.status}</Badge>
                     </div>
                </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}
