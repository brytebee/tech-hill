// app/api/health-check/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Simple health check endpoint for connection testing
    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        message: "Connection test successful",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
      },
      { status: 500 }
    );
  }
}
