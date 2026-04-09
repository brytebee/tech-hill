import { prisma } from "@/lib/db";
import { EnrollmentStatus } from "@prisma/client";
import { ConflictError, BadRequestError } from "@/lib/errors";

export interface CreateEnrollmentData {
  userId: string;
  courseId: string;
}

export class EnrollmentService {
  // Enroll user in course
  static async createEnrollment(data: CreateEnrollmentData) {
    // 1. Check if already enrolled in THIS course
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: data.userId,
          courseId: data.courseId,
        },
      },
    });

    if (existing) {
      if (existing.status === "ACTIVE") {
        throw new ConflictError("You are already enrolled in this course.");
      }
      // If they were previously enrolled but dropped/completed, we might allow re-enrollment logic here
      // For now, we reactivate if it was dropped? Or just throw.
      // Let's assume we proceed to create a NEW enrollment or update the old one.
      // But the schema uses a composite ID, so we can't have duplicates.
      // We'll throw for now to be safe.
      throw new ConflictError(
        "You have a previous enrollment record for this course.",
      );
    }

    // 2. PREMIUM RULE: Check if user has ANY other ACTIVE enrollment (Course or Track)
    const activeCourse = await prisma.enrollment.findFirst({
      where: { userId: data.userId, status: "ACTIVE" },
      include: { course: { select: { title: true } } },
    });

    if (activeCourse) {
      throw new BadRequestError(
        `Focus Check: You are currently active in the course "${activeCourse.course.title}". To commit fully, you must either complete it or forfeit/drop it from your dashboard before starting a new journey.`
      );
    }

    const activeTrack = await prisma.trackEnrollment.findFirst({
      where: { userId: data.userId, status: "ACTIVE" },
      include: { track: { select: { title: true } } },
    });

    if (activeTrack) {
      throw new BadRequestError(
        `Focus Check: You are currently committed to the "${activeTrack.track.title}" Career Path. You must either complete it or forfeit your progress by dropping it before starting this course.`
      );
    }

    // 3. Payment Check
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      select: { price: true },
    });

    if (course && Number(course.price) > 0) {
      // Check for successful transaction for this course
      const hasPaid = await prisma.transaction.findFirst({
        where: {
          userId: data.userId,
          courseId: data.courseId,
          status: "SUCCESS",
        },
      });

      // Check for active subscription (includes both date-bound and lifetime subs)
      const hasSubscription = await prisma.subscription.findFirst({
        where: {
          userId: data.userId,
          status: "ACTIVE",
          OR: [
            { endDate: null },                    // Lifetime — never expires
            { endDate: { gte: new Date() } },     // Date-bound — not yet expired
          ],
        },
      });

      if (!hasPaid && !hasSubscription) {
        throw new BadRequestError("Payment required to enroll in this course.");
      }
    }

    // 4. Create the enrollment
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

    // Transform Decimal price to Number on the embedded course object
    return {
      ...enrollment,
      course: {
        ...enrollment.course,
        price: enrollment.course.price ? Number(enrollment.course.price) : 0,
      },
    };
  }

  // Get user enrollments
  static async getUserEnrollments(userId: string) {
    return await prisma.enrollment.findMany({
      where: { 
        userId,
        status: { in: ["ACTIVE", "COMPLETED"] }
      },
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
    status: EnrollmentStatus,
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
    progress: number,
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
