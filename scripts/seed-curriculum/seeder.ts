import { PrismaClient, DifficultyLevel, QuestionDifficulty } from "@prisma/client";
import { CURRICULUM, TrackConfig, CourseConfig, ModuleConfig, TopicConfig } from "./curriculum.config";
import { generateTopicContent, GeneratedTopicData, generateQuizOnly } from "./ollama.client";
import { IngestionService } from "./ingestion.service";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const isClearDemo = args.includes("--clear-demo");
const isFast = args.includes("--fast"); // Skip editorial review (Call 3) for speed
const creatorArg = args.find((a) => a.startsWith("--creator="));
const creatorEmail = creatorArg ? creatorArg.split("=")[1] : null;

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Seeder-local evolution hook.
 * Called when a NEW REQUIRED topic is inserted into an existing course.
 * Re-opens any COMPLETED enrollments and notifies affected students.
 */
async function reopenCompletedEnrollments(
  courseId: string,
  moduleId: string,
  topicTitle: string,
  courseTitle: string
) {
  const completed = await prisma.enrollment.findMany({
    where: { courseId, status: "COMPLETED" },
  });
  if (completed.length === 0) return;

  for (const enrollment of completed) {
    const userId = enrollment.userId;

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "ACTIVE", completedAt: null, overallProgress: 95 },
    });

    // Revert the affected module from COMPLETED → IN_PROGRESS
    const mp = await prisma.moduleProgress.findUnique({
      where: { userId_moduleId: { userId, moduleId } },
    });
    if (mp && mp.status === "COMPLETED") {
      await prisma.moduleProgress.update({
        where: { id: mp.id },
        data: { status: "IN_PROGRESS", completedAt: null, progressPercentage: 90 },
      });
    }

    // Notify the student
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: "COURSE_UPDATE",
          title: `📚 New lesson added to "${courseTitle}"`,
          message: `We've expanded "${courseTitle}" with new required content: "${topicTitle}". Keep growing! 🚀`,
          linkUrl: `/student/courses/${courseId}`,
        },
      });
    } catch (_) {}
  }

  console.log(
    `  🔔 Reopened ${completed.length} completed enrollment(s) for "${courseTitle}" (new required topic added)`
  );
}

function formatContentWithFlags(content: string, flags: string[]): string {
  if (!flags || flags.length === 0) return content;

  const flagHtml = `
<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 1rem; margin-bottom: 2rem;">
  <strong style="color: #b45309; display: block; margin-bottom: 0.5rem;">⚠️ Admin Review Required (AI Flag):</strong>
  <ul style="color: #92400e; margin: 0; padding-left: 1.5rem;">
    ${flags.map((f) => `<li>${f}</li>`).join("")}
  </ul>
</div>
  `;
  return flagHtml + "\n\n" + content;
}

/**
 * Creates a Quiz + Questions + Options in the DB for a given topicId.
 * If `preGeneratedQuizData` is provided (new-topic path), it's used directly.
 * Otherwise (patch path), it calls Ollama Call 2 using the stored lesson content.
 */
async function generateAndSaveQuiz(
  topicId: string,
  topicTitle: string,
  lessonContent: string,
  preGeneratedQuizData?: any
): Promise<void> {
  const quizData = preGeneratedQuizData ?? (await generateQuizOnly(topicTitle, lessonContent));

  if (!quizData?.questions?.length) {
    console.warn(`  ⚠️ No quiz questions returned for "${topicTitle}" — skipping quiz creation.`);
    return;
  }

  const quiz = await prisma.quiz.create({
    data: {
      topicId,
      title: `Knowledge Check: ${topicTitle}`,
      passingScore: quizData.passingScore || 80,
      isActive: true,
    },
  });

  let qIndex = 1;
  for (const q of quizData.questions) {
    const question = await prisma.question.create({
      data: {
        quizId: quiz.id,
        questionText: q.text,
        explanation: q.explanation,
        orderIndex: qIndex,
        questionType: "MULTIPLE_CHOICE",
        difficulty: (q.difficulty?.toUpperCase() as QuestionDifficulty) || "MEDIUM",
        points: 10,
      },
    });

    let oIndex = 1;
    for (const opt of q.options) {
      await prisma.option.create({
        data: {
          questionId: question.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          orderIndex: oIndex,
        },
      });
      oIndex++;
    }
    qIndex++;
  }
}

async function main() {
  console.log("🌱 Tech Hill Curriculum Seeder Initiated");
  if (isFast) console.log("⚡ --fast mode: Skipping editorial review (Call 3).");

  let creatorId: string;

  if (creatorEmail) {
    const user = await prisma.user.findUnique({ where: { email: creatorEmail } });
    if (!user) {
      console.error(`❌ Creator with email ${creatorEmail} not found.`);
      process.exit(1);
    }
    creatorId = user.id;
  } else {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (admin) {
      creatorId = admin.id;
      console.log(`👤 Using existing admin: ${admin.email}`);
    } else {
      console.error("❌ No ADMIN user found. Use --creator=email@example.com");
      process.exit(1);
    }
  }

  // ── Clear demo content if requested ──────────────────────────────────────
  if (isClearDemo) {
    console.log("🧹 --clear-demo: Scanning for lorem ipsum courses...");
    const allCourses = await prisma.course.findMany({
      include: { modules: { include: { topics: true } } },
    });

    for (const course of allCourses) {
      let isDemo =
        course.title.toLowerCase().includes("lorem") ||
        course.description.toLowerCase().includes("lorem");

      if (!isDemo && course.modules[0]?.topics[0]?.content?.toLowerCase().includes("lorem")) {
        isDemo = true;
      }

      if (isDemo) {
        console.log(`🗑️  Deleting demo course: "${course.title}"`);
        await prisma.course.delete({ where: { id: course.id } });
      }
    }
  }

  // ── Main Seeding Loop ─────────────────────────────────────────────────────
  for (const trackData of CURRICULUM) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`🛣️  PROCESSING TRACK: ${trackData.track.title}`);
    console.log(`${"=".repeat(50)}\n`);

    // Ensure Track exists (upsert by slug)
    const track = await (prisma as any).track.upsert({
      where: { slug: trackData.track.slug },
      update: {
        title: trackData.track.title,
        price: (trackData.track as any).price ?? 0,
      },
      create: {
        title: trackData.track.title,
        slug: trackData.track.slug,
        description: `Comprehensive learning path for ${trackData.track.title}`,
        isPublished: false,
        price: (trackData.track as any).price ?? 0,
      },
    });
    console.log(`✅ Synced Track: ${track.title} (Price: ₦${(track as any).price})`);

    // ── FIX: Reset courseOrder per track ──────────────────────────────────
    let courseOrder = 1;

    for (const courseData of trackData.courses) {
      const courseTitle = courseData.title;
      const courseSlug = slugify(courseTitle);

      let course = await prisma.course.findFirst({ where: { title: courseTitle } });

      if (!course) {
        console.log(`\n📚 MINTING COURSE: "${courseTitle}"`);
        course = await prisma.course.create({
          data: {
            title: courseTitle,
            description: courseData.description,
            shortDescription: courseData.shortDescription,
            difficulty: courseData.difficulty as DifficultyLevel,
            duration: courseData.duration,
            price: courseData.price ?? 0,
            tags: courseData.tags ?? [],
            learningOutcomes: courseData.learningOutcomes ?? [],
            earningPotential: courseData.earningPotential ? (courseData.earningPotential as any) : undefined,
            status: "DRAFT",
            creatorId,
            requireSequentialCompletion: true,
          },
        });
        console.log(`  ✅ Course created: "${courseTitle}"`);
      } else {
        console.log(`\n📚 SYNCING EXISTING COURSE: "${courseTitle}"`);
        await prisma.course.update({
          where: { id: course.id },
          data: {
            price: courseData.price ?? 0,
            duration: courseData.duration,
            difficulty: courseData.difficulty as DifficultyLevel,
            shortDescription: courseData.shortDescription,
            earningPotential: courseData.earningPotential ? (courseData.earningPotential as any) : undefined,
          },
        });
        console.log(`  ✅ Synced Kurs Metadata & Price: ₦${courseData.price}`);
      }

      // ── FIX: Always link course to track and handle unique constraint collisions ─────
      // If another course currently holds this order in the track, move it out of the way
      const conflict = await prisma.trackCourse.findUnique({
        where: { trackId_order: { trackId: track.id, order: courseOrder } },
      });
      if (conflict && conflict.courseId !== course.id) {
        await prisma.trackCourse.update({
          where: { id: conflict.id },
          data: { order: -(1000 + Math.floor(Math.random() * 1000000)) },
        });
      }

      await prisma.trackCourse.upsert({
        where: { trackId_courseId: { trackId: track.id, courseId: course.id } },
        create: { trackId: track.id, courseId: course.id, order: courseOrder },
        update: { order: courseOrder }, // Now safe to update because the slot is guaranteed free
      });

      // ── FIX: Bulk preload modules + topics to eliminate N+1 queries ───────
      const existingModules = await prisma.module.findMany({
        where: { courseId: course.id },
        select: { id: true, title: true },
      });
      const moduleMap = new Map(existingModules.map((m) => [m.title, m.id]));

      // Preload all topics for this course's known modules
      const moduleIds = existingModules.map((m) => m.id);
      const existingTopics =
        moduleIds.length > 0
          ? await prisma.topic.findMany({
              where: { moduleId: { in: moduleIds } },
              select: {
                id: true,
                slug: true,
                moduleId: true,
                content: true,
                _count: { select: { quizzes: true } },
              },
            })
          : [];
      // Build a map of "moduleId::slug" → { topicId, hasQuiz, content } for O(1) lookups + quiz patching
      const topicLookup = new Map(
        existingTopics.map((t) => [
          `${t.moduleId}::${t.slug}`,
          { topicId: t.id, hasQuiz: t._count.quizzes > 0, content: t.content },
        ])
      );

      // ── Module Loop ───────────────────────────────────────────────────────
      let moduleOrder = 1;
      for (const modData of courseData.modules) {
        let modId = moduleMap.get(modData.title);

        if (!modId) {
          const newMod = await prisma.module.create({
            data: {
              courseId: course.id,
              title: modData.title,
              order: moduleOrder,
              duration: modData.duration,
              passingScore: 80,
            },
          });
          modId = newMod.id;
          moduleMap.set(modData.title, modId);
        }

        // ── Topic Loop ────────────────────────────────────────────────────
        let topicOrder = 1;
        for (const topicData of modData.topics) {
          // ── FIX: Scope slug to module to avoid cross-course collisions ──
          const topicSlug = slugify(`${courseSlug}-${modData.title}-${topicData.title}`);
          const lookupKey = `${modId}::${topicSlug}`;

          const existingEntry = topicLookup.get(lookupKey);

          if (existingEntry && existingEntry.hasQuiz) {
            // Topic exists and already has a quiz — fully skip
            console.log(`  ⏩ Skipping (exists + quiz present): "${topicData.title}"`);
          } else if (existingEntry && !existingEntry.hasQuiz) {
            // Topic exists but was seeded without a quiz — patch it
            console.log(`  🩹 Patching missing quiz for: "${topicData.title}"...`);
            try {
              await generateAndSaveQuiz(
                existingEntry.topicId,
                topicData.title,
                existingEntry.content
              );
              console.log(`  ✅ Quiz patched: "${topicData.title}"`);
              // Update in-memory map so subsequent iterations reflect the patch
              existingEntry.hasQuiz = true;
            } catch (err: any) {
              console.error(`  ❌ Failed to patch quiz for "${topicData.title}": ${err.message}`);
            }
          } else {
            console.log(`  ➤ Calling Ollama for Topic: "${topicData.title}"...`);

            try {
              // Fetch live RAG context if sourceUrls are defined
              let liveContext: string | undefined;
              if (topicData.sourceUrls && topicData.sourceUrls.length > 0) {
                liveContext = await IngestionService.ingestUrlsSeq(topicData.sourceUrls);
              }

              const generatedData: GeneratedTopicData = await generateTopicContent(
                topicData.title,
                courseTitle,
                topicData.externalUrl,
                topicData.isProject ?? false,
                liveContext
              );

              const formattedContent = formatContentWithFlags(
                generatedData.lessonContent,
                generatedData.flags
              );

              // 1. Create Topic
              const topic = await prisma.topic.create({
                data: {
                  moduleId: modId,
                  title: topicData.title,
                  slug: topicSlug,
                  content: formattedContent,
                  orderIndex: topicOrder,
                  topicType: topicData.isProject ? "PRACTICE" : "LESSON",
                  passingScore: 80,
                  isRequired: true,
                  // Gated Further Research — unlocks in UI after quiz pass (≥80%)
                  furtherReadingLinks: topicData.furtherReading
                    ? (topicData.furtherReading as unknown as import("@prisma/client").Prisma.InputJsonValue)
                    : undefined,
                },
              });

              // Option 2+4: Re-open any COMPLETED enrollments since we just added a required topic
              await reopenCompletedEnrollments(course.id, modId, topicData.title, courseTitle);

              // Mark as seen in our in-memory map for idempotency within the same run
              topicLookup.set(lookupKey, { topicId: topic.id, hasQuiz: false, content: formattedContent });

              // 2. Create Quiz & Questions
              if (
                generatedData.quizData?.questions &&
                generatedData.quizData.questions.length > 0
              ) {
                await generateAndSaveQuiz(topic.id, topicData.title, formattedContent, generatedData.quizData);
                // Mark as having quiz in our in-memory map
                const entry = topicLookup.get(lookupKey);
                if (entry) entry.hasQuiz = true;
              }

              console.log(`  ✅ Inserted Topic & Quiz: "${topicData.title}"`);
            } catch (err: any) {
              console.error(
                `  ❌ Failed to generate "${topicData.title}": ${err.message}`
              );
              // Continue: one bad topic does not kill the whole track
            }
          }
          topicOrder++;
        }
        moduleOrder++;
      }
      courseOrder++;
    }
  }

  console.log("\n🎉 Curriculum Seeding Complete!");
  console.log("Next: Visit /admin/courses to review DRAFT content and publish.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
