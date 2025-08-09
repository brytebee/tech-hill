// lib/services/enrollmentService.ts
import { prisma } from "@/lib/db";
import { EnrollmentStatus } from "@prisma/client";

export interface CreateEnrollmentData {
  userId: string;
  courseId: string;
}

export class EnrollmentService {
  // Enroll user in course
  static async createEnrollment(data: CreateEnrollmentData) {
    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: data.userId,
          courseId: data.courseId,
        },
      },
    });

    if (existing) {
      throw new Error("User is already enrolled in this course");
    }

    return await prisma.enrollment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            duration: true,
          },
        },
      },
    });
  }

  // Get enrollment by user and course
  static async getEnrollment(userId: string, courseId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: "asc" },
              include: {
                topics: {
                  orderBy: { orderIndex: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) return null;

    // Transform the price from Decimal to Number in emdedded course
    return {
      ...enrollment,
      enrollment: {
        course: {
          price: enrollment.course.price ? Number(enrollment.course.price) : 0,
        },
      },
    };
  }

  // Get user enrollments
  static async getUserEnrollments(userId: string) {
    return await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            duration: true,
            difficulty: true,
            status: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });
  }

  // Get course enrollments
  static async getCourseEnrollments(courseId: string) {
    return await prisma.enrollment.findMany({
      where: { courseId },
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
      orderBy: { enrolledAt: "desc" },
    });
  }

  // Update enrollment status
  static async updateEnrollmentStatus(
    userId: string,
    courseId: string,
    status: EnrollmentStatus
  ) {
    return await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: { status },
    });
  }

  // Update enrollment progress
  static async updateEnrollmentProgress(
    userId: string,
    courseId: string,
    progress: number
  ) {
    return await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        overallProgress: progress,
        lastAccessAt: new Date(),
      },
    });
  }

  // Get enrollment stats
  static async getEnrollmentStats() {
    const [total, active, completed, dropped] = await Promise.all([
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "ACTIVE" } }),
      prisma.enrollment.count({ where: { status: "COMPLETED" } }),
      prisma.enrollment.count({ where: { status: "DROPPED" } }),
    ]);

    return { total, active, completed, dropped };
  }
}
