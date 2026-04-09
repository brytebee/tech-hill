import { prisma as prismaClient } from "@/lib/db";
import { CertificateService } from "./certificateService";
import { ConflictError, BadRequestError } from "@/lib/errors";

const prisma = prismaClient as any;

export class TrackService {
  /**
   * Get all tracks with their courses for discovery
   */
  static async getAllTracks(onlyPublished = true) {
    return await prisma.track.findMany({
      where: onlyPublished ? { isPublished: true } : undefined,
      include: {
        courses: {
          orderBy: { order: "asc" },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                thumbnail: true,
                duration: true,
                difficulty: true,
              },
            },
          },
        },
        _count: {
          select: { courses: true, enrollments: true },
        },
      },
    });
  }

  /**
   * Get a single track detail
   */
  static async getTrackBySlug(slug: string, userId?: string) {
    const track = await prisma.track.findUnique({
      where: { slug },
      include: {
        courses: {
          orderBy: { order: "asc" },
          include: {
            course: {
              include: {
                _count: { select: { modules: true } },
              },
            },
          },
        },
      },
    });

    if (!track) return null;

    let enrollment = null;
    if (userId) {
      enrollment = await prisma.trackEnrollment.findUnique({
        where: { userId_trackId: { userId, trackId: track.id } },
      });
    }

    return { ...track, enrollment };
  }

  /**
   * Enroll a user in a track
   */
  static async enrollInTrack(userId: string, trackId: string) {
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { courses: { orderBy: { order: "asc" }, take: 1 } },
    });

    if (!track) throw new Error("Track not found");

    // "Focus Check" Mechanic: Check if user has ANY other ACTIVE course or track
    const activeCourse = await prisma.enrollment.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { course: { select: { title: true } } },
    });

    if (activeCourse) {
      throw new BadRequestError(
        `Focus Check: You are currently active in the course "${activeCourse.course.title}". To commit to this Career Path, you must either complete your course or forfeit/drop it from your dashboard.`
      );
    }

    const activeTrack = await prisma.trackEnrollment.findFirst({
      where: { userId, status: "ACTIVE", NOT: { trackId } },
      include: { track: { select: { title: true } } },
    });

    if (activeTrack) {
      throw new BadRequestError(
        `Focus Check: You are already committed to the "${activeTrack.track.title}" Career Path. You must either complete it or forfeit your progress by dropping it before starting a new one.`
      );
    }

    // Payment Check
    if (Number(track.price) > 0) {
      const hasSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } },
          ],
        },
      });

      // Implement specific track transaction check in the future if needed, 
      // but for now Subscriptions unlock Career Paths.
      if (!hasSubscription) {
        throw new BadRequestError("An active subscription or payment is required to unlock this Career Path.");
      }
    }

    const firstCourseId = track.courses[0]?.courseId;

    return await prisma.trackEnrollment.upsert({
      where: { userId_trackId: { userId, trackId } },
      create: {
        userId,
        trackId,
        currentCourseId: firstCourseId,
        status: "ACTIVE",
      },
      update: {
        // Full reset: re-enrolling after a drop starts the path from scratch
        status: "ACTIVE",
        currentCourseId: firstCourseId,
        completedCourses: [],
        completedAt: null,
      },
    });
  }

  /**
   * Update track progress when a course is completed
   */
  static async updateTrackProgress(userId: string, trackId: string, completedCourseId: string) {
    const enrollment = await prisma.trackEnrollment.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });

    if (!enrollment) return null;

    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { courses: { orderBy: { order: "asc" } } },
    });

    if (!track) return null;

    // Check if course is already in completed list
    if (enrollment.completedCourses.includes(completedCourseId)) {
        return enrollment;
    }

    const updatedCompletedCourses = [...enrollment.completedCourses, completedCourseId];
    
    // Find next course in sequence
    const currentIndex = track.courses.findIndex((tc: any) => tc.courseId === completedCourseId);
    const nextCourse = track.courses[currentIndex + 1];

    const isFullyCompleted = updatedCompletedCourses.length === track.courses.length;

    const updatedEnrollment = await prisma.trackEnrollment.update({
      where: { id: enrollment.id },
      data: {
        completedCourses: updatedCompletedCourses,
        currentCourseId: nextCourse ? nextCourse.courseId : null,
        status: isFullyCompleted ? "COMPLETED" : "ACTIVE",
        completedAt: isFullyCompleted ? new Date() : null,
      },
    });

    if (isFullyCompleted) {
      try {
        await CertificateService.issueCertificate(
          userId,
          trackId, // Using trackId here as the identifying "course" for the certificate service
          100, // Tracks are 100 on completion
          false,
          "TRACK_COMPLETION" as any
        );
      } catch (err) {
        console.error("Failed to issue track certificate:", err);
      }
    }

    return updatedEnrollment;
  }

  /**
   * Update track metadata
   */
  static async updateTrack(trackId: string, data: any) {
    return await prisma.track.update({
      where: { id: trackId },
      data: {
        title: data.title,
        description: data.description,
        slug: data.slug,
        isPublished: data.isPublished,
      },
    });
  }
}
