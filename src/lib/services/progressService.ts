// lib/services/progressService.ts
import { prisma } from "@/lib/db";
import { ProgressStatus, MasteryLevel } from "@prisma/client";

export class ProgressService {
  // Get or create topic progress
  static async getOrCreateTopicProgress(userId: string, topicId: string) {
    let progress = await prisma.topicProgress.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      include: {
        topic: {
          include: {
            quizzes: {
              include: {
                attempts: {
                  where: { userId },
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
        },
      },
    });

    if (!progress) {
      progress = await prisma.topicProgress.create({
        data: {
          userId,
          topicId,
          status: ProgressStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
        include: {
          topic: {
            include: {
              quizzes: {
                include: {
                  attempts: {
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                  },
                },
              },
            },
          },
        },
      });
    }

    return progress;
  }

  // Update topic progress based on completion and quiz scores
  static async updateTopicProgress(
    userId: string,
    topicId: string,
    completed: boolean = false
  ) {
    const topicProgress = await this.getOrCreateTopicProgress(userId, topicId);
    const topic = topicProgress.topic;

    // Check if topic has assessments
    const hasAssessments = topic.quizzes.length > 0;
    let canComplete = true;
    let bestScore = topicProgress.bestScore;

    if (hasAssessments && completed) {
      // For assessment topics, check if passing score is met
      const passedAttempts = topic.quizzes.flatMap((quiz) =>
        quiz.attempts.filter((attempt) => attempt.passed)
      );

      if (passedAttempts.length === 0) {
        canComplete = false;
      } else {
        // Get best score from passed attempts
        bestScore = Math.max(...passedAttempts.map((attempt) => attempt.score));
      }
    }

    const updateData: any = {
      lastAccessAt: new Date(),
      viewCount: { increment: 1 },
    };

    if ((completed && canComplete) || !hasAssessments) {
      updateData.status = ProgressStatus.COMPLETED;
      updateData.completedAt = new Date();
      updateData.completionRate = 100;
      updateData.masteryAchieved = bestScore
        ? bestScore >= topic.passingScore
        : true;
    } else if (completed && !canComplete) {
      // User tried to complete but hasn't passed assessments
      updateData.status = ProgressStatus.NEEDS_REVIEW;
    }

    if (bestScore !== null) {
      updateData.bestScore = bestScore;
    }

    const updatedProgress = await prisma.topicProgress.update({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      data: updateData,
    });

    // Update module progress after topic completion
    if (completed && (canComplete || !hasAssessments)) {
      await this.updateModuleProgress(userId, topic.moduleId);
    }

    return updatedProgress;
  }

  // Update module progress based on completed topics
  static async updateModuleProgress(userId: string, moduleId: string) {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        topics: {
          include: {
            progress: {
              where: { userId },
            },
            quizzes: true,
          },
        },
        course: true,
      },
    });

    if (!module) return;

    const requiredTopics = module.topics.filter((topic) => topic.isRequired);
    const completedRequiredTopics = requiredTopics.filter(
      (topic) =>
        topic.progress.length > 0 &&
        topic.progress[0].status === ProgressStatus.COMPLETED
    );

    const progressPercentage =
      requiredTopics.length > 0
        ? Math.round(
            (completedRequiredTopics.length / requiredTopics.length) * 100
          )
        : 0;

    const allTopicsCompleted =
      completedRequiredTopics.length === requiredTopics.length;

    // Calculate average score from completed topics with assessments
    const topicsWithScores = completedRequiredTopics
      .map((topic) => topic.progress[0])
      .filter((progress) => progress.bestScore !== null);

    const averageScore =
      topicsWithScores.length > 0
        ? Math.round(
            topicsWithScores.reduce(
              (sum, progress) => sum + (progress.bestScore || 0),
              0
            ) / topicsWithScores.length
          )
        : null;

    // Check if module has any topics with assessments
    const hasAssessmentTopics = module.topics.some(
      (topic) => topic.quizzes && topic.quizzes.length > 0
    );

    const passedModule = hasAssessmentTopics
      ? averageScore
        ? averageScore >= module.passingScore
        : false
      : allTopicsCompleted; // If no assessments, just need all topics completed

    let moduleProgress = await prisma.moduleProgress.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
    });

    if (!moduleProgress) {
      moduleProgress = await prisma.moduleProgress.create({
        data: {
          userId,
          moduleId,
          status: ProgressStatus.IN_PROGRESS,
          startedAt: new Date(),
          progressPercentage,
          currentScore: averageScore,
          bestScore: averageScore,
        },
      });
    } else if (allTopicsCompleted) {
      await prisma.moduleProgress.update({
        where: { id: moduleProgress.id },
        data: {
          progressPercentage,
          currentScore: averageScore,
          bestScore: Math.max(moduleProgress.bestScore || 0, averageScore || 0),
          status:
            allTopicsCompleted && passedModule
              ? ProgressStatus.COMPLETED
              : progressPercentage > 0
              ? ProgressStatus.IN_PROGRESS
              : ProgressStatus.NOT_STARTED,
          completedAt: allTopicsCompleted && passedModule ? new Date() : null,
          lastAccessAt: new Date(),
        },
      });
    } else {
      await prisma.moduleProgress.update({
        where: { id: moduleProgress.id },
        data: {
          progressPercentage,
          currentScore: averageScore,
          bestScore: Math.max(moduleProgress.bestScore || 0, averageScore || 0),
          status:
            allTopicsCompleted && passedModule
              ? ProgressStatus.COMPLETED
              : progressPercentage > 0
              ? ProgressStatus.IN_PROGRESS
              : ProgressStatus.NOT_STARTED,
          completedAt: allTopicsCompleted && passedModule ? new Date() : null,
          lastAccessAt: new Date(),
        },
      });
    }

    // Update course progress after module completion
    if (allTopicsCompleted && passedModule) {
      await this.updateCourseProgress(userId, module.courseId);
    }

    return moduleProgress;
  }

  // Update course progress based on completed modules
  static async updateCourseProgress(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            progress: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!course) return;

    const requiredModules = course.modules.filter(
      (module) => module.isRequired
    );
    const completedRequiredModules = requiredModules.filter(
      (module) =>
        module.progress.length > 0 &&
        module.progress[0].status === ProgressStatus.COMPLETED
    );

    const overallProgress =
      requiredModules.length > 0
        ? Math.round(
            (completedRequiredModules.length / requiredModules.length) * 100
          )
        : 0;

    const allModulesCompleted =
      completedRequiredModules.length === requiredModules.length;

    // Calculate final grade from completed modules
    const modulesWithScores = completedRequiredModules
      .map((module) => module.progress[0])
      .filter((progress) => progress.currentScore !== null);

    const finalGrade =
      modulesWithScores.length > 0
        ? Math.round(
            modulesWithScores.reduce(
              (sum, progress) => sum + (progress.currentScore || 0),
              0
            ) / modulesWithScores.length
          )
        : null;

    const passedCourse = finalGrade
      ? finalGrade >= course.passingScore
      : allModulesCompleted;

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        overallProgress,
        finalGrade,
        status: allModulesCompleted && passedCourse ? "COMPLETED" : "ACTIVE",
        completedAt: allModulesCompleted && passedCourse ? new Date() : null,
        lastAccessAt: new Date(),
      },
    });

    return { overallProgress, finalGrade, passed: passedCourse };
  }

  // Check if user can access a topic (prerequisites met)
  static async canAccessTopic(
    userId: string,
    topicId: string
  ): Promise<boolean> {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        prerequisiteTopic: true,
        module: {
          include: {
            prerequisiteModule: true,
            progress: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!topic) return false;

    // Check module prerequisite
    if (topic.module.prerequisiteModule) {
      const prereqModuleProgress = await prisma.moduleProgress.findUnique({
        where: {
          userId_moduleId: {
            userId,
            moduleId: topic.module.prerequisiteModule.id,
          },
        },
      });

      if (
        !prereqModuleProgress ||
        prereqModuleProgress.status !== ProgressStatus.COMPLETED
      ) {
        return false;
      }
    }

    // Check topic prerequisite
    if (topic.prerequisiteTopic) {
      const prereqTopicProgress = await prisma.topicProgress.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId: topic.prerequisiteTopic.id,
          },
        },
      });

      if (
        !prereqTopicProgress ||
        prereqTopicProgress.status !== ProgressStatus.COMPLETED
      ) {
        return false;
      }
    }

    return true;
  }

  // Get comprehensive progress data for a user in a course
  static async getCourseProgressData(userId: string, courseId: string) {
    const [enrollment, moduleProgresses, topicProgresses] = await Promise.all([
      prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      }),
      prisma.moduleProgress.findMany({
        where: {
          userId,
          module: { courseId },
        },
        include: {
          module: {
            include: {
              topics: true,
            },
          },
        },
      }),
      prisma.topicProgress.findMany({
        where: {
          userId,
          topic: {
            module: { courseId },
          },
        },
        include: {
          topic: {
            include: {
              quizzes: {
                include: {
                  attempts: {
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      enrollment,
      moduleProgresses,
      topicProgresses,
    };
  }

  // Check remaining quiz attempts for a topic
  static async getRemainingAttempts(
    userId: string,
    topicId: string
  ): Promise<{ [quizId: string]: number }> {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        quizzes: {
          include: {
            attempts: {
              where: {
                userId,
                isPractice: false, // Only count real attempts
              },
            },
          },
        },
      },
    });

    if (!topic) return {};

    const remainingAttempts: { [quizId: string]: number } = {};

    topic.quizzes.forEach((quiz) => {
      const attemptCount = quiz.attempts.length;
      const maxAttempts = quiz.maxAttempts || topic.maxAttempts;

      if (maxAttempts) {
        remainingAttempts[quiz.id] = Math.max(0, maxAttempts - attemptCount);
      } else {
        remainingAttempts[quiz.id] = -1; // Unlimited
      }
    });

    return remainingAttempts;
  }
}
