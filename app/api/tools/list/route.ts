import { NextResponse } from 'next/server';
import { fetchTools } from "../../../../lib/appwrite";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/tools — Return all tools from Appwrite as JSON.
 * Client components call this instead of importing the SDK directly.
 */
export async function GET() {
  try {
    const tools = await fetchTools();
    return NextResponse.json({ tools });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch tools', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
