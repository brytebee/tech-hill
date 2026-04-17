// lib/services/userService.ts
import { prisma } from "@/lib/db";
import { UserRole, UserStatus, Prisma } from "@prisma/client";
import { GamificationService } from "./gamificationService";
import bcrypt from "bcryptjs";

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  status?: UserStatus;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  profileImage?: string;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export class UserService {
  // Create a new user
  static async createUser(data: CreateUserData) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });
  }

  // Get user by ID
  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            quizAttempts: true,
            submissions: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            status: true,
            overallProgress: true,
            enrolledAt: true,
            completedAt: true,
            lastAccessAt: true,
            totalTimeSpent: true,
            finalGrade: true,
            attemptNumber: true,
            canRetake: true,
            course: {
              select: {
                id: true,
                title: true,
                shortDescription: true,
                status: true,
                difficulty: true,
                duration: true,
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
        },
        createdCourses: {
          include: {
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        certificates: {
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { issuedAt: "desc" },
        },
        wallet: {
          select: {
            balance: true,
            currency: true,
          },
        },
        subscriptions: {
          where: {
            status: { in: ["ACTIVE", "PAST_DUE"] },
          },
          include: {
            plan: {
              select: {
                name: true,
                features: true,
              },
            },
          },
        },
      },
    });
  }

  // Get user by email
  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        password: true,
        profileImage: true,
      },
    });
  }

  // Get users with filters and pagination
  static async getUsers(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update user
  static async updateUser(id: string, data: UpdateUserData) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        profileImage: true,
        updatedAt: true,
      },
    });
  }

  // Delete user
  static async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  // Update last login
  // Update last login and increment token version (invalidating other sessions)
  static async updateLastLogin(id: string) {
    const result = await prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
        tokenVersion: { increment: 1 },
      },
      select: { tokenVersion: true }, // return new version
    });

    // Gamification Hook: Update streak on login
    await GamificationService.updateDailyStreak(id);

    return result;
  }

  // Get user session validation data (token version, status, role, active subscriptions)
  static async getUserSessionValidationData(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { 
        tokenVersion: true, 
        status: true, 
        role: true,
        profileImage: true,
        subscriptions: {
          where: {
            status: "ACTIVE",
          },
          select: { id: true }
        }
      },
    });

    if (!user) return null;

    return {
      tokenVersion: user.tokenVersion,
      status: user.status,
      role: user.role,
      profileImage: user.profileImage,
      hasActiveSubscription: user.subscriptions.length > 0
    };
  }

  // Get user stats
  static async getUserStats() {
    const [total, active, admins, managers, students] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "MANAGER" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
    ]);

    return { total, active, admins, managers, students };
  }
}
