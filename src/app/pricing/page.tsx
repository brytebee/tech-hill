import { prisma } from "@/lib/db";
import { PricingClient } from "@/components/pricing/PricingClient";

import { PublicHeader } from "@/components/layout/PublicHeader";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  // Serialize Decimal to string for Client Component
  const serializedPlans = plans.map((plan) => ({
    ...plan,
    price: plan.price.toString(),
  }));

  return (
    <div className="dark min-h-screen flex flex-col bg-slate-50 dark:bg-[#080e1a] selection:bg-blue-500/30">
      <PublicHeader />
      <main className="flex-1">
        <PricingClient plans={serializedPlans} />
      </main>
      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} Tech Hill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
