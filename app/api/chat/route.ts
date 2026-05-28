import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/chat — Simulated Hermes agent response.
 * Accepts { message: string } and returns a JSON content event.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Invalid request body. Expected { message: string }." },
        { status: 400 }
      );
    }

    // Simulated response — replace with real SSE streaming to Hermes later
    return Response.json({
      type: "content",
      text: "This is a simulated Hermes response. The SSE streaming pipeline will be connected here.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
