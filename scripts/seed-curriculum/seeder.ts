import { PrismaClient, DifficultyLevel, TopicType, QuestionType, QuestionDifficulty } from '@prisma/client';
import { CURRICULUM } from './curriculum.config';
import { generateTopicContent, GeneratedTopicData } from './ollama.client';

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const isClearDemo = args.includes('--clear-demo');
const creatorArg = args.find(a => a.startsWith('--creator='));
const creatorEmail = creatorArg ? creatorArg.split('=')[1] : null;

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function formatContentWithFlags(content: string, flags: string[]): string {
  if (!flags || flags.length === 0) return content;
  
  const flagHtml = `
<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 1rem; margin-bottom: 2rem;">
  <strong style="color: #b45309; display: block; margin-bottom: 0.5rem;">⚠️ Admin Review Required (AI Flag):</strong>
  <ul style="color: #92400e; margin: 0; padding-left: 1.5rem;">
    ${flags.map(f => `<li>${f}</li>`).join('')}
  </ul>
</div>
  `;
  return flagHtml + '\n\n' + content;
}

async function main() {
  console.log("🌱 Tech Hill Curriculum Seeder Initiated");

  let creatorId: string;

  if (creatorEmail) {
    const user = await prisma.user.findUnique({ where: { email: creatorEmail } });
    if (!user) {
      console.error(`❌ Creator with email ${creatorEmail} not found.`);
      process.exit(1);
    }
    creatorId = user.id;
  } else {
    // Find first admin
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (admin) {
      creatorId = admin.id;
      console.log(`👤 Using existing admin: ${admin.email}`);
    } else {
      console.error("❌ No ADMIN user found in DB. Please specify --creator=email@example.com");
      process.exit(1);
    }
  }

  if (isClearDemo) {
    console.log("🧹 --clear-demo flag provided. Searching for dev/lorem courses...");
    const allCourses = await prisma.course.findMany({
      include: { modules: { include: { topics: true } } }
    });
    
    for (const course of allCourses) {
      // Check if it looks like demo content (e.g. contains 'lorem')
      let isDemo = course.title.toLowerCase().includes("lorem") || course.description.toLowerCase().includes("lorem");
      if (!isDemo && course.modules.length > 0 && course.modules[0].topics.length > 0) {
        if (course.modules[0].topics[0].content.toLowerCase().includes("lorem")) {
          isDemo = true;
        }
      }
      
      if (isDemo) {
        console.log(`🗑️ Deleting demo course: "${course.title}"`);
        await prisma.course.delete({ where: { id: course.id } });
      }
    }
  }

  for (const trackData of CURRICULUM) {
    console.log(`\n======================================`);
    console.log(`🛣️  PROCESSING TRACK: ${trackData.track.title}`);
    console.log(`======================================\n`);

    // Ensure Track exists
    let track = await prisma.track.findUnique({ where: { slug: trackData.track.slug } });
    if (!track) {
      track = await prisma.track.create({
        data: {
          title: trackData.track.title,
          slug: trackData.track.slug,
          description: `Comprehensive learning path for ${trackData.track.title}`,
          isPublished: false, 
        }
      });
      console.log(`✅ Created Track: ${track.title}`);
    } else {
      console.log(`⏩ Track exists: ${track.title}`);
    }

    let courseOrder = 1;
    for (const courseData of trackData.courses) {
      const courseTitle = courseData.title;

      // Check if course already exists
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
            status: "DRAFT", // Always draft for human review
            creatorId,
            requireSequentialCompletion: true
          }
        });

        // Link course to track
        await prisma.trackCourse.create({
          data: {
            trackId: track.id,
            courseId: course.id,
            order: courseOrder,
          }
        });
      } else {
        console.log(`\n📚 SYNCING EXISTING COURSE: "${courseTitle}"`);
      }

      let moduleOrder = 1;
      for (const modData of courseData.modules) {
        let mod = await prisma.module.findFirst({ where: { courseId: course.id, title: modData.title } });
        if (!mod) {
          mod = await prisma.module.create({
            data: {
              courseId: course.id,
              title: modData.title,
              order: moduleOrder,
              duration: modData.duration,
              passingScore: 80,
            }
          });
        }

        let topicOrder = 1;
        for (const topicData of modData.topics) {
          const topicSlug = slugify(`${courseTitle}-${topicData.title}`);
          const existingTopic = await prisma.topic.findFirst({ where: { slug: topicSlug, moduleId: mod.id } });
          
          if (existingTopic) {
            console.log(`  ⏩ Skipping existing Topic: "${topicData.title}"`);
          } else {
            console.log(`  ➤ Calling Ollama for Topic: "${topicData.title}"...`);
            
            try {
              // The heavy lifting
              const generatedData: GeneratedTopicData = await generateTopicContent(
                topicData.title,
                courseTitle,
                (topicData as any).externalUrl,
                (topicData as any).isProject
              );

              const formattedContent = formatContentWithFlags(generatedData.lessonContent, generatedData.flags);

              // 1. Create Topic
              const topic = await prisma.topic.create({
                data: {
                  moduleId: mod.id,
                  title: topicData.title,
                  slug: topicSlug,
                  content: formattedContent,
                  orderIndex: topicOrder,
                  topicType: (topicData as any).isProject ? "PRACTICE" : "LESSON",
                  passingScore: 80,
                  isRequired: true,
                }
              });

              // 2. Create Quiz inside Topic
              if (generatedData.quizData && generatedData.quizData.questions && generatedData.quizData.questions.length > 0) {
                const quiz = await prisma.quiz.create({
                  data: {
                    topicId: topic.id,
                    title: `Knowledge Check: ${topicData.title}`,
                    passingScore: generatedData.quizData.passingScore || 80,
                    isActive: true,
                  }
                });

                // 3. Create Questions & Options
                let qIndex = 1;
                for (const q of generatedData.quizData.questions) {
                  const question = await prisma.question.create({
                    data: {
                      quizId: quiz.id,
                      questionText: q.text,
                      explanation: q.explanation,
                      orderIndex: qIndex,
                      questionType: "MULTIPLE_CHOICE",
                      difficulty: q.difficulty?.toUpperCase() as QuestionDifficulty || "MEDIUM",
                      points: 10
                    }
                  });

                  let oIndex = 1;
                  for (const opt of q.options) {
                    await prisma.option.create({
                      data: {
                        questionId: question.id,
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        orderIndex: oIndex
                      }
                    });
                    oIndex++;
                  }
                  qIndex++;
                }
              }

              console.log(`  ✅ Inserted Topic & Quiz: "${topicData.title}"`);
              
            } catch (err: any) {
              console.error(`  ❌ Failed to generate/insert topic "${topicData.title}":`, err.message);
              // We catch and continue so one failing topic doesn't kill the whole track
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
  console.log("Next steps: Go to /admin/courses to review DRAFT content and publish.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
