import { NextResponse } from "next/server";
import { getDatabases } from "../../../lib/appwrite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "core_db";

/**
 * GET /api/dashboard — Return real counts from Appwrite collections.
 */
export async function GET() {
  try {
    const databases = getDatabases();

    const [toolsRes, componentsRes] = await Promise.allSettled([
      databases.listDocuments(DATABASE_ID, "tools", []),
      databases.listDocuments(DATABASE_ID, "components", []),
    ]);

    const tools =
      toolsRes.status === "fulfilled" ? toolsRes.value.total ?? 0 : 0;
    const components =
      componentsRes.status === "fulfilled"
        ? componentsRes.value.total ?? 0
        : 0;

    return NextResponse.json({
      tools,
      components,
      status: "online",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard stats",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
