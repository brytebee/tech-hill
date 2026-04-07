import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getSession(req: NextRequest) {
  return getServerSession(authOptions);
}

// GET — fetch current submission for this topic
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await getSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicId } = await params;

  const [submission, topic] = await Promise.all([
    prisma.submission.findFirst({
      where: { userId: session.user.id, topicId },
      include: {
        reviewedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.topic.findUnique({
      where: { id: topicId },
      select: { dueDate: true, allowLateSubmission: true },
    }),
  ]);

  const now = new Date();
  const deadlinePassed =
    !!topic?.dueDate && !topic?.allowLateSubmission && now > topic.dueDate;

  return NextResponse.json({ submission, dueDate: topic?.dueDate, deadlinePassed });
}

// POST — create or update a submission
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await getSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicId } = await params;
  const body = await req.json();
  const { content, description } = body;

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Project link is required" },
      { status: 400 }
    );
  }

  // Verify the topic exists and is a PRACTICE type
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  // Enforce deadline — block submissions past dueDate if late submissions are not allowed
  if (topic.dueDate && !topic.allowLateSubmission) {
    const now = new Date();
    if (now > topic.dueDate) {
      return NextResponse.json(
        {
          error: "The submission deadline for this project has passed.",
          dueDate: topic.dueDate,
          deadlinePassed: true,
        },
        { status: 403 }
      );
    }
  }

  // Find the most recent submission
  const existing = await prisma.submission.findFirst({
    where: { userId: session.user.id, topicId },
    orderBy: { createdAt: "desc" },
  });

  // Don't allow resubmission of an APPROVED project
  if (existing?.status === "APPROVED") {
    return NextResponse.json(
      { error: "This project has already been approved." },
      { status: 409 }
    );
  }

  let submission;

  if (existing && ["DRAFT", "CHANGES_REQUIRED", "REJECTED"].includes(existing.status)) {
    // Update or resubmit
    const isResubmit = existing.status === "CHANGES_REQUIRED" || existing.status === "REJECTED";
    submission = await prisma.submission.update({
      where: { id: existing.id },
      data: {
        content: content.trim(),
        description: description?.trim() || null,
        status: isResubmit ? "RESUBMITTED" : "SUBMITTED",
        submittedAt: new Date(),
        attemptNumber: isResubmit ? { increment: 1 } : existing.attemptNumber,
        // Clear previous review data on resubmit
        reviewNotes: isResubmit ? null : existing.reviewNotes,
        reviewedAt: isResubmit ? null : existing.reviewedAt,
        reviewedById: isResubmit ? null : existing.reviewedById,
      },
    });
  } else {
    // Brand new submission
    submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        topicId,
        content: content.trim(),
        description: description?.trim() || null,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ submission }, { status: 201 });
}
