import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

const rpID = process.env.NEXT_PUBLIC_APP_URL 
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname 
  : "localhost";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { passkeys: true },
    });

    if (!user || user.passkeys.length === 0) {
      // Return 404 so the client knows to fallback to Password login
      return NextResponse.json({ error: "No passkeys found for this user" }, { status: 404 });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.passkeys.map(passkey => ({
        id: passkey.credentialID,
        transports: passkey.transports ? JSON.parse(passkey.transports) : undefined,
      })),
      userVerification: 'preferred',
    });

    const cookieStore = await cookies();
    // @ts-ignore
    cookieStore.set("webauthn_auth_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 5, // 5 minutes
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json(options);

  } catch (error: any) {
    console.error("Passkey Auth Options Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
