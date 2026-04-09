import { prisma } from "@/lib/db";
import { UserRole, EnrollmentStatus, CourseStatus } from "@prisma/client";

export async function getDashboardStats() {
  try {
    // Execute all count queries in parallel for performance
    const [
      totalUsers,
      activeUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      activeEnrollments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
      },
    };
  } catch (error: any) {
    console.error("Database Error (Dashboard Stats):", error);
    // Return safe fallback values instead of crashing the UI
    return {
      users: { total: 0, active: 0 },
      courses: { total: 0, published: 0 },
      enrollments: { total: 0, active: 0 },
    };
  }
}
