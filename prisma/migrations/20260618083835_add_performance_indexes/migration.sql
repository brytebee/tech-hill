-- CreateIndex
CREATE INDEX "TrackEnrollment_userId_idx" ON "public"."TrackEnrollment"("userId");

-- CreateIndex
CREATE INDEX "TrackEnrollment_trackId_idx" ON "public"."TrackEnrollment"("trackId");

-- CreateIndex
CREATE INDEX "enrollments_userId_idx" ON "public"."enrollments"("userId");

-- CreateIndex
CREATE INDEX "enrollments_courseId_idx" ON "public"."enrollments"("courseId");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_idx" ON "public"."quiz_attempts"("userId");

-- CreateIndex
CREATE INDEX "quiz_attempts_quizId_idx" ON "public"."quiz_attempts"("quizId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "public"."subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_planId_idx" ON "public"."subscriptions"("planId");

-- CreateIndex
CREATE INDEX "topic_progress_userId_idx" ON "public"."topic_progress"("userId");

-- CreateIndex
CREATE INDEX "topic_progress_topicId_idx" ON "public"."topic_progress"("topicId");
