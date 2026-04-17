-- CreateEnum
CREATE TYPE "public"."BadgeCategory" AS ENUM ('ACHIEVEMENT', 'MILESTONE', 'SKILL', 'SPECIAL');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "lastActivityDate" TIMESTAMP(3),
ADD COLUMN     "streakDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."identity_badges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" "public"."BadgeCategory" NOT NULL DEFAULT 'ACHIEVEMENT',
    "xpThreshold" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identity_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "identity_badges_title_key" ON "public"."identity_badges"("title");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "public"."user_badges"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "public"."user_badges"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "users_xp_idx" ON "public"."users"("xp" DESC);

-- AddForeignKey
ALTER TABLE "public"."user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "public"."identity_badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
