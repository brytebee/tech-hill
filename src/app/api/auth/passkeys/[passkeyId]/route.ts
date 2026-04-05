import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/engine/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ passkeyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { passkeyId } = await params;

    // Ensure the passkey belongs to the requesting user before deleting
    const passkey = await prisma.passkeyCredential.findUnique({
      where: { id: passkeyId },
      select: { userId: true },
    });

    if (!passkey) {
      return NextResponse.json({ error: "Passkey not found" }, { status: 404 });
    }

    if (passkey.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.passkeyCredential.delete({
      where: { id: passkeyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Passkey Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
