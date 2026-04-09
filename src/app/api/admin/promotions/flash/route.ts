// app/api/admin/promotions/flash/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, discountPercentage, startTime, endTime, courseIds } = body;

    if (!name || !discountPercentage || !startTime || !endTime) {
      return NextResponse.json(
        { error: "name, discountPercentage, startTime and endTime are required" },
        { status: 400 }
      );
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json({ error: "startTime must be before endTime" }, { status: 400 });
    }

    const flashSale = await prisma.flashSale.create({
      data: {
        name,
        description: description || null,
        discountPercentage: parseInt(discountPercentage),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isActive: true,
        courses: courseIds?.length
          ? { connect: courseIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        courses: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(flashSale, { status: 201 });
  } catch (error: any) {
    logger.error("admin:promotions:flash", "POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
