// src/app/api/admin/tracks/[trackId]/courses/[trackCourseId]/route.ts
// PATCH — update includedTopicIds for a specific TrackCourse entry
// DELETE — remove a specific TrackCourse entry by its own id
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_ROLES = ["ADMIN", "MANAGER"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ trackId: string; trackCourseId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !ADMIN_ROLES.includes(session.user.role as string))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { trackCourseId } = await params;
  const body = await req.json();
  const { includedTopicIds } = body as { includedTopicIds?: string[] };

  if (!Array.isArray(includedTopicIds))
    return NextResponse.json({ error: "includedTopicIds must be an array" }, { status: 400 });

  try {
    const updated = await prisma.trackCourse.update({
      where: { id: trackCourseId },
      data: { includedTopicIds },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "TrackCourse not found or update failed" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ trackId: string; trackCourseId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !ADMIN_ROLES.includes(session.user.role as string))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { trackCourseId } = await params;
  try {
    await prisma.trackCourse.delete({ where: { id: trackCourseId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
