-- AlterEnum
ALTER TYPE "public"."CertificateType" ADD VALUE 'TRACK_COMPLETION';

-- AlterTable
ALTER TABLE "public"."quiz_attempts" ADD COLUMN     "draftAnswers" JSONB;

-- CreateTable
CREATE TABLE "public"."Track" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "thumbnail" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrackCourse" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TrackCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrackEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "currentCourseId" TEXT,
    "completedCourses" TEXT[],
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TrackEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Track_slug_key" ON "public"."Track"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TrackCourse_trackId_courseId_key" ON "public"."TrackCourse"("trackId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackCourse_trackId_order_key" ON "public"."TrackCourse"("trackId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TrackEnrollment_userId_trackId_key" ON "public"."TrackEnrollment"("userId", "trackId");

-- AddForeignKey
ALTER TABLE "public"."TrackCourse" ADD CONSTRAINT "TrackCourse_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackCourse" ADD CONSTRAINT "TrackCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackEnrollment" ADD CONSTRAINT "TrackEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackEnrollment" ADD CONSTRAINT "TrackEnrollment_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
