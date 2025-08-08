// lib/services/student/course-services.ts
import { prisma } from "@/lib/prisma";

export class StudentCourseService {
  // Mark topic as started (IN_PROGRESS)
  static async startTopic(userId: string, topicId: string) {
    try {
      // Check if progress already exists
      const existingProgress = await prisma.topicProgress.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId,
          },
        },
      });

      if (existingProgress) {
        // If already started or completed, don't change status
        if (existingProgress.status !== 'NOT_STARTED') {
          return existingProgress;
        }

        // Update to IN_PROGRESS
        return await prisma.topicProgress.update({
          where: { id: existingProgress.id },
          data: {
            status: 'IN_PROGRESS',
            startedAt: new Date(),
          },
        });
      }

      // Create new progress record
      return await prisma.topicProgress.create({
        data: {
          userId,
          topicId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error starting topic:", error);
      throw new Error("Failed to start topic");
    }
  }

  // Mark topic as completed
  static async completeTopic(userId: string, topicId: string) {
    try {
      const progress = await prisma.topicProgress.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId,
          },
        },
      });

      if (!progress) {
        // Create completed progress if it doesn't exist
        return await prisma.topicProgress.create({
          data: {
            userId,
            topicId,
            status: 'COMPLETED',
            startedAt: new Date(),
            completedAt: new Date(),
          },
        });
      }

      // Update existing progress
      return await prisma.topicProgress.update({
        where: { id: progress.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          startedAt: progress.startedAt || new Date(),
        },
      });
    } catch (error) {
      console.error("Error completing topic:", error);
      throw new Error("Failed to complete topic");
    }
  }

  // Get user's progress for a course
  static async getCourseProgress(userId: string, courseId: string) {
    try {
      // Get all modules and topics for the course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              topics: {
                orderBy: { orderIndex: 'asc' },
                select: {
                  id: true,
                  isRequired: true,
                },
              },
            },
          },
        },
      });

      if (!course) {
        throw new Error("Course not found");
      }

      // Get user's topic progress
      const topicIds = course.modules.flatMap(m => m.topics.map(t => t.id));
      const topicProgress = await prisma.topicProgress.findMany({
        where: {
          userId,
          topicId: { in: topicIds },
        },
      });

      const progressMap = new Map(
        topicProgress.map(p => [p.topicId, p.status])
      );

      // Calculate module progress
      const moduleProgress = course.modules.map(module => {
        const topics = module.topics;
        const completedTopics = topics.filter(t => 
          progressMap.get(t.id) === 'COMPLETED'
        ).length;

        const requiredTopics = topics.filter(t => t.isRequired).length;
        const completedRequiredTopics = topics.filter(t => 
          t.isRequired && progressMap.get(t.id) === 'COMPLETED'
        ).length;

        const progress = topics.length > 0 
          ? Math.round((completedTopics / topics.length) * 100)
          : 100;

        const isComplete = requiredTopics === 0 || completedRequiredTopics === requiredTopics;

        return {
          moduleId: module.id,
          totalTopics: topics.length,
          completedTopics,
          requiredTopics,
          completedRequiredTopics,
          progress,
          isComplete,
        };
      });

      // Calculate overall course progress
      const totalTopics = course.modules.reduce((sum, m) => sum + m.topics.length, 0);
      const completedTopics = topicProgress.filter(p => p.status === 'COMPLETED').length;
      const overallProgress = totalTopics > 0 
        ? Math.round((completedTopics / totalTopics) * 100)
        : 0;

      return {
        courseId,
        overallProgress,
        totalTopics,
        completedTopics,
        moduleProgress,
        topicProgress: progressMap,
      };
    } catch (error) {
      console.error("Error getting course progress:", error);
      throw new Error("Failed to get course progress");
    }
  }

  // Get user's topic progress with prerequisites check
  static async getTopicAccessibility(userId: string, topicId: string) {
    try {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: {
          prerequisiteTopic: true,
          module: {
            include: {
              prerequisiteModule: true,
              course: true,
            },
          },
        },
      });

      if (!topic) {
        return { canAccess: false, reason: "Topic not found" };
      }

      // Check if user is enrolled in the course
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          courseId: topic.module.course.id,
          status: 'ACTIVE',
        },
      });

      if (!enrollment) {
        return { canAccess: false, reason: "Not enrolled in course" };
      }

      // Check prerequisite topic
      if (topic.prerequisiteTopic) {
        const prereqProgress = await prisma.topicProgress.findUnique({
          where: {
            userId_topicId: {
              userId,
              topicId: topic.prerequisiteTopic.id,
            },
          },
        });

        if (!prereqProgress || prereqProgress.status !== 'COMPLETED') {
          return {
            canAccess: false,
            reason: "Prerequisite topic not completed",
            prerequisite: topic.prerequisiteTopic.title,
          };
        }
      }

      // Check prerequisite module
      if (topic.module.prerequisiteModule) {
        const moduleProgress = await this.getModuleProgress(userId, topic.module.prerequisiteModule.id);
        
        if (!moduleProgress.isComplete) {
          return {
            canAccess: false,
            reason: "Prerequisite module not completed",
            prerequisite: topic.module.prerequisiteModule.title,
          };
        }
      }

      return { canAccess: true };
    } catch (error) {
      console.error("Error checking topic accessibility:", error);
      return { canAccess: false, reason: "Error checking accessibility" };
    }
  }

  // Get module completion status
  static async getModuleProgress(userId: string, moduleId: string) {
    try {
      const module = await prisma.module.findUnique({
        where: { id: moduleId },
        include: {
          topics: {
            select: {
              id: true,
              isRequired: true,
            },
          },
        },
      });

      if (!module) {
        throw new Error("Module not found");
      }

      const topicIds = module.topics.map(t => t.id);
      const topicProgress = await prisma.topicProgress.findMany({
        where: {
          userId,
          topicId: { in: topicIds },
        },
      });

      const completedTopics = topicProgress.filter(p => p.status === 'COMPLETED').length;
      const requiredTopics = module.topics.filter(t => t.isRequired).length;
      const completedRequiredTopics = module.topics.filter(t => 
        t.isRequired && 
        topicProgress.some(p => p.topicId === t.id && p.status === 'COMPLETED')
      ).length;

      const progress = module.topics.length > 0 
        ? Math.round((completedTopics / module.topics.length) * 100)
        : 100;

      const isComplete = requiredTopics === 0 || completedRequiredTopics === requiredTopics;

      return {
        moduleId,
        totalTopics: module.topics.length,
        completedTopics,
        requiredTopics,
        completedRequiredTopics,
        progress,
        isComplete,
      };
    } catch (error) {
      console.error("Error getting module progress:", error);
      throw new Error("Failed to get module progress");
    }
  }

  // Submit quiz attempt
  static async submitQuizAttempt(data: {
    userId: string;
    quizId: string;
    topicId?: string;
    answers: Record<string, any>;
    timeSpent?: number;
  }) {
    try {
      const { userId, quizId, topicId, answers, timeSpent } = data;

      // Get quiz details for scoring
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      });

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // Calculate score
      let totalPoints = 0;
      let earnedPoints = 0;
      const questionResults: any[] = [];

      for (const question of quiz.questions) {
        totalPoints += question.points;
        const userAnswer = answers[question.id];
        let isCorrect = false;
        let pointsEarned = 0;

        if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') {
          const correctOption = question.options.find(o => o.isCorrect);
          isCorrect = userAnswer === correctOption?.id;
          pointsEarned = isCorrect ? question.points : 0;
        } else if (question.questionType === 'MULTIPLE_SELECT') {
          const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.id);
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
          isCorrect = correctOptions.length === userAnswers.length &&
            correctOptions.every(id => userAnswers.includes(id));
          pointsEarned = isCorrect ? question.points : 
            Math.round(question.points * (userAnswers.filter(id => correctOptions.includes(id)).length / correctOptions.length));
        } else {
          // For SHORT_ANSWER and ESSAY, we'll mark as correct for now
          // In a real app, this would require manual grading or AI evaluation
          isCorrect = userAnswer && userAnswer.toString().trim().length > 0;
          pointsEarned = isCorrect ? question.points : 0;
        }

        earnedPoints += pointsEarned;

        questionResults.push({
          questionId: question.id,
          userAnswer,
          isCorrect,
          pointsEarned,
        });
      }

      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passed = score >= quiz.passingScore;

      // Create quiz attempt record
      const attempt = await prisma.quizAttempt.create({
        data: {
          userId,
          quizId,
          score,
          totalPoints,
          earnedPoints,
          passed,
          timeSpent: timeSpent || 0,
          answers: questionResults,
          completedAt: new Date(),
        },
      });

      // If quiz passed and belongs to a topic, update topic progress
      if (passed && topicId) {
        await this.completeTopic(userId, topicId);
      }

      // Update overall course progress
      if (topicId) {
        const topic = await prisma.topic.findUnique({
          where: { id: topicId },
          select: {
            module: {
              select: {
                courseId: true,
              },
            },
          },
        });

        if (topic) {
          await this.updateCourseProgress(userId, topic.module.courseId);
        }
      }

      return attempt;
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
      throw new Error("Failed to submit quiz attempt");
    }
  }

  // Update overall course progress in enrollment
  static async updateCourseProgress(userId: string, courseId: string) {
    try {
      const progress = await this.getCourseProgress(userId, courseId);

      // Update enrollment progress
      await prisma.enrollment.updateMany({
        where: {
          userId,
          courseId,
          status: 'ACTIVE',
        },
        data: {
          overallProgress: progress.overallProgress,
          lastAccessedAt: new Date(),
        },
      });

      // Check if course is completed (all required modules completed)
      const allModulesCompleted = progress.moduleProgress.every(m => m.isComplete);
      
      if (allModulesCompleted && progress.overallProgress >= 80) { // Assuming 80% completion threshold
        await prisma.enrollment.updateMany({
          where: {
            userId,
            courseId,
            status: 'ACTIVE',
          },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Create certificate if course is completed
        await this.createCourseCertificate(userId, courseId);
      }

      return progress;
    } catch (error) {
      console.error("Error updating course progress:", error);
      throw new Error("Failed to update course progress");
    }
  }

  // Create certificate for course completion
  static async createCourseCertificate(userId: string, courseId: string) {
    try {
      // Check if certificate already exists
      const existingCertificate = await prisma.certificate.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      if (existingCertificate) {
        return existingCertificate;
      }

      // Get course and user details for certificate
      const [course, user] = await Promise.all([
        prisma.course.findUnique({
          where: { id: courseId },
          select: {
            title: true,
            creator: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            firstName: true,
            lastName: true,
          },
        }),
      ]);

      if (!course || !user) {
        throw new Error("Course or user not found");
      }

      // Generate certificate ID
      const certificateId = `CERT-${courseId.slice(-6).toUpperCase()}-${userId.slice(-6).toUpperCase()}-${Date.now()}`;

      const certificate = await prisma.certificate.create({
        data: {
          certificateId,
          userId,
          courseId,
          studentName: `${user.firstName} ${user.lastName}`,
          courseName: course.title,
          instructorName: `${course.creator.firstName} ${course.creator.lastName}`,
          completedAt: new Date(),
          issuedAt: new Date(),
        },
      });

      return certificate;
    } catch (error) {
      console.error("Error creating certificate:", error);
      throw new Error("Failed to create certificate");
    }
  }

  // Get next available topic for a user in a course
  static async getNextTopic(userId: string, courseId: string) {
    try {
      const courseProgress = await this.getCourseProgress(userId, courseId);
      
      // Get course structure
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              topics: {
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
        },
      });

      if (!course) {
        return null;
      }

      // Find the first incomplete topic that's accessible
      for (const module of course.modules) {
        for (const topic of module.topics) {
          const topicStatus = courseProgress.topicProgress.get(topic.id);
          
          if (topicStatus !== 'COMPLETED') {
            const accessibility = await this.getTopicAccessibility(userId, topic.id);
            
            if (accessibility.canAccess) {
              return {
                ...topic,
                module: {
                  id: module.id,
                  title: module.title,
                },
                status: topicStatus || 'NOT_STARTED',
              };
            }
          }
        }
      }

      // All topics completed
      return null;
    } catch (error) {
      console.error("Error getting next topic:", error);
      return null;
    }
  }
}
