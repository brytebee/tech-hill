// lib/services/topicService.ts
import { prisma } from "@/lib/db";
import { TopicType } from "@prisma/client";

export interface CreateTopicData {
  title: string;
  slug: string;
  description?: string;
  content: string;
  orderIndex: number;
  duration?: number;
  topicType?: TopicType;
  videoUrl?: string;
  attachments?: string[];
  isRequired?: boolean;
  allowSkip?: boolean;
  prerequisiteTopicId?: string;
  moduleId: string;
}

export interface UpdateTopicData {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  orderIndex?: number;
  duration?: number;
  topicType?: TopicType;
  videoUrl?: string;
  attachments?: string[];
  isRequired?: boolean;
  allowSkip?: boolean;
  prerequisiteTopicId?: string;
}

export class TopicService {
  // Create a new topic
  static async createTopic(data: CreateTopicData) {
    return await prisma.topic.create({
      data: {
        ...data,
        attachments: data.attachments || [],
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        prerequisiteTopic: {
          select: {
            id: true,
            title: true,
          },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            isActive: true,
          },
        },
      },
    });
  }

  // Get topic by ID
  static async getTopicById(id: string) {
    return await prisma.topic.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                creator: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        prerequisiteTopic: {
          select: {
            id: true,
            title: true,
          },
        },
        dependentTopics: {
          select: {
            id: true,
            title: true,
          },
        },
        quizzes: {
          where: { isActive: true },
          include: {
            questions: {
              select: {
                id: true,
                questionType: true,
                points: true,
              },
            },
          },
        },
      },
    });
  }

  // Get topic by slug
  static async getTopicBySlug(slug: string) {
    return await prisma.topic.findUnique({
      where: { slug },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        quizzes: {
          where: { isActive: true },
        },
      },
    });
  }

  // Get topics by module
  static async getTopicsByModule(moduleId: string) {
    return await prisma.topic.findMany({
      where: { moduleId },
      orderBy: { orderIndex: "asc" },
      include: {
        prerequisiteTopic: {
          select: {
            id: true,
            title: true,
          },
        },
        quizzes: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            passingScore: true,
          },
        },
      },
    });
  }

  // Update topic
  static async updateTopic(id: string, data: UpdateTopicData) {
    return await prisma.topic.update({
      where: { id },
      data,
      include: {
        module: {
          select: {
            id: true,
            title: true,
          },
        },
        prerequisiteTopic: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  // Delete topic
  static async deleteTopic(id: string) {
    return await prisma.topic.delete({
      where: { id },
    });
  }

  // Reorder topics in a module
  static async reorderTopics(moduleId: string, topicIds: string[]) {
    const updates = topicIds.map((topicId, index) =>
      prisma.topic.update({
        where: { id: topicId },
        data: { orderIndex: index },
      })
    );

    return await prisma.$transaction(updates);
  }
}
