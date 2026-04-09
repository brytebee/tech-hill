import { prisma } from "@/lib/db";
import {
  CertificateType,
  CertificateStatus,
  MasteryLevel,
} from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export class CertificateService {
  /**
   * Generates a unique readable certificate number
   * Format: TH-YYYY-XXXXXXXX
   */
  static generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `TH-${year}-${randomStr}`;
  }

  /**
   * Automatically issues a certificate based on course or track enrollment data.
   */
  static async issueCertificate(
    userId: string,
    targetId: string, // courseId or trackId
    finalScore?: number | null,
    requireApproval = false,
    type: CertificateType = "COURSE_COMPLETION",
  ) {
    const isTrack = type === "TRACK_COMPLETION";

    // Check if certificate already exists for this user/target/type (idempotent)
    const existing = await prisma.certificate.findFirst({
      where: {
        userId,
        ...(isTrack ? { trackId: targetId } : { courseId: targetId }),
        certificateType: type,
      },
    });

    if (existing) {
      return existing;
    }

    let title = "";
    let description = "";

    if (isTrack) {
      const track = await prisma.track.findUnique({
        where: { id: targetId },
        select: { title: true },
      });
      if (!track) throw new Error("Track not found");
      title = `${track.title} Professional Mastery`;
      description = `Successfully navigated the complete learning path for ${track.title} and demonstrated comprehensive mastery of all sequenced modules.`;
    } else {
      const course = await prisma.course.findUnique({
        where: { id: targetId },
        select: { title: true },
      });
      if (!course) throw new Error("Course not found");
      title = `${course.title} Course Completion`;
      description = `Successfully completed the course requirements and assessments for ${course.title}.`;
    }

    // Determine mastery level from final score
    let masteryLevel: MasteryLevel | null = null;
    if (finalScore !== undefined && finalScore !== null) {
      if (finalScore >= 95) masteryLevel = "EXPERT";
      else if (finalScore >= 85) masteryLevel = "ADVANCED";
      else if (finalScore >= 75) masteryLevel = "PROFICIENT";
      else if (finalScore >= 60) masteryLevel = "DEVELOPING";
      else masteryLevel = "NOVICE";
    }

    const status: CertificateStatus = requireApproval ? "PENDING_REVIEW" : "ISSUED";

    return await prisma.certificate.create({
      data: {
        userId,
        ...(isTrack ? { trackId: targetId } : { courseId: targetId }),
        certificateNumber: this.generateCertificateNumber(),
        verificationCode: uuidv4(),
        certificateType: type,
        status,
        title,
        description,
        finalScore: finalScore ?? null,
        masteryLevel,
      },
    });
  }

  /**
   * Admin approves a pending certificate
   */
  static async approveCertificate(certificateId: string) {
    return await prisma.certificate.update({
      where: { id: certificateId },
      data: { status: "ISSUED" },
    });
  }

  /**
   * Admin rejects a pending certificate
   */
  static async rejectCertificate(certificateId: string, reason?: string) {
    return await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        status: "REJECTED",
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason || "Did not meet requirements",
      },
    });
  }

  /**
   * Get all certificates (Admin / Manager tool) — FIX 3: includes template for render link
   */
  static async getAllCertificates(status?: CertificateStatus) {
    return await prisma.certificate.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        course: {
          select: {
            title: true,
          },
        },
        track: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });
  }

  /**
   * Get user certificates
   */
  static async getUserCertificates(userId: string) {
    return await prisma.certificate.findMany({
      where: {
        userId,
        status: "ISSUED",
        isRevoked: false,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        track: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });
  }
}
