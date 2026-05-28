import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HERMES_ENDPOINT = process.env.HERMES_ENDPOINT ?? "";
const HERMES_API_KEY = process.env.HERMES_API_KEY ?? "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.message !== "string") {
      return new Response(
        JSON.stringify({ error: "Expected { message: string }" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!HERMES_ENDPOINT || !HERMES_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Hermes Agent endpoint not configured." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const hermesResponse = await fetch(HERMES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + HERMES_API_KEY,
      },
      body: JSON.stringify({ message: body.message }),
    });

    if (!hermesResponse.ok) {
      const errorText = await hermesResponse.text().catch(() => "unknown error");
      return new Response(
        JSON.stringify({ error: "Hermes Agent returned " + hermesResponse.status + ": " + errorText }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!hermesResponse.body) {
      return new Response(
        JSON.stringify({ error: "Hermes Agent returned empty body." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(hermesResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    return new Response(
      JSON.stringify({ error: "Hermes Agent request failed: " + detail }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
