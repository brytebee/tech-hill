import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.certificateTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      // Only admins can create templates
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, themeName, primaryColor, logoUrl, signatureUrl, isDefault } = body;

    if (!name || !themeName) {
        return NextResponse.json({ error: "Name and Theme Selection are required" }, { status: 400 });
    }

    // Determine if we need to reset other defaults
    if (isDefault) {
      await prisma.certificateTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.certificateTemplate.create({
      data: {
        name,
        description,
        themeName,
        primaryColor,
        logoUrl,
        signatureUrl,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
