-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MANAGER', 'STUDENT');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "public"."TopicType" AS ENUM ('LESSON', 'PRACTICE', 'ASSESSMENT', 'RESOURCE');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER', 'MATCHING', 'ORDERING');

-- CreateEnum
CREATE TYPE "public"."QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NEEDS_REVIEW', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."MasteryLevel" AS ENUM ('NOVICE', 'DEVELOPING', 'PROFICIENT', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'GRADED', 'RETURNED', 'RESUBMITTED');

-- CreateEnum
CREATE TYPE "public"."CertificateType" AS ENUM ('COURSE_COMPLETION', 'MASTERY_ACHIEVEMENT', 'SKILL_BADGE', 'MILESTONE');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'STUDENT',
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "profileImage" TEXT,
    "phoneNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "thumbnail" TEXT,
    "status" "public"."CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "difficulty" "public"."DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "prerequisites" TEXT[],
    "syllabus" TEXT,
    "learningOutcomes" TEXT[],
    "passingScore" INTEGER NOT NULL DEFAULT 80,
    "requireSequentialCompletion" BOOLEAN NOT NULL DEFAULT true,
    "allowRetakes" BOOLEAN NOT NULL DEFAULT true,
    "maxAttempts" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."modules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "passingScore" INTEGER NOT NULL DEFAULT 80,
    "prerequisiteModuleId" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "unlockDelay" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "duration" INTEGER,
    "topicType" "public"."TopicType" NOT NULL DEFAULT 'LESSON',
    "videoUrl" TEXT,
    "attachments" TEXT[],
    "passingScore" INTEGER NOT NULL DEFAULT 80,
    "maxAttempts" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "allowSkip" BOOLEAN NOT NULL DEFAULT false,
    "prerequisiteTopicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moduleId" TEXT NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quizzes" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timeLimit" INTEGER,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "shuffleOptions" BOOLEAN NOT NULL DEFAULT false,
    "showFeedback" BOOLEAN NOT NULL DEFAULT true,
    "allowReview" BOOLEAN NOT NULL DEFAULT true,
    "passingScore" INTEGER NOT NULL DEFAULT 80,
    "maxAttempts" INTEGER,
    "adaptiveDifficulty" BOOLEAN NOT NULL DEFAULT false,
    "requireMastery" BOOLEAN NOT NULL DEFAULT false,
    "practiceMode" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "public"."QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "orderIndex" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "explanation" TEXT,
    "hint" TEXT,
    "difficulty" "public"."QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[],
    "timeLimit" INTEGER,
    "allowPartialCredit" BOOLEAN NOT NULL DEFAULT false,
    "caseSensitive" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."enrollments" (
    "id" TEXT NOT NULL,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "overallProgress" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "certificateIssued" BOOLEAN NOT NULL DEFAULT false,
    "finalGrade" INTEGER,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "canRetake" BOOLEAN NOT NULL DEFAULT true,
    "nextRetakeAt" TIMESTAMP(3),
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAccessAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."module_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" "public"."ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "currentScore" INTEGER,
    "bestScore" INTEGER,
    "attemptsUsed" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastAccessAt" TIMESTAMP(3),
    "unlockedAt" TIMESTAMP(3),
    "masteryLevel" "public"."MasteryLevel" NOT NULL DEFAULT 'NOVICE',
    "strugglingAreas" TEXT[],
    "strongAreas" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."topic_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "status" "public"."ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "bestScore" INTEGER,
    "averageScore" INTEGER,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "completionRate" INTEGER NOT NULL DEFAULT 0,
    "strugglingIndicator" BOOLEAN NOT NULL DEFAULT false,
    "masteryAchieved" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastAccessAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "isPractice" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "questionsTotal" INTEGER NOT NULL DEFAULT 0,
    "averageTimePerQuestion" INTEGER,
    "questionsSkipped" INTEGER NOT NULL DEFAULT 0,
    "questionsReviewed" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "difficultyAreas" JSONB,
    "strengthAreas" JSONB,
    "recommendedReview" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT,
    "selectedOptions" TEXT[],
    "textAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL DEFAULT 0,
    "partialCredit" INTEGER,
    "timeSpent" INTEGER,
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "usedHint" BOOLEAN NOT NULL DEFAULT false,
    "flaggedForReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[],
    "score" INTEGER,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "feedback" TEXT,
    "rubricScores" JSONB,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."certificates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "certificateType" "public"."CertificateType" NOT NULL DEFAULT 'COURSE_COMPLETION',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "finalScore" INTEGER,
    "completionTime" INTEGER,
    "masteryLevel" "public"."MasteryLevel",
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "templateUrl" TEXT,
    "badgeUrl" TEXT,
    "verificationCode" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "public"."topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_userId_courseId_key" ON "public"."enrollments"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "module_progress_userId_moduleId_key" ON "public"."module_progress"("userId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "topic_progress_userId_topicId_key" ON "public"."topic_progress"("userId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificateNumber_key" ON "public"."certificates"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_verificationCode_key" ON "public"."certificates"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_userId_courseId_certificateType_key" ON "public"."certificates"("userId", "courseId", "certificateType");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modules" ADD CONSTRAINT "modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modules" ADD CONSTRAINT "modules_prerequisiteModuleId_fkey" FOREIGN KEY ("prerequisiteModuleId") REFERENCES "public"."modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topics" ADD CONSTRAINT "topics_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topics" ADD CONSTRAINT "topics_prerequisiteTopicId_fkey" FOREIGN KEY ("prerequisiteTopicId") REFERENCES "public"."topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quizzes" ADD CONSTRAINT "quizzes_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."questions" ADD CONSTRAINT "questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."options" ADD CONSTRAINT "options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."module_progress" ADD CONSTRAINT "module_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."module_progress" ADD CONSTRAINT "module_progress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topic_progress" ADD CONSTRAINT "topic_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topic_progress" ADD CONSTRAINT "topic_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_selectedOption_fkey" FOREIGN KEY ("selectedOption") REFERENCES "public"."options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificates" ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificates" ADD CONSTRAINT "certificates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
