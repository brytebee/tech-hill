// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const DEFAULT_SETTINGS: Record<string, string> = {
  promptReviewEmail: "brytebee@gmail.com",
};

// GET /api/admin/settings?key=promptReviewEmail
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
  }

  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  const value = setting?.value ?? DEFAULT_SETTINGS[key] ?? null;

  if (value === null) {
    return NextResponse.json({ error: "Setting not found" }, { status: 404 });
  }

  return NextResponse.json({ key, value });
}

// PUT /api/admin/settings
// Body: { key: string; value: string }
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { key, value } = body as { key: string; value: string };

  if (!key || typeof value !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Basic email validation for email-type settings
  if (key.toLowerCase().includes("email")) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
  }

  const updated = await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json({ key: updated.key, value: updated.value });
}
