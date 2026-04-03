/*
  Warnings:

  - You are about to drop the `_CouponToPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."TransactionType" ADD VALUE 'CERTIFICATE_PURCHASE';

-- DropForeignKey
ALTER TABLE "public"."_CouponToPlan" DROP CONSTRAINT "_CouponToPlan_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CouponToPlan" DROP CONSTRAINT "_CouponToPlan_B_fkey";

-- AlterTable
ALTER TABLE "public"."coupons" ADD COLUMN     "maxUsesPerUser" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "public"."courses" ADD COLUMN     "certificatePrice" DECIMAL(10,2),
ADD COLUMN     "isCertificateFree" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."topics" ADD COLUMN     "isPreview" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."transactions" ADD COLUMN     "courseId" TEXT;

-- DropTable
DROP TABLE "public"."_CouponToPlan";

-- CreateTable
CREATE TABLE "public"."PlansOnCoupons" (
    "planId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,

    CONSTRAINT "PlansOnCoupons_pkey" PRIMARY KEY ("planId","couponId")
);

-- CreateTable
CREATE TABLE "public"."CoursesOnCoupons" (
    "courseId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,

    CONSTRAINT "CoursesOnCoupons_pkey" PRIMARY KEY ("courseId","couponId")
);

-- CreateTable
CREATE TABLE "public"."flash_sales" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountPercentage" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flash_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CourseFlashSales" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseFlashSales_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseFlashSales_B_index" ON "public"."_CourseFlashSales"("B");

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlansOnCoupons" ADD CONSTRAINT "PlansOnCoupons_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlansOnCoupons" ADD CONSTRAINT "PlansOnCoupons_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "public"."coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoursesOnCoupons" ADD CONSTRAINT "CoursesOnCoupons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoursesOnCoupons" ADD CONSTRAINT "CoursesOnCoupons_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "public"."coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CourseFlashSales" ADD CONSTRAINT "_CourseFlashSales_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CourseFlashSales" ADD CONSTRAINT "_CourseFlashSales_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."flash_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
