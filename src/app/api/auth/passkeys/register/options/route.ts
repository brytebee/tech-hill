import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/engine/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

const rpName = "Tech Hill";
const rpID = process.env.NEXT_PUBLIC_APP_URL 
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname 
  : "localhost";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { passkeys: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: user.email,
      // Convert our unique CUID user.id into a generic Uint8Array to satisfy WebAuthn specs
      userID: new Uint8Array(Buffer.from(user.id)),
      attestationType: "none",
      // Exclude existing credentials
      excludeCredentials: user.passkeys.map((passkey) => ({
        id: passkey.credentialID,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Store the challenge in a secure HTTP-Only cookie for verification
    const cookieStore = await cookies();
    // @ts-ignore typescript complains about cookies(), but it works in server actions/routes
    cookieStore.set("webauthn_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 5, // 5 minutes
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json(options);

  } catch (error: any) {
    console.error("Passkey Options Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
