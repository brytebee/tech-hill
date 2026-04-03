/**
 * prisma/seed-plans.ts
 *
 * Seeds the subscription Plan table with Tech Hill's pricing tiers.
 * Run with:  npx ts-node prisma/seed-plans.ts
 * Or add to package.json scripts and run:  npm run seed:plans
 *
 * Plans:
 *   Track Subscriptions (monthly + annual):
 *     1. Digital Literacy     — ₦6,500/mo  | ₦62,400/yr (~20% off)
 *     2. Frontend Engineering — ₦9,999/mo  | ₦95,990/yr (~20% off)
 *     3. Professional Training— ₦9,999/mo  | ₦95,990/yr (~20% off)
 *   All-Access:
 *     4. Pro All-Access       — ₦15,000/mo | ₦144,000/yr (~20% off)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLANS = [
  // ── Digital Literacy ─────────────────────────────────────────────────────
  {
    name: "Digital Literacy — Monthly",
    description: "Perfect for beginners. Computer basics, internet skills, and productivity tools — with weekly live sessions.",
    price: 6500,
    interval: "MONTHLY" as const,
    features: [
      "All Digital Literacy courses",
      "Weekly live coding session",
      "Session recording (7 days)",
      "Track community access",
      "Progress tracking",
      "Completion certificates",
    ],
  },
  {
    name: "Digital Literacy — Annual",
    description: "Same as monthly, billed annually. Save ~20% vs paying month-by-month.",
    price: 62400,  // ₦6,500 × 12 × 0.8 = ₦62,400
    interval: "YEARLY" as const,
    features: [
      "All Digital Literacy courses",
      "Weekly live coding session",
      "Session recording (7 days)",
      "Track community access",
      "Progress tracking",
      "Completion certificates",
      "Priority support",
    ],
  },

  // ── Frontend Engineering ──────────────────────────────────────────────────
  {
    name: "Frontend Engineering — Monthly",
    description: "HTML, CSS, JavaScript, React, TypeScript, and Next.js. Live sessions every week covering real-world problems.",
    price: 9999,
    interval: "MONTHLY" as const,
    features: [
      "All Frontend Engineering courses",
      "Weekly live coding session",
      "Session recording (7 days)",
      "Track community access",
      "Progress tracking",
      "Completion certificates",
    ],
  },
  {
    name: "Frontend Engineering — Annual",
    description: "Full frontend track, billed annually. Save ~20% and lock in today's rate.",
    price: 95990,  // ₦9,999 × 12 × 0.8 ≈ ₦95,990
    interval: "YEARLY" as const,
    features: [
      "All Frontend Engineering courses",
      "Weekly live coding session",
      "Full session recording archive",
      "Track community access",
      "Portfolio review sessions",
      "Completion certificates",
      "Priority support",
    ],
  },

  // ── Professional Training ─────────────────────────────────────────────────
  {
    name: "Professional Training — Monthly",
    description: "Career development, workplace digital skills, presentations, and professional communication — ideal for corporate learners.",
    price: 9999,
    interval: "MONTHLY" as const,
    features: [
      "All Professional Training courses",
      "Weekly live session",
      "Session recording (7 days)",
      "Track community access",
      "Progress tracking",
      "Completion certificates",
    ],
  },
  {
    name: "Professional Training — Annual",
    description: "Full professional track, billed annually. Save ~20% and invest in your career.",
    price: 95990,
    interval: "YEARLY" as const,
    features: [
      "All Professional Training courses",
      "Weekly live session",
      "Full session recording archive",
      "Track community access",
      "LinkedIn profile review",
      "Completion certificates",
      "Priority support",
    ],
  },

  // ── Pro All-Access ────────────────────────────────────────────────────────
  {
    name: "Pro All-Access — Monthly",
    description: "Access every track, every live session, and the full recording archive. The complete Tech Hill experience.",
    price: 15000,
    interval: "MONTHLY" as const,
    features: [
      "All 3 tracks (+ future tracks)",
      "All weekly live sessions",
      "Full recording archive",
      "All community channels",
      "Progress tracking across tracks",
      "All completion certificates",
      "Priority support",
      "Early access to new tracks",
    ],
  },
  {
    name: "Pro All-Access — Annual",
    description: "The full platform, billed annually. Save ~20% and get everything Tech Hill offers.",
    price: 144000,  // ₦15,000 × 12 × 0.8 = ₦144,000
    interval: "YEARLY" as const,
    features: [
      "All 3 tracks (+ future tracks)",
      "All weekly live sessions",
      "Full recording archive",
      "All community channels",
      "Progress tracking across tracks",
      "All completion certificates",
      "Priority support",
      "Early access to new tracks",
      "Annual cohort networking event",
    ],
  },
];

async function main() {
  console.log("🌱  Seeding subscription plans...\n");

  for (const plan of PLANS) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: plan.name },
    });

    let upserted;
    if (existingPlan) {
      upserted = await prisma.plan.update({
        where: { id: existingPlan.id },
        data: {
          description: plan.description,
          price: plan.price,
          interval: plan.interval,
          features: plan.features,
          isActive: true,
        },
      });
    } else {
      upserted = await prisma.plan.create({
        data: {
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: "NGN",
          interval: plan.interval,
          features: plan.features,
          isActive: true,
        },
      });
    }
    console.log(`  ✅  ${upserted.name}  —  ₦${Number(upserted.price).toLocaleString()}/${upserted.interval.toLowerCase()}`);
  }

  console.log(`\n🎉  ${PLANS.length} plans seeded successfully.`);
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
