// app/api/admin/tracks/[trackId]/reopen-completed/route.ts
//
// One-shot admin endpoint to reopen TrackEnrollments that reached 100%
// BEFORE new courses were added to that track.
//
// Usage (curl):
//   curl -X POST https://<your-domain>/api/admin/tracks/<trackId>/reopen-completed \
//        -H "Cookie: <your-admin-session-cookie>"
//
// The seeder idempotency means this only needs to be called ONCE per track
// expansion event. After this, new course completions propagate through the
// normal TrackService.updateTrackProgress() flow.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProgressService } from "@/lib/services/progressService";

interface RouteContext {
  params: Promise<{ trackId: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { trackId } = await params;

  try {
    const reopened = await (ProgressService as any).reopenTrackEnrollmentForNewCourse(trackId);

    return NextResponse.json({
      success: true,
      message: `Reopened ${reopened} completed track enrollment(s). Affected students have been notified.`,
      reopened,
    });
  } catch (error: any) {
    console.error("[reopen-completed-tracks] Error:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to reopen track enrollments." },
      { status: 500 }
    );
  }
}
