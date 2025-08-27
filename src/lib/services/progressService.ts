// // lib/services/progressService.ts
// import { prisma } from "@/lib/db";
// import { ProgressStatus, MasteryLevel } from "@prisma/client";

// export class ProgressService {
//   // Get or create topic progress
//   static async getOrCreateTopicProgress(userId: string, topicId: string) {
//     let progress = await prisma.topicProgress.findUnique({
//       where: {
//         userId_topicId: {
//           userId,
//           topicId,
//         },
//       },
//       include: {
//         topic: {
//           include: {
//             quizzes: {
//               include: {
//                 attempts: {
//                   where: { userId },
//                   orderBy: { createdAt: "desc" },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!progress) {
//       progress = await prisma.topicProgress.create({
//         data: {
//           userId,
//           topicId,
//           status: ProgressStatus.IN_PROGRESS,
//           startedAt: new Date(),
//         },
//         include: {
//           topic: {
//             include: {
//               quizzes: {
//                 include: {
//                   attempts: {
//                     where: { userId },
//                     orderBy: { createdAt: "desc" },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       });
//     }

//     return progress;
//   }

//   // Update topic progress based on completion and quiz scores
//   static async updateTopicProgress(
//     userId: string,
//     topicId: string,
//     completed: boolean = false
//   ) {
//     const topicProgress = await this.getOrCreateTopicProgress(userId, topicId);
//     const topic = topicProgress.topic;

//     // Check if topic has assessments
//     const hasAssessments = topic.quizzes.length > 0;
//     let canComplete = true;
//     let bestScore = topicProgress.bestScore;

//     if (hasAssessments && completed) {
//       // For assessment topics, check if passing score is met
//       const passedAttempts = topic.quizzes.flatMap((quiz) =>
//         quiz.attempts.filter((attempt) => attempt.passed)
//       );

//       if (passedAttempts.length === 0) {
//         canComplete = false;
//       } else {
//         // Get best score from passed attempts
//         bestScore = Math.max(...passedAttempts.map((attempt) => attempt.score));
//       }
//     }

//     const updateData: any = {
//       lastAccessAt: new Date(),
//       viewCount: { increment: 1 },
//     };

//     if (completed && (canComplete || !hasAssessments)) {
//       updateData.status = ProgressStatus.COMPLETED;
//       updateData.completedAt = new Date();
//       updateData.completionRate = 100;
//       updateData.masteryAchieved = bestScore
//         ? bestScore >= topic.passingScore
//         : true;
//     } else if (completed && !canComplete) {
//       // User tried to complete but hasn't passed assessments
//       updateData.status = ProgressStatus.NEEDS_REVIEW;
//     }

//     if (bestScore !== null) {
//       updateData.bestScore = bestScore;
//     }

//     const updatedProgress = await prisma.topicProgress.update({
//       where: {
//         userId_topicId: {
//           userId,
//           topicId,
//         },
//       },
//       data: updateData,
//     });

//     // Update module progress after topic completion
//     if (completed && (canComplete || !hasAssessments)) {
//       await this.updateModuleProgress(userId, topic.moduleId);
//     }

//     return updatedProgress;
//   }

//   // Update module progress based on completed topics
//   static async updateModuleProgress(userId: string, moduleId: string) {
//     const module = await prisma.module.findUnique({
//       where: { id: moduleId },
//       include: {
//         topics: {
//           include: {
//             progress: {
//               where: { userId },
//             },
//             quizzes: true,
//           },
//         },
//         course: true,
//       },
//     });

//     if (!module) return;

//     const requiredTopics = module.topics.filter((topic) => topic.isRequired);
//     const completedRequiredTopics = requiredTopics.filter(
//       (topic) =>
//         topic.progress.length > 0 &&
//         topic.progress[0].status === ProgressStatus.COMPLETED
//     );

//     const progressPercentage =
//       requiredTopics.length > 0
//         ? Math.round(
//             (completedRequiredTopics.length / requiredTopics.length) * 100
//           )
//         : 0;

//     const allTopicsCompleted =
//       completedRequiredTopics.length === requiredTopics.length;

//     // Calculate average score from completed topics with assessments
//     const topicsWithScores = completedRequiredTopics
//       .map((topic) => topic.progress[0])
//       .filter((progress) => progress.bestScore !== null);

//     const averageScore =
//       topicsWithScores.length > 0
//         ? Math.round(
//             topicsWithScores.reduce(
//               (sum, progress) => sum + (progress.bestScore || 0),
//               0
//             ) / topicsWithScores.length
//           )
//         : null;

//     // Check if module has any topics with assessments
//     const hasAssessmentTopics = module.topics.some(
//       (topic) => topic.quizzes && topic.quizzes.length > 0
//     );

//     const passedModule = hasAssessmentTopics
//       ? averageScore
//         ? averageScore >= module.passingScore
//         : false
//       : allTopicsCompleted; // If no assessments, just need all topics completed

//     let moduleProgress = await prisma.moduleProgress.findUnique({
//       where: {
//         userId_moduleId: {
//           userId,
//           moduleId,
//         },
//       },
//     });

//     if (!moduleProgress) {
//       moduleProgress = await prisma.moduleProgress.create({
//         data: {
//           userId,
//           moduleId,
//           status: ProgressStatus.IN_PROGRESS,
//           startedAt: new Date(),
//           progressPercentage,
//           currentScore: averageScore,
//           bestScore: averageScore,
//         },
//       });
//     } else if (allTopicsCompleted) {
//       await prisma.moduleProgress.update({
//         where: { id: moduleProgress.id },
//         data: {
//           progressPercentage,
//           currentScore: averageScore,
//           bestScore: Math.max(moduleProgress.bestScore || 0, averageScore || 0),
//           status:
//             allTopicsCompleted && passedModule
//               ? ProgressStatus.COMPLETED
//               : progressPercentage > 0
//               ? ProgressStatus.IN_PROGRESS
//               : ProgressStatus.NOT_STARTED,
//           completedAt: allTopicsCompleted && passedModule ? new Date() : null,
//           lastAccessAt: new Date(),
//         },
//       });
//     } else {
//       await prisma.moduleProgress.update({
//         where: { id: moduleProgress.id },
//         data: {
//           progressPercentage,
//           currentScore: averageScore,
//           bestScore: Math.max(moduleProgress.bestScore || 0, averageScore || 0),
//           status:
//             allTopicsCompleted && passedModule
//               ? ProgressStatus.COMPLETED
//               : progressPercentage > 0
//               ? ProgressStatus.IN_PROGRESS
//               : ProgressStatus.NOT_STARTED,
//           completedAt: allTopicsCompleted && passedModule ? new Date() : null,
//           lastAccessAt: new Date(),
//         },
//       });
//     }

//     // Update course progress after module completion
//     if (allTopicsCompleted && passedModule) {
//       await this.updateCourseProgress(userId, module.courseId);
//     }

//     return moduleProgress;
//   }

//   // Update course progress based on completed modules
//   static async updateCourseProgress(userId: string, courseId: string) {
//     const course = await prisma.course.findUnique({
//       where: { id: courseId },
//       include: {
//         modules: {
//           include: {
//             progress: {
//               where: { userId },
//             },
//           },
//         },
//       },
//     });

//     if (!course) return;

//     const requiredModules = course.modules.filter(
//       (module) => module.isRequired
//     );
//     const completedRequiredModules = requiredModules.filter(
//       (module) =>
//         module.progress.length > 0 &&
//         module.progress[0].status === ProgressStatus.COMPLETED
//     );

//     const overallProgress =
//       requiredModules.length > 0
//         ? Math.round(
//             (completedRequiredModules.length / requiredModules.length) * 100
//           )
//         : 0;

//     const allModulesCompleted =
//       completedRequiredModules.length === requiredModules.length;

//     // Calculate final grade from completed modules
//     const modulesWithScores = completedRequiredModules
//       .map((module) => module.progress[0])
//       .filter((progress) => progress.currentScore !== null);

//     const finalGrade =
//       modulesWithScores.length > 0
//         ? Math.round(
//             modulesWithScores.reduce(
//               (sum, progress) => sum + (progress.currentScore || 0),
//               0
//             ) / modulesWithScores.length
//           )
//         : null;

//     const passedCourse = finalGrade
//       ? finalGrade >= course.passingScore
//       : allModulesCompleted;

//     await prisma.enrollment.update({
//       where: {
//         userId_courseId: {
//           userId,
//           courseId,
//         },
//       },
//       data: {
//         overallProgress,
//         finalGrade,
//         status: allModulesCompleted && passedCourse ? "COMPLETED" : "ACTIVE",
//         completedAt: allModulesCompleted && passedCourse ? new Date() : null,
//         lastAccessAt: new Date(),
//       },
//     });

//     return { overallProgress, finalGrade, passed: passedCourse };
//   }

//   // Check if user can access a topic (prerequisites met)
//   static async canAccessTopic(
//     userId: string,
//     topicId: string
//   ): Promise<boolean> {
//     const topic = await prisma.topic.findUnique({
//       where: { id: topicId },
//       include: {
//         prerequisiteTopic: true,
//         module: {
//           include: {
//             prerequisiteModule: true,
//             progress: {
//               where: { userId },
//             },
//           },
//         },
//       },
//     });

//     if (!topic) return false;

//     // Check module prerequisite
//     if (topic.module.prerequisiteModule) {
//       const prereqModuleProgress = await prisma.moduleProgress.findUnique({
//         where: {
//           userId_moduleId: {
//             userId,
//             moduleId: topic.module.prerequisiteModule.id,
//           },
//         },
//       });

//       if (
//         !prereqModuleProgress ||
//         prereqModuleProgress.status !== ProgressStatus.COMPLETED
//       ) {
//         return false;
//       }
//     }

//     // Check topic prerequisite
//     if (topic.prerequisiteTopic) {
//       const prereqTopicProgress = await prisma.topicProgress.findUnique({
//         where: {
//           userId_topicId: {
//             userId,
//             topicId: topic.prerequisiteTopic.id,
//           },
//         },
//       });

//       if (
//         !prereqTopicProgress ||
//         prereqTopicProgress.status !== ProgressStatus.COMPLETED
//       ) {
//         return false;
//       }
//     }

//     return true;
//   }

//   // Get comprehensive progress data for a user in a course
//   static async getCourseProgressData(userId: string, courseId: string) {
//     const [enrollment, moduleProgresses, topicProgresses] = await Promise.all([
//       prisma.enrollment.findUnique({
//         where: {
//           userId_courseId: { userId, courseId },
//         },
//       }),
//       prisma.moduleProgress.findMany({
//         where: {
//           userId,
//           module: { courseId },
//         },
//         include: {
//           module: {
//             include: {
//               topics: true,
//             },
//           },
//         },
//       }),
//       prisma.topicProgress.findMany({
//         where: {
//           userId,
//           topic: {
//             module: { courseId },
//           },
//         },
//         include: {
//           topic: {
//             include: {
//               quizzes: {
//                 include: {
//                   attempts: {
//                     where: { userId },
//                     orderBy: { createdAt: "desc" },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       }),
//     ]);

//     return {
//       enrollment,
//       moduleProgresses,
//       topicProgresses,
//     };
//   }

//   // Check remaining quiz attempts for a topic
//   static async getRemainingAttempts(
//     userId: string,
//     topicId: string
//   ): Promise<{ [quizId: string]: number }> {
//     const topic = await prisma.topic.findUnique({
//       where: { id: topicId },
//       include: {
//         quizzes: {
//           include: {
//             attempts: {
//               where: {
//                 userId,
//                 isPractice: false, // Only count real attempts
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!topic) return {};

//     const remainingAttempts: { [quizId: string]: number } = {};

//     topic.quizzes.forEach((quiz) => {
//       const attemptCount = quiz.attempts.length;
//       const maxAttempts = quiz.maxAttempts || topic.maxAttempts;

//       if (maxAttempts) {
//         remainingAttempts[quiz.id] = Math.max(0, maxAttempts - attemptCount);
//       } else {
//         remainingAttempts[quiz.id] = -1; // Unlimited
//       }
//     });

//     return remainingAttempts;
//   }
// }

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
      // For assessment topics, ALL quizzes must be passed
      const allQuizzesPassed = topic.quizzes.every((quiz) =>
        quiz.attempts.some((attempt) => attempt.passed)
      );

      if (!allQuizzesPassed) {
        canComplete = false;
      } else {
        // Get best score from all passed attempts across all quizzes
        const passedAttempts = topic.quizzes.flatMap((quiz) =>
          quiz.attempts.filter((attempt) => attempt.passed)
        );
        if (passedAttempts.length > 0) {
          bestScore = Math.max(
            ...passedAttempts.map((attempt) => attempt.score)
          );
        }
      }
    }

    const updateData: any = {
      lastAccessAt: new Date(),
      viewCount: { increment: 1 },
    };

    if (completed && (canComplete || !hasAssessments)) {
      updateData.status = ProgressStatus.COMPLETED;
      updateData.completedAt = new Date();
      updateData.completionRate = 100;
      updateData.masteryAchieved = bestScore
        ? bestScore >= topic.passingScore
        : true; // For topics without assessments, mastery is achieved by completion
    } else if (completed && !canComplete && hasAssessments) {
      // User tried to complete but hasn't passed all assessments
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
            quizzes: {
              include: {
                attempts: {
                  where: { userId },
                },
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        course: true,
      },
    });

    if (!module) {
      console.error(`Module ${moduleId} not found`);
      return null;
    }

    // Edge case: Module with no topics
    if (module.topics.length === 0) {
      console.warn(`Module ${moduleId} has no topics, marking as completed`);

      let moduleProgress = await prisma.moduleProgress.findUnique({
        where: { userId_moduleId: { userId, moduleId } },
      });

      const completionData = {
        status: ProgressStatus.COMPLETED,
        progressPercentage: 100,
        completedAt: new Date(),
        lastAccessAt: new Date(),
      };

      if (!moduleProgress) {
        moduleProgress = await prisma.moduleProgress.create({
          data: {
            userId,
            moduleId,
            startedAt: new Date(),
            ...completionData,
          },
        });
      } else {
        moduleProgress = await prisma.moduleProgress.update({
          where: { id: moduleProgress.id },
          data: completionData,
        });
      }

      // Update course progress after module completion
      await this.updateCourseProgress(userId, module.courseId);
      return moduleProgress;
    }

    const requiredTopics = module.topics.filter((topic) => topic.isRequired);
    let topicsToEvaluate = requiredTopics;
    let completedTopics = [];
    let progressPercentage = 0;
    let allTopicsCompleted = false;

    // Edge case: Module with no required topics
    if (requiredTopics.length === 0) {
      console.warn(
        `Module ${moduleId} has no required topics, considering all topics`
      );
      topicsToEvaluate = module.topics;
    }

    completedTopics = topicsToEvaluate.filter(
      (topic) =>
        topic.progress.length > 0 &&
        topic.progress[0].status === ProgressStatus.COMPLETED
    );

    progressPercentage =
      topicsToEvaluate.length > 0
        ? Math.round((completedTopics.length / topicsToEvaluate.length) * 100)
        : 100; // Empty evaluation set is 100% complete

    allTopicsCompleted = completedTopics.length === topicsToEvaluate.length;

    // Calculate average score from completed topics with assessments
    const topicsWithScores = completedTopics
      .map((topic) => topic.progress[0])
      .filter(
        (progress) => progress.bestScore !== null && progress.bestScore > 0
      );

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

    // Enhanced module passing logic with comprehensive edge case handling
    const passedModule = (() => {
      // All required/evaluated topics must be completed first
      if (!allTopicsCompleted) return false;

      // If module has assessment topics, check scores
      if (hasAssessmentTopics) {
        // If there are topics with scores, average must meet passing score
        if (topicsWithScores.length > 0) {
          return averageScore >= module.passingScore;
        }
        // If no scores yet but topics are "completed", they must have no assessments
        // This handles mixed modules with both assessment and non-assessment topics
        const assessmentTopics = module.topics.filter(
          (topic) => topic.quizzes.length > 0
        );
        const completedAssessmentTopics = assessmentTopics.filter(
          (topic) =>
            topic.progress.length > 0 &&
            topic.progress[0].status === ProgressStatus.COMPLETED
        );

        // All assessment topics must be completed for module to pass
        return completedAssessmentTopics.length === assessmentTopics.length;
      }

      // No assessments in module, completion is based on topic completion
      return true;
    })();

    let moduleProgress = await prisma.moduleProgress.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
    });

    const updateData = {
      progressPercentage,
      currentScore: averageScore,
      bestScore: Math.max(moduleProgress?.bestScore || 0, averageScore || 0),
      status:
        allTopicsCompleted && passedModule
          ? ProgressStatus.COMPLETED
          : progressPercentage > 0
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
      completedAt: allTopicsCompleted && passedModule ? new Date() : null,
      lastAccessAt: new Date(),
    };

    if (!moduleProgress) {
      moduleProgress = await prisma.moduleProgress.create({
        data: {
          userId,
          moduleId,
          startedAt: new Date(),
          ...updateData,
        },
      });
    } else {
      moduleProgress = await prisma.moduleProgress.update({
        where: { id: moduleProgress.id },
        data: updateData,
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
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!course) {
      console.error(`Course ${courseId} not found`);
      return null;
    }

    // Edge case: Course with no modules
    if (course.modules.length === 0) {
      console.warn(`Course ${courseId} has no modules, marking as completed`);

      await prisma.enrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: {
          overallProgress: 100,
          status: "COMPLETED",
          completedAt: new Date(),
          lastAccessAt: new Date(),
        },
      });
      return { overallProgress: 100, finalGrade: null, passed: true };
    }

    const requiredModules = course.modules.filter(
      (module) => module.isRequired
    );
    let modulesToEvaluate = requiredModules;
    let completedModules = [];

    // Edge case: Course with no required modules
    if (requiredModules.length === 0) {
      console.warn(
        `Course ${courseId} has no required modules, considering all modules`
      );
      modulesToEvaluate = course.modules;
    }

    completedModules = modulesToEvaluate.filter(
      (module) =>
        module.progress.length > 0 &&
        module.progress[0].status === ProgressStatus.COMPLETED
    );

    const overallProgress =
      modulesToEvaluate.length > 0
        ? Math.round((completedModules.length / modulesToEvaluate.length) * 100)
        : 100; // No modules to evaluate = 100% complete

    const allModulesCompleted =
      completedModules.length === modulesToEvaluate.length;

    // Calculate final grade from completed modules
    const modulesWithScores = completedModules
      .map((module) => module.progress[0])
      .filter(
        (progress) =>
          progress.currentScore !== null && progress.currentScore > 0
      );

    const finalGrade =
      modulesWithScores.length > 0
        ? Math.round(
            modulesWithScores.reduce(
              (sum, progress) => sum + (progress.currentScore || 0),
              0
            ) / modulesWithScores.length
          )
        : null;

    // Course passing logic with edge case handling
    const passedCourse = (() => {
      if (!allModulesCompleted) return false;

      // If there are modules with scores, final grade must meet passing score
      if (finalGrade !== null) {
        return finalGrade >= course.passingScore;
      }

      // If no final grade but all modules completed, course passes
      // This handles courses with no assessments
      return true;
    })();

    const enrollment = await prisma.enrollment.update({
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

    if (!topic) {
      console.error(`Topic ${topicId} not found`);
      return false;
    }

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

  // Utility method to validate and fix orphaned progress records
  static async validateAndCleanupProgress(userId: string, courseId?: string) {
    try {
      const whereClause = courseId
        ? {
            userId,
            topic: { module: { courseId } },
          }
        : { userId };

      // Find orphaned topic progress (topics that no longer exist)
      const orphanedTopicProgress = await prisma.topicProgress.findMany({
        where: whereClause,
        include: {
          topic: true,
        },
      });

      const toDelete = orphanedTopicProgress.filter(
        (progress) => !progress.topic
      );

      if (toDelete.length > 0) {
        await prisma.topicProgress.deleteMany({
          where: {
            id: { in: toDelete.map((p) => p.id) },
          },
        });
        console.log(
          `Cleaned up ${toDelete.length} orphaned topic progress records`
        );
      }

      return true;
    } catch (error) {
      console.error("Error during progress cleanup:", error);
      return false;
    }
  }

  // Method to recalculate all progress for a user in a course
  static async recalculateProgressForCourse(userId: string, courseId: string) {
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            include: {
              topics: {
                include: {
                  progress: { where: { userId } },
                  quizzes: {
                    include: {
                      attempts: { where: { userId } },
                    },
                  },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!course) return null;

      // Recalculate from the bottom up
      for (const module of course.modules) {
        for (const topic of module.topics) {
          if (
            topic.progress.length > 0 &&
            topic.progress[0].status === ProgressStatus.COMPLETED
          ) {
            await this.updateModuleProgress(userId, module.id);
            break; // Only need to trigger once per module
          }
        }
      }

      return await this.updateCourseProgress(userId, courseId);
    } catch (error) {
      console.error("Error recalculating course progress:", error);
      return null;
    }
  }
}
