import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH — tutor/admin reviews a submission: APPROVED | CHANGES_REQUIRED | REJECTED
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins and managers can review
  const reviewer = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!reviewer || !["ADMIN", "MANAGER"].includes(reviewer.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId } = await params;
  const body = await req.json();
  const { decision, reviewNotes } = body;

  const validDecisions = ["APPROVED", "CHANGES_REQUIRED", "REJECTED"];
  if (!validDecisions.includes(decision)) {
    return NextResponse.json(
      { error: `Invalid decision. Must be one of: ${validDecisions.join(", ")}` },
      { status: 400 }
    );
  }

  if ((decision === "CHANGES_REQUIRED" || decision === "REJECTED") && !reviewNotes?.trim()) {
    return NextResponse.json(
      { error: "Review notes are required when requesting changes or rejecting." },
      { status: 400 }
    );
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (submission.status === "APPROVED") {
    return NextResponse.json(
      { error: "This submission has already been approved." },
      { status: 409 }
    );
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: decision,
      reviewNotes: reviewNotes?.trim() || null,
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      topic: { select: { title: true } },
      reviewedBy: { select: { firstName: true, lastName: true } },
    },
  });

  return NextResponse.json({ submission: updated });
}

// GET — fetch a single submission (for admin detail view)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reviewer = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!reviewer || !["ADMIN", "MANAGER"].includes(reviewer.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, profileImage: true } },
      topic: {
        select: {
          title: true,
          topicType: true,
          module: { select: { title: true, course: { select: { title: true } } } },
        },
      },
      reviewedBy: { select: { firstName: true, lastName: true } },
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ submission });
}
