// lib/services/courseService.ts
import { prisma } from "@/lib/db";
import { CourseStatus, DifficultyLevel, Prisma } from "@prisma/client";

export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  difficulty?: DifficultyLevel;
  duration: number;
  price?: number;
  tags?: string[];
  prerequisites?: string[];
  syllabus?: string;
  learningOutcomes?: string[];
  creatorId: string;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: string;
  status?: CourseStatus;
  difficulty?: DifficultyLevel;
  duration?: number;
  price?: number;
  tags?: string[];
  prerequisites?: string[];
  syllabus?: string;
  learningOutcomes?: string[];
}

export interface CourseFilters {
  status?: CourseStatus;
  difficulty?: DifficultyLevel;
  creatorId?: string;
  search?: string;
}

export class CourseService {
  // Create a new course
  static async createCourse(data: CreateCourseData) {
    return await prisma.course.create({
      data: {
        ...data,
        price: data.price || 0,
        tags: data.tags || [],
        prerequisites: data.prerequisites || [],
        learningOutcomes: data.learningOutcomes || [],
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        modules: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
    });
  }

  // Get course by ID
  static async getCourseById(id: string) {
    return await prisma.course.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        modules: {
          orderBy: { order: "asc" },
          include: {
            topics: {
              orderBy: { orderIndex: "asc" },
              select: {
                id: true,
                title: true,
                duration: true,
                topicType: true,
                isRequired: true,
              },
            },
            _count: {
              select: {
                topics: true,
              },
            },
          },
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
    });
  }

  // Get courses with filters and pagination
  static async getCourses(
    filters: CourseFilters = {},
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { tags: { hasSome: [filters.search] } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              modules: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.count({ where }),
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update course
  static async updateCourse(id: string, data: UpdateCourseData) {
    return await prisma.course.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
    });
  }

  // Delete course
  static async deleteCourse(id: string) {
    return await prisma.course.delete({
      where: { id },
    });
  }

  // Publish course
  static async publishCourse(id: string) {
    return await prisma.course.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  // Get course stats
  static async getCourseStats() {
    const [total, published, draft, archived] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.course.count({ where: { status: "DRAFT" } }),
      prisma.course.count({ where: { status: "ARCHIVED" } }),
    ]);

    return { total, published, draft, archived };
  }
}
