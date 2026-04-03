/*
  Warnings:

  - Made the column `timeLimit` on table `questions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."questions" ALTER COLUMN "timeLimit" SET NOT NULL,
ALTER COLUMN "timeLimit" SET DEFAULT 30;
