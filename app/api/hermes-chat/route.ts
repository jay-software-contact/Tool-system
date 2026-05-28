import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const HERMES_ENDPOINT =
  process.env.HERMES_CHAT_ENDPOINT || "http://localhost:3001/hermes/chat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    const res = await fetch(HERMES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      return new Response(
        JSON.stringify({ error: `Upstream error ${res.status}: ${errText}` }),
        {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Stream the response back as SSE
    const reader = res.body?.getReader();
    if (!reader) {
      return new Response("No response body", { status: 502 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (err) {
          console.error("[hermes-chat] Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
