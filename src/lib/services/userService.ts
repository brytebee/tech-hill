// lib/services/userService.ts
import { prisma } from "@/lib/db";
import { UserRole, UserStatus, Prisma } from "@prisma/client";
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
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                status: true,
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
  static async updateLastLogin(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
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
