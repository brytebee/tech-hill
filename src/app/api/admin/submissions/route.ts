import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET — list all submissions (with optional status filter)
export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const topicId = searchParams.get("topicId");

  const submissions = await prisma.submission.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(topicId ? { topicId } : {}),
    },
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
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ submissions });
}
