-- AlterTable
ALTER TABLE "public"."Track" ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "public"."courses" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "public"."certificate_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "backgroundUrl" TEXT NOT NULL,
    "layoutConfig" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."certificate_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Track" ADD CONSTRAINT "Track_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."certificate_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
