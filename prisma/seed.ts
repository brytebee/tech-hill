import {
  PrismaClient,
  BillingInterval,
  Currency,
  UserRole,
  UserStatus,
  CourseStatus,
  DifficultyLevel,
  TopicType,
  QuestionType,
  DiscountType,
  TransactionType,
  TransactionStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding a robust database with Course Content & Commerce...");

  // --- 1. USERS ---
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@techhill.edu" },
    update: {},
    create: {
      email: "admin@techhill.edu",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "TechHill",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  console.log("✅ Users seeded (Admin & Student).");

  // --- 2. SUBSCRIPTION PLANS ---
  const plans = [
    {
      id: "pro_monthly",
      name: "Pro Monthly",
      description: "Full access to all premium courses.",
      price: 5000,
      currency: Currency.NGN,
      interval: BillingInterval.MONTHLY,
      features: ["All Courses", "Certificates Included", "Priority Support"],
      isActive: true,
      paystackPlanCode: "PLN_MONTHLY_001",
    },
    {
      id: "pro_yearly",
      name: "Pro Yearly",
      description: "Master skills with a full year of learning.",
      price: 50000,
      currency: Currency.NGN,
      interval: BillingInterval.YEARLY,
      features: ["All Courses", "2 Months Free", "Direct Mentorship"],
      isActive: true,
      paystackPlanCode: "PLN_YEARLY_001",
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }
  console.log("✅ Subscription plans seeded.");

  // --- 3. COURSES DATA ---
  const coursesData = [
    {
      id: "flagship-001",
      title: "Advanced Full-Stack Engineering with Next.js",
      description:
        "Comprehensive guide to building production-ready applications with React, Next.js, and Prisma. Learn enterprise patterns, authentication, and database optimization.",
      shortDescription: "Master Next.js 15, React 19 and Prisma.",
      status: CourseStatus.PUBLISHED,
      difficulty: DifficultyLevel.ADVANCED,
      duration: 40,
      price: 25000,
      isCertificateFree: false,
      certificatePrice: 5000,
      creatorId: admin.id,
      passingScore: 75,
      learningOutcomes: [
        "Architect scalable Next.js applications using the App Router",
        "Implement robust server actions and optimistic UI updates",
        "Master relational database design and type-safety with Prisma",
        "Secure apps with NextAuth.js and advanced middleware",
      ],
      modules: [
        {
          id: "m-flagship-1",
          title: "Foundations & Modern Architecture",
          order: 1,
          duration: 120,
          topics: [
            {
              id: "t-flagship-1-1",
              title: "The Next.js 15 App Router Deep Dive",
              slug: "nextjs-15-deep-dive",
              content:
                "In this lesson, we explore the evolution of the Next.js router. We'll cover layouts, templates, and the new caching mechanisms introduced in React 19.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 30,
              isPreview: true,
            },
            {
              id: "t-flagship-1-2",
              title: "Server vs. Client Components",
              slug: "server-vs-client",
              content:
                "Understanding where your code runs is crucial. This topic clarifies the 'use client' boundary and how to keep your bundles lean.",
              topicType: TopicType.LESSON,
              orderIndex: 2,
              duration: 45,
              isPreview: false,
            },
            {
              id: "t-flagship-1-3",
              title: "Architectural Foundations Quiz",
              slug: "arch-foundations-quiz",
              content:
                "Test your understanding of Next.js architectural fundamentals.",
              topicType: TopicType.ASSESSMENT,
              orderIndex: 3,
              duration: 15,
              isPreview: false,
              quiz: {
                id: "q-flagship-1",
                title: "Architecture Mastery Quiz",
                questions: [
                  {
                    id: "q-f-1-q1",
                    text: "Which directory is used for the modern routing system in Next.js?",
                    type: QuestionType.MULTIPLE_CHOICE,
                    options: [
                      { text: "pages", isCorrect: false },
                      { text: "app", isCorrect: true },
                      { text: "routes", isCorrect: false },
                      { text: "src", isCorrect: false },
                    ],
                  },
                  {
                    id: "q-f-1-q2",
                    text: "Do Server Components increase the client bundle size?",
                    type: QuestionType.TRUE_FALSE,
                    options: [
                      { text: "True", isCorrect: false },
                      { text: "False", isCorrect: true },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          id: "m-flagship-2",
          title: "Database Mastery with Prisma",
          order: 2,
          duration: 180,
          topics: [
            {
              id: "t-flagship-2-1",
              title: "Schema Design Patterns",
              slug: "prisma-schema-design",
              content:
                "Learn how to design efficient relational schemas. We'll cover one-to-many, many-to-many, and polymorphic relations using Prisma's SDL.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 60,
              isPreview: false,
            },
          ],
        },
      ],
    },
    {
      id: "intro-001",
      title: "Introduction to Computer Literacy",
      description:
        "Essential skills for navigating the digital world. Learn about hardware, software, internet safety, and productivity tools.",
      shortDescription: "Get started with computers safely.",
      status: CourseStatus.PUBLISHED,
      difficulty: DifficultyLevel.BEGINNER,
      duration: 10,
      price: 0,
      isCertificateFree: true,
      creatorId: admin.id,
      modules: [
        {
          id: "m-intro-1",
          title: "Hardware Fundamentals",
          order: 1,
          duration: 60,
          topics: [
            {
              id: "t-intro-1-1",
              title: "Anatomy of a Computer",
              slug: "computer-anatomy",
              content:
                "From the CPU to RAM, understand the physical components that make a computer work.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 20,
              isPreview: true,
            },
            {
              id: "t-intro-1-2",
              title: "Hardware Basics Quiz",
              slug: "hardware-basics-quiz",
              content: "Quick check on computer component knowledge.",
              topicType: TopicType.ASSESSMENT,
              orderIndex: 2,
              duration: 10,
              isPreview: false,
              quiz: {
                id: "q-intro-1",
                title: "Hardware 101 Quiz",
                questions: [
                  {
                    id: "q-i-1-q1",
                    text: "What does CPU stand for?",
                    type: QuestionType.MULTIPLE_CHOICE,
                    options: [
                      { text: "Central Processing Unit", isCorrect: true },
                      { text: "Computer Power Utility", isCorrect: false },
                      { text: "Core Program Unit", isCorrect: false },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ];

  // --- SEED COURSES, MODULES, TOPICS, QUIZZES ---
  for (const cData of coursesData) {
    const course = await (prisma as any).course.upsert({
      where: { id: cData.id },
      update: {
        title: cData.title,
        description: cData.description,
        shortDescription: cData.shortDescription,
        status: cData.status,
        difficulty: cData.difficulty,
        duration: cData.duration,
        price: cData.price,
        isCertificateFree: cData.isCertificateFree,
        certificatePrice: cData.certificatePrice,
        learningOutcomes: cData.learningOutcomes || [],
      },
      create: {
        id: cData.id,
        title: cData.title,
        description: cData.description,
        shortDescription: cData.shortDescription,
        status: cData.status,
        difficulty: cData.difficulty,
        duration: cData.duration,
        price: cData.price,
        isCertificateFree: cData.isCertificateFree,
        certificatePrice: cData.certificatePrice,
        creatorId: cData.creatorId,
        learningOutcomes: cData.learningOutcomes || [],
      } as any,
    });

    for (const mData of cData.modules || []) {
      const module = await (prisma as any).module.upsert({
        where: { id: mData.id },
        update: {
          title: mData.title,
          order: mData.order,
          duration: mData.duration,
          courseId: course.id,
        },
        create: {
          id: mData.id,
          title: mData.title,
          order: mData.order,
          duration: mData.duration,
          courseId: course.id,
        },
      });

      for (const tData of mData.topics || []) {
        const topic = await (prisma as any).topic.upsert({
          where: { id: tData.id },
          update: {
            title: tData.title,
            slug: tData.slug,
            content: tData.content,
            topicType: tData.topicType,
            orderIndex: tData.orderIndex,
            duration: tData.duration,
            moduleId: module.id,
            isPreview: tData.isPreview,
          },
          create: {
            id: tData.id,
            title: tData.title,
            slug: tData.slug,
            content: tData.content,
            topicType: tData.topicType,
            orderIndex: tData.orderIndex,
            duration: tData.duration,
            moduleId: module.id,
            isPreview: tData.isPreview,
          } as any,
        });

        if (tData.quiz) {
          const quiz = await (prisma as any).quiz.upsert({
            where: { id: tData.quiz.id },
            update: {
              title: tData.quiz.title,
              topicId: topic.id,
            },
            create: {
              id: tData.quiz.id,
              topicId: topic.id,
              title: tData.quiz.title,
              passingScore: 70,
            },
          });

          for (const q of tData.quiz.questions) {
            const question = await (prisma as any).question.upsert({
              where: { id: q.id },
              update: {
                questionText: q.text,
                questionType: q.type,
              },
              create: {
                id: q.id,
                quizId: quiz.id,
                questionText: q.text,
                questionType: q.type,
                orderIndex: 1,
              } as any,
            });

            // Handle options - simpler to recreate them for seed
            await (prisma as any).option.deleteMany({
              where: { questionId: question.id },
            });

            for (let i = 0; i < q.options.length; i++) {
              const o = q.options[i];
              await (prisma as any).option.create({
                data: {
                  questionId: question.id,
                  text: o.text,
                  isCorrect: o.isCorrect,
                  orderIndex: i + 1,
                },
              });
            }
          }
        }
      }
    }
  }

  console.log("✅ Courses, Modules, Topics, and Quizzes seeded.");

  // --- 5. FLASH SALES ---
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await (prisma as any).flashSale.upsert({
    where: { id: "launch_special" },
    update: {
      name: "Launch Special",
      discountPercentage: 20,
      startTime: now,
      endTime: nextWeek,
      isActive: true,
    },
    create: {
      id: "launch_special",
      name: "Launch Special",
      discountPercentage: 20,
      startTime: now,
      endTime: nextWeek,
      isActive: true,
      courses: {
        connect: { id: "flagship-001" },
      },
    } as any,
  });

  console.log("✅ Flash Sales seeded (20% off Flagship).");

  // --- 6. COUPONS ---
  const couponsData = [
    {
      id: "cpn-global",
      code: "GLOBAL10",
      description: "10% off everything",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      maxUses: 100,
      isActive: true,
    },
    {
      id: "cpn-nextjs",
      code: "NEXTJS50",
      description: "50% off Next.js Masterclass",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 50,
      isActive: true,
    },
    {
      id: "cpn-welcome",
      code: "WELCOME_PRO",
      description: "Save ₦10,000 on Yearly Pro",
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 10000,
      isActive: true,
    },
  ];

  for (const cp of couponsData) {
    await (prisma as any).coupon.upsert({
      where: { id: cp.id },
      update: cp,
      create: cp as any,
    });
  }

  // Restrictions
  await (prisma as any).coursesOnCoupons.upsert({
    where: {
      courseId_couponId: { courseId: "flagship-001", couponId: "cpn-nextjs" },
    },
    update: {},
    create: { courseId: "flagship-001", couponId: "cpn-nextjs" },
  });

  await (prisma as any).plansOnCoupons.upsert({
    where: {
      planId_couponId: { planId: "pro_yearly", couponId: "cpn-welcome" },
    },
    update: {},
    create: { planId: "pro_yearly", couponId: "cpn-welcome" },
  });

  console.log("✅ Coupons seeded with restrictions.");

  // --- 7. TRANSACTIONS ---
  await (prisma as any).transaction.deleteMany({
    where: { reference: { startsWith: "TEST-REF-" } },
  });

  await (prisma as any).transaction.create({
    data: {
      userId: student.id,
      amount: 25000,
      status: TransactionStatus.SUCCESS,
      type: TransactionType.COURSE_PURCHASE,
      reference: "TEST-REF-MANUAL-" + Date.now(),
      provider: "PAYSTACK",
      courseId: "flagship-001",
    } as any,
  });

  console.log("🚀 Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
