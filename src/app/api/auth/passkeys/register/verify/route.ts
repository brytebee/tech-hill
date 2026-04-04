import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/engine/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

const rpID = process.env.NEXT_PUBLIC_APP_URL 
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname 
  : "localhost";
const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    const cookieStore = cookies();
    // @ts-ignore
    const expectedChallenge = cookieStore.get("webauthn_challenge")?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ error: "Challenge expired or not found" }, { status: 400 });
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

      // Save credential to database
      await prisma.passkeyCredential.create({
        data: {
          userId: session.user.id,
          credentialID: credential.id, // v10 uses base64url string natively for ID
          publicKey: Buffer.from(credential.publicKey),
          counter: BigInt(credential.counter),
          deviceType: credentialDeviceType,
          backedUp: credentialBackedUp,
          transports: credential.transports ? JSON.stringify(credential.transports) : null,
        },
      });

      // Clear the cookie securely
      // @ts-ignore
      cookieStore.delete("webauthn_challenge");

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ error: "Verification failed" }, { status: 400 });

  } catch (error: any) {
    console.error("Passkey Verify Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
