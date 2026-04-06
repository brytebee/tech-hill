/*
  Warnings:

  - You are about to drop the column `backgroundUrl` on the `certificate_templates` table. All the data in the column will be lost.
  - You are about to drop the column `layoutConfig` on the `certificate_templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."certificate_templates" DROP COLUMN "backgroundUrl",
DROP COLUMN "layoutConfig",
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "primaryColor" TEXT,
ADD COLUMN     "signatureUrl" TEXT,
ADD COLUMN     "themeName" TEXT NOT NULL DEFAULT 'ModernDark';
