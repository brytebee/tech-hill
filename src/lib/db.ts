import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Helper functions for common queries
export const dbHelpers = {
  // Get user with progress data
  async getUserWithProgress(userId: string) {
    return await db.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
                status: true
              }
            }
          }
        },
        topicProgress: {
          include: {
            topic: {
              select: {
                id: true,
                title: true,
                module: {
                  select: {
                    id: true,
                    title: true,
                    course: {
                      select: {
                        id: true,
                        title: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  },

  // Get course with full structure for learning path
  async getCourseWithStructure(courseId: string, userId?: string) {
    return await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            topics: {
              orderBy: { orderIndex: 'asc' },
              include: {
                quizzes: {
                  where: { isActive: true },
                  select: {
                    id: true,
                    title: true,
                    passingScore: true,
                    maxAttempts: true
                  }
                },
                ...(userId && {
                  progress: {
                    where: { userId },
                    select: {
                      status: true,
                      bestScore: true,
                      completedAt: true,
                      masteryAchieved: true
                    }
                  }
                })
              }
            },
            ...(userId && {
              progress: {
                where: { userId },
                select: {
                  status: true,
                  progressPercentage: true,
                  bestScore: true,
                  completedAt: true
                }
              }
            })
          }
        }
      }
    })
  },

  // Check if user can access a topic (prerequisites met)
  async canAccessTopic(userId: string, topicId: string) {
    const topic = await db.topic.findUnique({
      where: { id: topicId },
      include: {
        prerequisiteTopic: true,
        module: {
          include: {
            prerequisiteModule: true
          }
        }
      }
    })

    if (!topic) return false

    // Check module prerequisites
    if (topic.module.prerequisiteModule) {
      const moduleProgress = await db.moduleProgress.findUnique({
        where: {
          userId_moduleId: {
            userId,
            moduleId: topic.module.prerequisiteModule.id
          }
        }
      })

      if (!moduleProgress || moduleProgress.status !== 'COMPLETED') {
        return false
      }
    }

    // Check topic prerequisites
    if (topic.prerequisiteTopic) {
      const topicProgress = await db.topicProgress.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId: topic.prerequisiteTopic.id
          }
        }
      })

      if (!topicProgress || !topicProgress.masteryAchieved) {
        return false
      }
    }

    return true
  }
}