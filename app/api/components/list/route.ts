import { NextResponse } from "next/server";
import { getDatabases } from "../../../../lib/appwrite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "core_db";

/**
 * GET /api/components/list — Return all UI components from Appwrite as JSON.
 */
export async function GET() {
  try {
    const databases = getDatabases();
    const res = await databases.listDocuments(DATABASE_ID, "components", []);
    return NextResponse.json({ components: res.documents });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to fetch components",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
