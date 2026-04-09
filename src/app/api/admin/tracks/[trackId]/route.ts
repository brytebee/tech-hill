import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackId } = await params;
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        courses: {
          orderBy: { order: "asc" },
          include: {
            course: true
          }
        }
      }
    });

    if (!track) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(track);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackId } = await params;
    const body = await req.json();
    const { courseId, order } = body;

    const trackCourse = await prisma.trackCourse.create({
      data: {
        trackId,
        courseId,
        order: Number(order) || 0
      }
    });

    return NextResponse.json(trackCourse);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ trackId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(req.url);
        const courseId = url.searchParams.get("courseId");
        const { trackId } = await params;

        if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

        await prisma.trackCourse.deleteMany({
            where: { trackId, courseId }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackId } = await params;
    const body = await req.json();
    
    const { title, description, slug, isPublished, price } = body;

    const dataToUpdate: any = {};
    if (price !== undefined) dataToUpdate.price = parseFloat(price) || 0;
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (slug !== undefined) dataToUpdate.slug = slug;
    if (isPublished !== undefined) dataToUpdate.isPublished = isPublished === true || isPublished === "true";

    const updatedTrack = await prisma.track.update({
      where: { id: trackId },
      data: dataToUpdate
    });

    return NextResponse.json(updatedTrack);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

