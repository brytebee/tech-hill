Note: The system is built with NextJS 15 

enum UserRole {
  ADMIN
  MANAGER
  STUDENT
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  password      String
  firstName     String
  lastName      String
  role          UserRole    @default(STUDENT)
  status        UserStatus  @default(ACTIVE)
  profileImage  String?
  phoneNumber   String?
  dateOfBirth   DateTime?
  address       String?
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  lastLoginAt   DateTime?
  
  // NextAuth relations
  accounts      Account[]
  sessions      Session[]
  
  // Application relations
  enrollments   Enrollment[]
  createdCourses Course[]   @relation("CourseCreator")
  
  // Assessment & Progress Relations
  quizAttempts  QuizAttempt[]
  topicProgress TopicProgress[]
  moduleProgress ModuleProgress[]
  submissions   Submission[]
  certificates  Certificate[]
  
  @@map("users")
}

// Course Structure
enum CourseStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

model Course {
  id            String         @id @default(cuid())
  title         String
  description   String         @db.Text
  shortDescription String?
  thumbnail     String?
  status        CourseStatus   @default(DRAFT)
  difficulty    DifficultyLevel @default(BEGINNER)
  duration      Int            // Duration in hours
  price         Decimal        @default(0) @db.Decimal(10, 2)
  tags          String[]
  prerequisites String[]
  
  // Content
  syllabus      String?        @db.Text
  learningOutcomes String[]
  
  // Assessment Requirements
  passingScore  Int            @default(80) // Overall course passing percentage
  requireSequentialCompletion Boolean @default(true) // Must complete modules in order
  allowRetakes  Boolean        @default(true)
  maxAttempts   Int?           // Null = unlimited attempts
  
  // Timestamps
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  publishedAt   DateTime?
  
  // Relations
  creatorId     String
  creator       User           @relation("CourseCreator", fields: [creatorId], references: [id])
  modules       Module[]
  enrollments   Enrollment[]
  certificates  Certificate[]
  
  @@map("courses")
}

// Enhanced Module with Assessment Requirements
model Module {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  order       Int
  duration    Int      // Duration in minutes
  
  // Assessment Requirements
  passingScore Int     @default(80) // Module passing percentage
  prerequisiteModuleId String? // Must complete this module first
  isRequired   Boolean @default(true) // Can skip if false
  unlockDelay  Int?    // Hours to wait before unlock (for spaced learning)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  prerequisiteModule Module? @relation("ModulePrerequisites", fields: [prerequisiteModuleId], references: [id])
  dependentModules Module[] @relation("ModulePrerequisites")
  topics      Topic[]
  progress    ModuleProgress[]
  
  @@map("modules")
}

// Topics (Individual learning units within modules)
model Topic {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique // URL-friendly identifier
  description String?    @db.Text
  content     String     @db.Text // Rich text content
  orderIndex  Int        // Sequence within module
  duration    Int?       // Duration in minutes
  
  // Topic Type & Content
  topicType   TopicType  @default(LESSON)
  videoUrl    String?    // For video topics
  attachments String[]   // File URLs for resources
  
  // Assessment Requirements
  passingScore Int       @default(80) // Topic passing percentage
  maxAttempts  Int?      // Per topic attempt limit
  isRequired   Boolean   @default(true)
  allowSkip    Boolean   @default(false) // Can skip if struggling
  
  // Prerequisites within module
  prerequisiteTopicId String?
  
  // Timestamps
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  // Relations
  moduleId    String
  module      Module     @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  prerequisiteTopic Topic? @relation("TopicPrerequisites", fields: [prerequisiteTopicId], references: [id])
  dependentTopics Topic[] @relation("TopicPrerequisites")
  
  quizzes     Quiz[]
  progress    TopicProgress[]
  submissions Submission[]
  
  @@map("topics")
}

enum TopicType {
  LESSON       // Text/video content
  PRACTICE     // Interactive exercises
  ASSESSMENT   // Graded quiz/test
  RESOURCE     // Downloadable materials
}



## **Day 2: Core Database Operations & Layouts**
### Morning (4 hours)
- [x] Create database service functions (users, courses, topics, progress)
- [x] Build API routes for authentication and user management
- [x] Set up basic layouts for each role (admin/manager/student)
- [x] Create reusable UI components (Button, Card, Form inputs)

### Afternoon (4 hours)
- [x] Build admin dashboard with user list
- [x] Create basic course management (CRUD operations)
- [x] Set up student dashboard with enrolled courses
- [ ] Test all database operations work correctly

### **End of Day 2 Checklist:**
- [x] ✅ Admin can view/create/edit users
- [x] ✅ Admin can create courses and topics
- [x] ✅ Students see their dashboard with courses
- [x] ✅ All role-based layouts functioning
- [x] ✅ Database operations working via API

---
The Admin/Manager can create/edit/delete courses
Create a publish api "app/api/courses/[courseId]/publish/route.ts"
Create an archive api "app/api/courses/[courseId]/archive/route.ts"




The Admin/Manager can create/edit/delete module
There should be module details
Create form(s), api, services and show update code to the course details page to navigate the module creation form. (code changes only as I have the bulk of the code already).

The Admin/Manager can create/edit/delete Topics (Just lessons for now as we would handle other types later).
There should be topic details
Create form(s), api, services and ensure the modules page allows for navigation to the topic creation form.

I have the below services for topics create similar for modules

// lib/services/topicService.ts
import { prisma } from "@/lib/db";
import { TopicType } from "@prisma/client";

export interface CreateTopicData {
  title: string;
  slug: string;
  description?: string;
  content: string;
  orderIndex: number;
  duration?: number;
  topicType?: TopicType;
  videoUrl?: string;
  attachments?: string[];
  isRequired?: boolean;
  allowSkip?: boolean;
  prerequisiteTopicId?: string;
  moduleId: string;
}

export interface UpdateTopicData {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  orderIndex?: number;
  duration?: number;
  topicType?: TopicType;
  videoUrl?: string;
  attachments?: string[];
  isRequired?: boolean;
  allowSkip?: boolean;
  prerequisiteTopicId?: string;
}

export class TopicService {
  // Create a new topic
  static async createTopic(data: CreateTopicData) {
    return await prisma.topic.create({
      data: {
        ...data,
        attachments: data.attachments || [],
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        prerequisiteTopic: {
          select: {
            id: true,
            title: true,
          },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            isActive: true,
          },
        },
      },
    });
  }

  // Get topic by ID
  static async getTopicById(id: string) {
    return await prisma.topic.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                creator: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        prerequisiteTopic: {
          select: {
            id: true,
            title: true,
          },
        },
        dependentTopics: {
          select: {
            id: true,
            title: true,
          },
        },
        quizzes: {
          where: { isActive: true },
          include: {
            questions: {
              select: {
                id: true,
                questionType: true,
                points: true,
              },
            },
          },
        },
      },
    });
  }

  // Get topic by slug
  static async getTopicBySlug(slug: string) {
    return await prisma.topic.findUnique({
      where: { slug },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        quizzes: {
          where: { isActive: true },
        },
      },
    });
  }

  // Get topics by module
  static async getTopicsByModule(moduleId: string) {
    return await prisma.topic.findMany({
      where: { moduleId },
      orderBy: { orderIndex: "asc" },
      include: {
        prerequisiteTopic: {
          select: {
            id: true,
            title: true,
          },
        },
        quizzes: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            passingScore: true,
          },
        },
      },
    });
  }

  // Update topic
  static async updateTopic(id: string, data: UpdateTopicData) {
    return await prisma.topic.update({
      where: { id },
      data,
      include: {
        module: {
          select: {
            id: true,
            title: true,
          },
        },
        prerequisiteTopic: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  // Delete topic
  static async deleteTopic(id: string) {
    return await prisma.topic.delete({
      where: { id },
    });
  }

  // Reorder topics in a module
  static async reorderTopics(moduleId: string, topicIds: string[]) {
    const updates = topicIds.map((topicId, index) =>
      prisma.topic.update({
        where: { id: topicId },
        data: { orderIndex: index },
      })
    );

    return await prisma.$transaction(updates);
  }
}


