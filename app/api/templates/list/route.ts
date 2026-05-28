import { NextResponse } from "next/server";
import { getDatabases } from "../../../../lib/appwrite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "core_db";

/**
 * GET /api/templates/list — Return all templates from Appwrite as JSON.
 */
export async function GET() {
  try {
    const databases = getDatabases();
    const res = await databases.listDocuments(DATABASE_ID, "templates", []);
    return NextResponse.json({ templates: res.documents });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to fetch templates",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
