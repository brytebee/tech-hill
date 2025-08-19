// // app/api/student/topics/[topicId]/mark-complete/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { StudentCourseService } from "@/lib/services/student/courseService";

// // POST /api/student/topics/[topicId]/mark-complete - Mark topic complete
// export async function POST(
//   request: NextRequest,
//   { params }: { params: { topicId: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== "STUDENT") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { topicId } = await params;

//     const complete = await StudentCourseService.completeTopic(
//       session.user.id,
//       topicId
//     );

//     return NextResponse.json({ complete });
//   } catch (error) {
//     console.error(
//       "POST /api/student/topics/[topicId]/mark-complete error:",
//       error
//     );
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


// app/api/student/topics/[topicId]/mark-complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProgressService } from "@/lib/services/progressService";

export async function POST(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topicId } = params;

    // Check if user can access this topic
    const canAccess = await ProgressService.canAccessTopic(session.user.id, topicId);
    if (!canAccess) {
      return NextResponse.json(
        { error: "Prerequisites not met" },
        { status: 403 }
      );
    }

    // Update topic progress
    const progress = await ProgressService.updateTopicProgress(
      session.user.id,
      topicId,
      true
    );

    return NextResponse.json({
      success: true,
      progress,
      canComplete: progress.status === "COMPLETED",
    });
  } catch (error) {
    console.error("Error marking topic complete:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
