import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TrackService } from "@/engine/lib/services/trackService";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackId } = await params;
    const enrollment = await TrackService.enrollInTrack(session.user.id, trackId);

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    const status = error.statusCode || 500;
    if (status === 500) {
      console.error("[TRACK_ENROLL_ERROR]", error);
    }
    return NextResponse.json({ error: error.message || "Internal Error" }, { status });
  }
}
