-- CreateEnum
CREATE TYPE "public"."CertificateStatus" AS ENUM ('PENDING_REVIEW', 'ISSUED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."certificates" ADD COLUMN     "status" "public"."CertificateStatus" NOT NULL DEFAULT 'ISSUED';
