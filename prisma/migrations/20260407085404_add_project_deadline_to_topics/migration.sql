-- AlterTable
ALTER TABLE "public"."topics" ADD COLUMN     "allowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dueDate" TIMESTAMP(3);
