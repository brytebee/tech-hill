// app/(dashboard)/admin/promotions/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag, Zap, Calendar, TrendingDown, Users, Ticket, Rocket, Sparkles, Percent, Package, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

async function getPromotionsData() {
  const [coupons, flashSales, coursesCount] = await Promise.all([
    prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.flashSale.findMany({
      include: {
        courses: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.course.count()
  ]);

  return { coupons, flashSales, coursesCount };
}

export default async function AdminPromotionsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { coupons, flashSales, coursesCount } = await getPromotionsData();

  const activeCouponsCount = coupons.filter(c => c.isActive && (!c.expiresAt || new Date(c.expiresAt) > new Date())).length;
  const activeFlashSalesCount = flashSales.filter(f => f.isActive && new Date(f.startTime) <= new Date() && new Date(f.endTime) >= new Date()).length;

  return (
    <AdminLayout
      title="Promotions Engine"
      description="Orchestrate discount strategies and campaign dynamics to maximize platform growth"
    >
      <div className="space-y-10 animate-fade-in">
        
        {/* Dynamic Summary Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all hover:shadow-indigo-500/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Coupons</CardTitle>
              <Ticket className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{activeCouponsCount}</div>
              <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1.5">
                <Activity className="h-3 w-3" /> Synchronization across {coupons.length} units
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all hover:shadow-orange-500/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Flash Campaigns</CardTitle>
              <Zap className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{activeFlashSalesCount}</div>
              <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> High-velocity conversions active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all hover:shadow-emerald-500/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Targetable Assets</CardTitle>
              <Package className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{coursesCount}</div>
              <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1.5">
                <TrendingDown className="h-3 w-3" /> Eligible for discount sequence
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          
          {/* Flash Sales Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
                    <Rocket className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Flash Matrix</h3>
                    <p className="text-sm font-medium text-slate-500">Temporal price manipulation</p>
                </div>
              </div>
              <Link href="/admin/promotions/flash/create">
                  <Button className="bg-orange-600 hover:bg-orange-500 text-white font-bold h-10 px-5 rounded-xl transition-all shadow-lg shadow-orange-500/20">
                    <Plus className="mr-2 h-4 w-4" /> Initialize Sale
                  </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {flashSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <Zap className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Active Campaigns Exhausted</p>
                  <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto mt-2">Deploy a flash sale sequence to stimulate rapid enrollment growth.</p>
                </div>
              ) : (
                flashSales.map((sale: any) => {
                  const now = new Date();
                  const isUpcoming = new Date(sale.startTime) > now;
                  const isEnded = new Date(sale.endTime) < now;
                  const isActive = sale.isActive && !isUpcoming && !isEnded;

                  return (
                    <div key={sale.id} className="group relative overflow-hidden p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1 pr-10">
                          <h4 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                            {sale.courses.map((c: any) => c.title).join(", ") || "Platform Wide"}
                          </h4>
                          <div className="flex items-center gap-3">
                              {isActive && <Badge className="bg-orange-500 text-white animate-pulse text-[10px] px-2 py-0.5 rounded-full font-black border-none">ACTIVE</Badge>}
                              {isUpcoming && <Badge className="bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-800 text-[10px] px-2 py-0.5 rounded-full font-black">UPCOMING</Badge>}
                              {isEnded && <Badge variant="outline" className="text-slate-400 border-slate-200 dark:border-slate-800 text-[10px] px-2 py-0.5 rounded-full font-black">EXPIRED</Badge>}
                              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                  <Percent className="h-3 w-3" /> {sale.discountPercentage} PERFORMANCE BOOST
                              </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> ENDS {format(new Date(sale.endTime), 'MMM d, HH:mm')}</span>
                        <span className="flex items-center gap-1.5 uppercase tracking-tighter italic">CAMPAIGN ID: {sale.id.slice(-8)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Coupons Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                        <Tag className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Code Registry</h3>
                        <p className="text-sm font-medium text-slate-500">Unique identifier discount keys</p>
                    </div>
                </div>
                <Link href="/admin/promotions/coupons/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 px-5 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                      <Plus className="mr-2 h-4 w-4" /> New Token
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
              {coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <Tag className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Registry Empty</p>
                  <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto mt-2">Initialize promotional tokens to drive targeted channel growth.</p>
                </div>
              ) : (
                coupons.map((coupon: any) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  const isMaxedOut = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
                  const isValid = coupon.isActive && !isExpired && !isMaxedOut;

                  return (
                    <div key={coupon.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5">
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-4">
                          <div className="font-mono font-black text-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/60 shadow-sm tracking-[0.2em]">
                            {coupon.code}
                          </div>
                          {!isValid && (
                            <Badge variant="outline" className="text-red-500 border-red-200/50 bg-red-50/30 font-black px-2 py-0.5 rounded-full text-[10px]">INACTIVE</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-slate-900 dark:text-white">
                            {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₦${Number(coupon.discountValue).toLocaleString()}`}
                            <span className="text-xs font-bold text-slate-500 ml-1 uppercase">Off</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center text-indigo-600 dark:text-indigo-400">
                                <Users className="h-3.5 w-3.5 mr-1.5" /> {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''} CLAIMS
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {coupon.expiresAt ? (
                                <span className="uppercase tracking-tighter">VALID UNTIL {format(new Date(coupon.expiresAt), 'MMM d, yyyy')}</span>
                            ) : (
                                <span className="uppercase tracking-tighter">INFINITE DURATION</span>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
