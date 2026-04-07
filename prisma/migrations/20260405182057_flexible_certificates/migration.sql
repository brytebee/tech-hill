/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId,trackId,certificateType]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."certificates_userId_courseId_certificateType_key";

-- AlterTable
ALTER TABLE "public"."certificates" ADD COLUMN     "trackId" TEXT,
ALTER COLUMN "courseId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "certificates_userId_courseId_trackId_certificateType_key" ON "public"."certificates"("userId", "courseId", "trackId", "certificateType");

-- AddForeignKey
ALTER TABLE "public"."certificates" ADD CONSTRAINT "certificates_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
