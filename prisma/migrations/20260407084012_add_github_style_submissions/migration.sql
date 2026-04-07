/*
  Warnings:

  - The values [GRADED,RETURNED] on the enum `SubmissionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `feedback` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `gradedAt` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `maxScore` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `returnedAt` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `rubricScores` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `submissions` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SubmissionStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUIRED', 'APPROVED', 'REJECTED', 'RESUBMITTED');
ALTER TABLE "public"."submissions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."submissions" ALTER COLUMN "status" TYPE "public"."SubmissionStatus_new" USING ("status"::text::"public"."SubmissionStatus_new");
ALTER TYPE "public"."SubmissionStatus" RENAME TO "SubmissionStatus_old";
ALTER TYPE "public"."SubmissionStatus_new" RENAME TO "SubmissionStatus";
DROP TYPE "public"."SubmissionStatus_old";
ALTER TABLE "public"."submissions" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "public"."submissions" DROP COLUMN "feedback",
DROP COLUMN "gradedAt",
DROP COLUMN "maxScore",
DROP COLUMN "returnedAt",
DROP COLUMN "rubricScores",
DROP COLUMN "score",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
