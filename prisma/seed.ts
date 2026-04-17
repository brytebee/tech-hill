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

/**
 * Premium, curated Unsplash thumbnails — clean, elegant, high-end.
 * Each URL is pinned to a specific photo ID so the seed is deterministic.
 */
const THUMBNAILS = {
  // --- Courses ---
  fullstack:
    "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=1280&q=85",
  computerLiteracy:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1280&q=85",
  python:
    "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1280&q=85",
  uiux:
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1280&q=85",
  mobile:
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1280&q=85",
  cybersecurity:
    "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1280&q=85",
  // --- Tracks (Career Paths) ---
  trackFullStack:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1280&q=85",
  trackData:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1280&q=85",
  trackDesign:
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1280&q=85",
};

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
      price: 75000,
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
      price: 750000,
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
    // ── 1. Full-Stack Engineering ────────────────────────────────────────────
    {
      id: "flagship-001",
      title: "Advanced Full-Stack Engineering with Next.js",
      description:
        "Comprehensive guide to building production-ready applications with React, Next.js, and Prisma. Learn enterprise patterns, authentication, and database optimization.",
      shortDescription: "Master Next.js 15, React 19 and Prisma.",
      status: CourseStatus.PUBLISHED,
      difficulty: DifficultyLevel.ADVANCED,
      duration: 40,
      price: 260000,
      thumbnail: THUMBNAILS.fullstack,
      isCertificateFree: false,
      certificatePrice: 20000,
      creatorId: admin.id,
      passingScore: 75,
      tags: ["Next.js", "React", "Prisma", "TypeScript"],
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
            {
              id: "t-flagship-2-2",
              title: "Server Actions & Mutations",
              slug: "server-actions-mutations",
              content:
                "Harness Next.js Server Actions to write secure, type-safe data mutations without building separate API routes.",
              topicType: TopicType.LESSON,
              orderIndex: 2,
              duration: 60,
              isPreview: false,
            },
          ],
        },
      ],
    },
    // ── 2. Computer Literacy ─────────────────────────────────────────────────
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
      thumbnail: THUMBNAILS.computerLiteracy,
      isCertificateFree: true,
      creatorId: admin.id,
      tags: ["Computers", "Internet", "Productivity", "Beginners"],
      learningOutcomes: [
        "Understand the anatomy of modern computers and peripherals",
        "Navigate the internet safely — avoiding scams and phishing",
        "Master productivity tools: Google Docs, Sheets, and Slides",
        "Send professional emails and manage files efficiently",
      ],
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
        {
          id: "m-intro-2",
          title: "Internet Safety & Productivity",
          order: 2,
          duration: 60,
          topics: [
            {
              id: "t-intro-2-1",
              title: "Staying Safe Online",
              slug: "online-safety-basics",
              content:
                "Learn the telltale signs of phishing emails, how to create strong passwords, and best practices for protecting your identity online.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 25,
              isPreview: true,
            },
            {
              id: "t-intro-2-2",
              title: "Google Workspace Essentials",
              slug: "google-workspace-essentials",
              content:
                "A practical walkthrough of Google Docs, Sheets, Drive, and Meet — the tools used by millions of businesses.",
              topicType: TopicType.LESSON,
              orderIndex: 2,
              duration: 30,
              isPreview: false,
            },
          ],
        },
      ],
    },
    // ── 3. Python & Data Science ─────────────────────────────────────────────
    {
      id: "python-001",
      title: "Python for Data Science & Machine Learning",
      description:
        "Build real-world data pipelines, predictive models, and visualizations. From Python basics to deploying ML models with scikit-learn and Pandas.",
      shortDescription: "Python, Pandas, scikit-learn & ML fundamentals.",
      status: CourseStatus.PUBLISHED,
      difficulty: DifficultyLevel.INTERMEDIATE,
      duration: 35,
      price: 200000,
      thumbnail: THUMBNAILS.python,
      isCertificateFree: false,
      certificatePrice: 15000,
      creatorId: admin.id,
      tags: ["Python", "Data Science", "Machine Learning", "Pandas"],
      learningOutcomes: [
        "Write clean, idiomatic Python for data manipulation",
        "Analyse datasets using Pandas and NumPy",
        "Visualise insights with Matplotlib and Seaborn",
        "Train and evaluate ML models using scikit-learn",
      ],
      modules: [
        {
          id: "m-python-1",
          title: "Python Fundamentals for Data Work",
          order: 1,
          duration: 150,
          topics: [
            {
              id: "t-python-1-1",
              title: "Python Environment Setup & Syntax",
              slug: "python-environment-setup",
              content:
                "Install Python, set up virtual environments, and get comfortable with variables, loops, functions, and list comprehensions.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 40,
              isPreview: true,
            },
            {
              id: "t-python-1-2",
              title: "Data Structures: Lists, Dicts & Sets",
              slug: "python-data-structures",
              content:
                "Master the core data structures that underpin every Python data pipeline — and understand when to use each.",
              topicType: TopicType.LESSON,
              orderIndex: 2,
              duration: 45,
              isPreview: false,
            },
            {
              id: "t-python-1-3",
              title: "Python Fundamentals Quiz",
              slug: "python-fundamentals-quiz",
              content: "Test your Python baseline before we dive into data.",
              topicType: TopicType.ASSESSMENT,
              orderIndex: 3,
              duration: 20,
              isPreview: false,
              quiz: {
                id: "q-python-1",
                title: "Python Basics Assessment",
                questions: [
                  {
                    id: "q-p-1-q1",
                    text: "Which data structure in Python stores key-value pairs?",
                    type: QuestionType.MULTIPLE_CHOICE,
                    options: [
                      { text: "List", isCorrect: false },
                      { text: "Dictionary", isCorrect: true },
                      { text: "Tuple", isCorrect: false },
                      { text: "Set", isCorrect: false },
                    ],
                  },
                  {
                    id: "q-p-1-q2",
                    text: "Pandas is primarily used for data manipulation.",
                    type: QuestionType.TRUE_FALSE,
                    options: [
                      { text: "True", isCorrect: true },
                      { text: "False", isCorrect: false },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          id: "m-python-2",
          title: "Data Analysis with Pandas & Visualisation",
          order: 2,
          duration: 180,
          topics: [
            {
              id: "t-python-2-1",
              title: "Loading & Cleaning Real Datasets",
              slug: "pandas-data-cleaning",
              content:
                "Work with CSV, JSON, and Excel files. Handle missing values, duplicates, and type mismatches using Pandas.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 60,
              isPreview: false,
            },
            {
              id: "t-python-2-2",
              title: "Visualising Data with Matplotlib",
              slug: "matplotlib-visualisation",
              content:
                "Create bar charts, scatter plots, histograms, and heatmaps that tell compelling data stories.",
              topicType: TopicType.LESSON,
              orderIndex: 2,
              duration: 50,
              isPreview: false,
            },
          ],
        },
      ],
    },
    // ── 4. UI/UX Design ──────────────────────────────────────────────────────
    {
      id: "design-001",
      title: "UI/UX Design Mastery: From Figma to Prototype",
      description:
        "Learn design thinking, user research, wireframing, and high-fidelity prototyping in Figma. Build a portfolio-ready case study from scratch.",
      shortDescription: "Figma, design systems, and UX research.",
      status: CourseStatus.PUBLISHED,
      difficulty: DifficultyLevel.INTERMEDIATE,
      duration: 28,
      price: 170000,
      thumbnail: THUMBNAILS.uiux,
      isCertificateFree: false,
      certificatePrice: 15000,
      creatorId: admin.id,
      tags: ["Figma", "UI Design", "UX Research", "Prototyping"],
      learningOutcomes: [
        "Apply the full design thinking process to real problems",
        "Conduct user interviews and synthesise findings into insights",
        "Build pixel-perfect, component-driven designs in Figma",
        "Prototype interactive flows and conduct usability tests",
      ],
      modules: [
        {
          id: "m-design-1",
          title: "Design Thinking & User Research",
          order: 1,
          duration: 120,
          topics: [
            {
              id: "t-design-1-1",
              title: "The Double Diamond Framework",
              slug: "double-diamond-framework",
              content:
                "Understand how world-class design teams use the discover → define → develop → deliver process to solve real user problems.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 35,
              isPreview: true,
            },
            {
              id: "t-design-1-2",
              title: "Conducting User Interviews",
              slug: "user-interview-techniques",
              content:
                "Craft interview scripts, recruit participants, and extract unbiased insights that shape product direction.",
              topicType: TopicType.LESSON,
              orderIndex: 2,
              duration: 40,
              isPreview: false,
            },
          ],
        },
        {
          id: "m-design-2",
          title: "Figma Essentials & Design Systems",
          order: 2,
          duration: 150,
          topics: [
            {
              id: "t-design-2-1",
              title: "Figma Foundations: Frames, Grids & Auto Layout",
              slug: "figma-foundations",
              content:
                "Master the building blocks of Figma — components, variants, auto layout, and design tokens that scale across a product.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 60,
              isPreview: false,
            },
            {
              id: "t-design-2-2",
              title: "Building a Design System from Scratch",
              slug: "design-system-from-scratch",
              content:
                "Create a fully documented design system — colour scales, typography, spacing, and component libraries — using Figma's variable system.",
              topicType: TopicType.LESSON,
              orderIndex: 2,
              duration: 60,
              isPreview: false,
            },
          ],
        },
      ],
    },
    // ── 5. React Native / Mobile ─────────────────────────────────────────────
    {
      id: "mobile-001",
      title: "Mobile App Development with React Native",
      description:
        "Ship iOS and Android apps from a single codebase. Build real features with Expo, React Navigation, and Supabase — and publish to both app stores.",
      shortDescription: "Build & ship cross-platform mobile apps with Expo.",
      status: CourseStatus.PUBLISHED,
      difficulty: DifficultyLevel.ADVANCED,
      duration: 32,
      price: 230000,
      thumbnail: THUMBNAILS.mobile,
      isCertificateFree: false,
      certificatePrice: 20000,
      creatorId: admin.id,
      tags: ["React Native", "Expo", "Mobile", "iOS", "Android"],
      learningOutcomes: [
        "Bootstrap cross-platform apps instantly with Expo",
        "Build navigation flows with React Navigation v6",
        "Integrate real-time data using Supabase",
        "Publish polished apps to the Apple App Store and Google Play",
      ],
      modules: [
        {
          id: "m-mobile-1",
          title: "React Native & Expo Foundations",
          order: 1,
          duration: 140,
          topics: [
            {
              id: "t-mobile-1-1",
              title: "Setting Up Your Mobile Dev Environment",
              slug: "mobile-dev-environment",
              content:
                "Install Expo CLI, configure simulators, and understand the file structure of a production React Native app.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 30,
              isPreview: true,
            },
            {
              id: "t-mobile-1-2",
              title: "Core Components: View, Text, Image & Stylesheets",
              slug: "react-native-core-components",
              content:
                "Master the fundamental building blocks — and understand how Stylesheets differ from web CSS.",
              topicType: TopicType.LESSON,
              orderIndex: 2,
              duration: 50,
              isPreview: false,
            },
            {
              id: "t-mobile-1-3",
              title: "RN Foundations Quiz",
              slug: "react-native-foundations-quiz",
              content: "Verify your React Native baseline before building screens.",
              topicType: TopicType.ASSESSMENT,
              orderIndex: 3,
              duration: 20,
              isPreview: false,
              quiz: {
                id: "q-mobile-1",
                title: "React Native Basics Assessment",
                questions: [
                  {
                    id: "q-m-1-q1",
                    text: "Which component is the mobile equivalent of a <div> in React Native?",
                    type: QuestionType.MULTIPLE_CHOICE,
                    options: [
                      { text: "View", isCorrect: true },
                      { text: "Container", isCorrect: false },
                      { text: "Box", isCorrect: false },
                      { text: "Section", isCorrect: false },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          id: "m-mobile-2",
          title: "Building Real Features & Publishing",
          order: 2,
          duration: 150,
          topics: [
            {
              id: "t-mobile-2-1",
              title: "Implementing Stack & Tab Navigation",
              slug: "react-navigation-deep-dive",
              content:
                "Build multi-screen flows with React Navigation — including deeply nested navigators, params, and authentication guards.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 60,
              isPreview: false,
            },
            {
              id: "t-mobile-2-2",
              title: "App Store Deployment — iOS & Android",
              slug: "app-store-deployment",
              content:
                "Use EAS Build to generate production binaries, then walk through the entire Apple and Google submission process.",
              topicType: TopicType.LESSON,
              orderIndex: 2,
              duration: 50,
              isPreview: false,
            },
          ],
        },
      ],
    },
    // ── 6. Cybersecurity ─────────────────────────────────────────────────────
    {
      id: "cyber-001",
      title: "Cybersecurity Fundamentals & Ethical Hacking",
      description:
        "Understand how attackers think, then defend against them. Covers network security, OWASP Top 10 vulnerabilities, penetration testing basics, and incident response.",
      shortDescription: "Network security, OWASP Top 10, and pen-testing basics.",
      status: CourseStatus.PUBLISHED,
      difficulty: DifficultyLevel.BEGINNER,
      duration: 22,
      price: 200000,
      thumbnail: THUMBNAILS.cybersecurity,
      isCertificateFree: false,
      certificatePrice: 15000,
      creatorId: admin.id,
      tags: ["Cybersecurity", "Networking", "Ethical Hacking", "OWASP"],
      learningOutcomes: [
        "Understand the CIA triad and core security principles",
        "Identify and exploit the OWASP Top 10 web vulnerabilities safely",
        "Run basic penetration tests using Kali Linux tools",
        "Build and document a professional incident response plan",
      ],
      modules: [
        {
          id: "m-cyber-1",
          title: "Security Concepts & Threat Landscape",
          order: 1,
          duration: 120,
          topics: [
            {
              id: "t-cyber-1-1",
              title: "The CIA Triad: Confidentiality, Integrity, Availability",
              slug: "cia-triad-explained",
              content:
                "Every security decision maps back to these three pillars. Learn how to evaluate systems against the CIA triad.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 30,
              isPreview: true,
            },
            {
              id: "t-cyber-1-2",
              title: "Social Engineering & Phishing Tactics",
              slug: "social-engineering-tactics",
              content:
                "The most dangerous attacks exploit humans, not software. Understand pretexting, spear-phishing, and vishing — and learn to defend against them.",
              topicType: TopicType.LESSON,
              orderIndex: 2,
              duration: 40,
              isPreview: false,
            },
            {
              id: "t-cyber-1-3",
              title: "Security Concepts Quiz",
              slug: "security-concepts-quiz",
              content: "Validate your understanding of foundational security concepts.",
              topicType: TopicType.ASSESSMENT,
              orderIndex: 3,
              duration: 15,
              isPreview: false,
              quiz: {
                id: "q-cyber-1",
                title: "Cybersecurity Foundations Quiz",
                questions: [
                  {
                    id: "q-c-1-q1",
                    text: "Which pillar of the CIA triad ensures data has not been tampered with?",
                    type: QuestionType.MULTIPLE_CHOICE,
                    options: [
                      { text: "Confidentiality", isCorrect: false },
                      { text: "Integrity", isCorrect: true },
                      { text: "Availability", isCorrect: false },
                      { text: "Authentication", isCorrect: false },
                    ],
                  },
                  {
                    id: "q-c-1-q2",
                    text: "Social engineering attacks target human psychology rather than software vulnerabilities.",
                    type: QuestionType.TRUE_FALSE,
                    options: [
                      { text: "True", isCorrect: true },
                      { text: "False", isCorrect: false },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          id: "m-cyber-2",
          title: "Network Security & Ethical Hacking Basics",
          order: 2,
          duration: 120,
          topics: [
            {
              id: "t-cyber-2-1",
              title: "TCP/IP, Ports & Protocol Vulnerabilities",
              slug: "network-protocols-security",
              content:
                "Dive into how networks move data, which ports attackers target, and how to harden network configurations.",
              topicType: TopicType.LESSON,
              orderIndex: 1,
              duration: 45,
              isPreview: false,
            },
            {
              id: "t-cyber-2-2",
              title: "OWASP Top 10 Walkthrough",
              slug: "owasp-top-10-walkthrough",
              content:
                "Step through SQL Injection, Broken Access Control, XSS, and 7 more critical vulnerabilities — with live demo exploits and patches.",
              topicType: TopicType.LESSON,
              orderIndex: 2,
              duration: 60,
              isPreview: false,
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
        thumbnail: cData.thumbnail,
        tags: cData.tags || [],
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
        thumbnail: cData.thumbnail,
        tags: cData.tags || [],
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

            // Recreate options fresh on each seed
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

  // --- 4. TRACKS (CAREER PATHS) ---
  const tracksData = [
    {
      id: "track-fullstack",
      title: "Full-Stack Web Engineer",
      description:
        "The complete zero-to-hero roadmap for becoming a job-ready full-stack developer. Start with digital fundamentals, then master modern web engineering with Next.js, Prisma, and cloud deployment.",
      slug: "full-stack-web-engineer",
      thumbnail: THUMBNAILS.trackFullStack,
      isPublished: true,
      price: 250000,
      courses: [
        { courseId: "intro-001", order: 1 },
        { courseId: "flagship-001", order: 2 },
      ],
    },
    {
      id: "track-data",
      title: "Data Scientist & AI Engineer",
      description:
        "Go from curious beginner to a data professional capable of building machine learning pipelines, training predictive models, and presenting data-driven insights to stakeholders.",
      slug: "data-scientist-ai-engineer",
      thumbnail: THUMBNAILS.trackData,
      isPublished: true,
      price: 190000,
      courses: [
        { courseId: "intro-001", order: 1 },
        { courseId: "python-001", order: 2 },
      ],
    },
    {
      id: "track-design",
      title: "Product Designer",
      description:
        "Master the end-to-end product design process — from user research and information architecture to pixel-perfect Figma prototypes that delight users and impress hiring managers.",
      slug: "product-designer",
      thumbnail: THUMBNAILS.trackDesign,
      isPublished: true,
      price: 160000,
      courses: [
        { courseId: "intro-001", order: 1 },
        { courseId: "design-001", order: 2 },
      ],
    },
  ];

  for (const trackData of tracksData) {
    await (prisma as any).track.upsert({
      where: { id: trackData.id },
      update: {
        title: trackData.title,
        description: trackData.description,
        thumbnail: trackData.thumbnail,
        isPublished: trackData.isPublished,
      },
      create: {
        id: trackData.id,
        title: trackData.title,
        description: trackData.description,
        slug: trackData.slug,
        thumbnail: trackData.thumbnail,
        isPublished: trackData.isPublished,
        price: trackData.price,
      } as any,
    });

    for (const tc of trackData.courses) {
      await (prisma as any).trackCourse.upsert({
        where: {
          trackId_courseId: { trackId: trackData.id, courseId: tc.courseId },
        },
        update: { order: tc.order },
        create: {
          trackId: trackData.id,
          courseId: tc.courseId,
          order: tc.order,
        },
      });
    }
  }

  console.log("✅ Tracks (Career Paths) seeded with premium thumbnails.");

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
