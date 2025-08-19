// // app/api/student/courses/[courseId]/progress/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { StudentCourseService } from "@/lib/services/student/courseService";

// // GET /api/student/courses/[courseId]/progress - Get detailed course progress
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { courseId: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== "STUDENT") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { courseId } = await params;

//     const progress = await StudentCourseService.getCourseProgress(
//       session.user.id,
//       courseId
//     );

//     return NextResponse.json(progress);
//   } catch (error) {
//     console.error("GET /api/student/courses/[courseId]/progress error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// app/api/student/courses/[courseId]/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProgressService } from "@/lib/services/progressService";

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = params;

    const progressData = await ProgressService.getCourseProgressData(
      session.user.id,
      courseId
    );

    return NextResponse.json(progressData);
  } catch (error) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}