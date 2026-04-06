import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tracks = await prisma.track.findMany({
      include: {
        _count: { select: { courses: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tracks);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, slug } = body;

    const track = await prisma.track.create({
      data: {
        title,
        description,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      },
    });

    return NextResponse.json(track);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
