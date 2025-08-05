// lib/services/moduleService.ts
import { prisma } from "@/lib/db";

export interface CreateModuleData {
  title: string;
  description?: string;
  order: number;
  duration: number;
  passingScore?: number;
  prerequisiteModuleId?: string;
  isRequired?: boolean;
  unlockDelay?: number;
  courseId: string;
}

export interface UpdateModuleData {
  title?: string;
  description?: string;
  order?: number;
  duration?: number;
  passingScore?: number;
  prerequisiteModuleId?: string;
  isRequired?: boolean;
  unlockDelay?: number;
}

export class ModuleService {
  // Create a new module
  static async createModule(data: CreateModuleData) {
    return await prisma.module.create({
      data: {
        ...data,
        passingScore: data.passingScore || 80,
        isRequired: data.isRequired ?? true,
      },
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
        prerequisiteModule: {
          select: {
            id: true,
            title: true,
          },
        },
        topics: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            title: true,
            topicType: true,
            duration: true,
            isRequired: true,
          },
        },
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });
  }

  // Get module by ID
  static async getModuleById(id: string) {
    return await prisma.module.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        prerequisiteModule: {
          select: {
            id: true,
            title: true,
          },
        },
        dependentModules: {
          select: {
            id: true,
            title: true,
          },
        },
        topics: {
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
        },
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });
  }

  // Get modules by course
  static async getModulesByCourse(courseId: string) {
    return await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        prerequisiteModule: {
          select: {
            id: true,
            title: true,
          },
        },
        topics: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            title: true,
            topicType: true,
            duration: true,
          },
        },
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });
  }

  // Update module
  static async updateModule(id: string, data: UpdateModuleData) {
    return await prisma.module.update({
      where: { id },
      data,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        prerequisiteModule: {
          select: {
            id: true,
            title: true,
          },
        },
        topics: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            title: true,
            topicType: true,
          },
        },
      },
    });
  }

  // Delete module
  // TODO: CASCADE all resources
  static async deleteModule(id: string) {
    return await prisma.module.delete({
      where: { id },
    });
  }

  // Reorder modules in a course
  static async reorderModules(courseId: string, moduleIds: string[]) {
    const updates = moduleIds.map((moduleId, index) =>
      prisma.module.update({
        where: { id: moduleId },
        data: { order: index + 1 },
      })
    );

    return await prisma.$transaction(updates);
  }

  // Get available prerequisite modules for a course
  static async getAvailablePrerequisites(courseId: string, excludeModuleId?: string) {
    const where: any = { courseId };
    if (excludeModuleId) {
      where.id = { not: excludeModuleId };
    }

    return await prisma.module.findMany({
      where,
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        order: true,
      },
    });
  }
}
