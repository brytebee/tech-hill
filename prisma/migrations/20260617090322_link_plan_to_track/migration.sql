-- AlterTable
ALTER TABLE "public"."plans" ADD COLUMN     "trackId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."plans" ADD CONSTRAINT "plans_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;
