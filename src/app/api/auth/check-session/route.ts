// app/api/auth/check-session/route.ts
//
// Pre-login check: detects whether this account has a live session on another
// device BEFORE the new login is committed.
//
// Single source of truth: the JWT maxAge is 1 hour (see lib/auth.ts).
// A session is considered "active" IFF:
//   1. The account exists and its status is ACTIVE.
//   2. lastLoginAt is within the last 1 hour (matches JWT maxAge exactly).
//
// tokenVersion is intentionally NOT used here — it only signals concurrent
// logins AFTER they happen, not whether a session is presently valid.
// Using it here was incorrect: tokenVersion > 0 merely means "user has ever
// logged in", which would fire for every returning user.
//
// This endpoint fails silently (returns false) on any error so it never
// blocks a legitimate login attempt.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Must match session.maxAge in lib/auth.ts exactly.
const JWT_MAX_AGE_MS = 1 * 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ hasActiveSession: false });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        lastLoginAt: true,
        status: true,
      },
    });

    // Non-existent or non-ACTIVE account — the normal auth flow will handle
    // rejection. We have nothing meaningful to warn about.
    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json({ hasActiveSession: false });
    }

    // No recorded login — first-time user, definitely no active session.
    if (!user.lastLoginAt) {
      return NextResponse.json({ hasActiveSession: false });
    }

    const msSinceLogin = Date.now() - new Date(user.lastLoginAt).getTime();

    // A session exists on another device only if someone logged in within
    // the last hour — because after 1 hour the JWT expires and NextAuth
    // marks the session unauthenticated automatically.
    const hasActiveSession = msSinceLogin < JWT_MAX_AGE_MS;

    return NextResponse.json({ hasActiveSession });
  } catch {
    // Fail silently — never block a legitimate login.
    return NextResponse.json({ hasActiveSession: false });
  }
}
