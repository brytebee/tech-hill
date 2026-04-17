import { PrismaClient, BadgeCategory } from "@prisma/client";

const prisma = new PrismaClient();

const BADGES = [
  {
    title: "Syllabus Initiator",
    description: "Enrolled in and completed your very first topic.",
    icon: "BookOpen",
    category: BadgeCategory.ACHIEVEMENT,
    xpThreshold: 50,
  },
  {
    title: "1K Explorer",
    description: "Earned 1,000 Total XP.",
    icon: "Zap",
    category: BadgeCategory.MILESTONE,
    xpThreshold: 1000,
  },
  {
    title: "5K Voyager",
    description: "Earned 5,000 Total XP.",
    icon: "Rocket",
    category: BadgeCategory.MILESTONE,
    xpThreshold: 5000,
  },
  {
    title: "10K Architect",
    description: "Astounding dedication. You have gathered 10,000 XP.",
    icon: "Crown",
    category: BadgeCategory.MILESTONE,
    xpThreshold: 10000,
  },
];

async function main() {
  console.log("🌱 Seeding Gamification Badges...");

  for (const badge of BADGES) {
    const existing = await prisma.identityBadge.findUnique({
      where: { title: badge.title },
    });

    if (!existing) {
      await prisma.identityBadge.create({
        data: badge,
      });
      console.log(`✅ Created Badge: ${badge.title}`);
    } else {
      await prisma.identityBadge.update({
        where: { id: existing.id },
        data: badge,
      });
      console.log(`🔄 Updated Badge: ${badge.title}`);
    }
  }

  console.log("✅ Gamification Seeding Complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
