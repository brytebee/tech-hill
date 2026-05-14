// src/app/api/admin/tracks/[trackId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_ROLES = ["ADMIN", "MANAGER"];

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !ADMIN_ROLES.includes(session.user.role as string))
    throw new Error("Unauthorized");
  return session;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    await requireAdmin();
    const { trackId } = await params;
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        courses: {
          orderBy: { order: "asc" },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                shortDescription: true,
                difficulty: true,
                duration: true,
                thumbnail: true,
                status: true,
                modules: {
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    title: true,
                    order: true,
                    topics: {
                      orderBy: { orderIndex: "asc" },
                      select: {
                        id: true,
                        title: true,
                        topicType: true,
                        duration: true,
                        orderIndex: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!track) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(track);
  } catch (err: any) {
    if (err.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    await requireAdmin();
    const { trackId } = await params;
    const body = await req.json();
    const { courseId, order, includedTopicIds = [] } = body;

    if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

    // Ensure order is at least the current count if not supplied
    const finalOrder =
      order !== undefined
        ? Number(order)
        : await prisma.trackCourse.count({ where: { trackId } });

    const trackCourse = await prisma.trackCourse.create({
      data: { trackId, courseId, order: finalOrder, includedTopicIds },
    });
    return NextResponse.json(trackCourse, { status: 201 });
  } catch (err: any) {
    if (err.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.code === "P2002")
      return NextResponse.json({ error: "Course already in track" }, { status: 409 });
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    await requireAdmin();
    const { trackId } = await params;
    const body = await req.json();
    const { action, courses: reorderPayload, title, description, slug, isPublished, price } = body;

    // Bulk reorder
    if (action === "reorder" && Array.isArray(reorderPayload)) {
      // Shift to safe high values first to avoid unique constraint conflicts
      await prisma.$transaction([
        ...reorderPayload.map((item: { id: string }, i: number) =>
          prisma.trackCourse.update({
            where: { id: item.id },
            data: { order: 10000 + i },
          })
        ),
        ...reorderPayload.map((item: { id: string; order: number }) =>
          prisma.trackCourse.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        ),
      ]);
      return NextResponse.json({ success: true });
    }

    // Standard track metadata update
    const dataToUpdate: any = {};
    if (price !== undefined) dataToUpdate.price = parseFloat(price) || 0;
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (slug !== undefined) dataToUpdate.slug = slug;
    if (isPublished !== undefined)
      dataToUpdate.isPublished = isPublished === true || isPublished === "true";

    const updated = await prisma.track.update({ where: { id: trackId }, data: dataToUpdate });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    await requireAdmin();
    const { trackId } = await params;
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

    await prisma.trackCourse.deleteMany({ where: { trackId, courseId } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
