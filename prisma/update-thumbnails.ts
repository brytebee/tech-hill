import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database thumbnail update...");

  // 1. Update Courses
  const coursesToUpdate = [
    { id: "cmqf33bmz002eyl8n9z2hkzex", thumbnail: "/images/courses/java_backend.png" },
    { id: "cmo02iqtc05mdppw0ozkeqcby", thumbnail: "/images/courses/nextjs_ai.png" },
    { id: "cmnyf4is8019oppw0208nsca5", thumbnail: "/images/courses/python_ai.png" },
    { id: "cmnnkbuvg00bfpphmq2oet5y2", thumbnail: "/images/courses/vanilla_js.png" },
    { id: "cmo08kv5h00hdppo9ijn5xewd", thumbnail: "/images/courses/tauri_desktop.png" },
    { id: "cmnnhn6aa004hpphmk2v0azyr", thumbnail: "/images/courses/html_foundations.png" },
  ];

  for (const c of coursesToUpdate) {
    const course = await prisma.course.findUnique({ where: { id: c.id } });
    if (course) {
      await prisma.course.update({
        where: { id: c.id },
        data: { thumbnail: c.thumbnail },
      });
      console.log(`✅ Updated Course: ${course.title} -> ${c.thumbnail}`);
    } else {
      console.warn(`⚠️ Course ID not found: ${c.id}`);
    }
  }

  // 2. Update Tracks
  const tracksToUpdate = [
    { id: "cmqf33b5l002cyl8nexy6kkew", thumbnail: "/images/courses/java_backend.png" },
    { id: "cmo00mi6k05d3ppw01a9rcdma", thumbnail: "/images/courses/nextjs_ai.png" },
    { id: "cmo03wzav05u8ppw0dcbn6vk3", thumbnail: "/images/courses/tauri_desktop.png" },
    { id: "cmnnhn6a4004fpphm9ktway28", thumbnail: "/images/courses/vanilla_js.png" },
    { id: "cmnnffeff0000pphm5jwmkyxd", thumbnail: "/images/courses/digital_foundation.png" },
  ];

  for (const t of tracksToUpdate) {
    const track = await prisma.track.findUnique({ where: { id: t.id } });
    if (track) {
      await prisma.track.update({
        where: { id: t.id },
        data: { thumbnail: t.thumbnail },
      });
      console.log(`✅ Updated Track: ${track.title} -> ${t.thumbnail}`);
    } else {
      console.warn(`⚠️ Track ID not found: ${t.id}`);
    }
  }

  console.log("🎉 Database thumbnail update complete!");
}

main()
  .catch((e) => {
    console.error("❌ Failed to update thumbnails:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
