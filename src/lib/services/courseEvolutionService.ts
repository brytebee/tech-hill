/**
 * CourseEvolutionService
 *
 * Handles the curriculum lifecycle event where NEW REQUIRED CONTENT is added
 * to a course that already has COMPLETED student enrollments.
 *
 * When triggered, it:
 *  1. Finds all affected COMPLETED enrollments for the course
 *  2. Reverts their status back to ACTIVE (so students can continue)
 *  3. Reverts the COMPLETED status of the specific module containing the new topic
 *  4. Fires a "New Content Available" notification to each affected student
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export class CourseEvolutionService {
  /**
   * Called whenever a new REQUIRED topic is added to a course (via API or seeder).
   *
   * @param courseId    - The course that received new required content
   * @param moduleId    - The specific module the new topic was added to
   * @param topicTitle  - Used for the student notification message
   */
  static async handleNewRequiredContent(
    courseId: string,
    moduleId: string,
    topicTitle: string
  ): Promise<{ reopened: number }> {
    try {
      // 1. Find all COMPLETED enrollments for this course
      const completedEnrollments = await prisma.enrollment.findMany({
        where: { courseId, status: "COMPLETED" },
        include: {
          course: { select: { title: true } },
        },
      });

      if (completedEnrollments.length === 0) {
        return { reopened: 0 };
      }

      const courseTitle = completedEnrollments[0].course.title;

      logger.info(
        "courseEvolution",
        `New required topic "${topicTitle}" added to "${courseTitle}". Re-opening ${completedEnrollments.length} completed enrollment(s).`
      );

      let reopened = 0;

      for (const enrollment of completedEnrollments) {
        const userId = enrollment.userId;

        // 2. Revert the enrollment to ACTIVE
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            status: "ACTIVE",
            completedAt: null,
            // Recalculate progress: we don't know exact % yet, but it's no longer 100%
            // The next time the student opens the course, updateCourseProgress will recompute accurately
            overallProgress: 95, // Optimistic placeholder — the student was nearly done
          },
        });

        // 3. Revert the affected ModuleProgress back from COMPLETED → IN_PROGRESS
        const moduleProgress = await prisma.moduleProgress.findUnique({
          where: { userId_moduleId: { userId, moduleId } },
        });

        if (moduleProgress && moduleProgress.status === "COMPLETED") {
          await prisma.moduleProgress.update({
            where: { id: moduleProgress.id },
            data: {
              status: "IN_PROGRESS",
              completedAt: null,
              progressPercentage: Math.min(
                moduleProgress.progressPercentage ?? 100,
                90 // Again, optimistic — the student completed most of this module
              ),
            },
          });
        }

        // 4. Fire a "New Content" notification to the student
        try {
          await prisma.notification.create({
            data: {
              userId,
              type: "COURSE_UPDATE",
              title: `📚 New lesson added to "${courseTitle}"`,
              message: `We've expanded "${courseTitle}" with new required content: "${topicTitle}". Your journey continues — keep growing! 🚀`,
              linkUrl: `/student/courses/${courseId}`,
            },
          });
        } catch (notifErr) {
          logger.warn(
            "courseEvolution",
            `Failed to send notification to userId=${userId}`,
            notifErr
          );
        }

        reopened++;
      }

      return { reopened };
    } catch (error) {
      logger.error(
        "courseEvolution",
        "Failed to handle new required content",
        { courseId, moduleId, topicTitle, error }
      );
      return { reopened: 0 };
    }
  }

  /**
   * Called when an existing topic's isRequired flag is toggled FROM false TO true.
   * Triggers the same re-open + notify flow.
   */
  static async handleTopicPromotedToRequired(
    courseId: string,
    moduleId: string,
    topicTitle: string
  ): Promise<{ reopened: number }> {
    return this.handleNewRequiredContent(courseId, moduleId, topicTitle);
  }
}
