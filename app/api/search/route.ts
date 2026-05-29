// app/api/search/route.ts
// Global search endpoint — queries Appwrite collections and returns typed results.

import { NextRequest, NextResponse } from 'next/server';
import { Databases, Query, Client } from 'node-appwrite';

// ── Appwrite client setup ───────────────────────────────────────────────────

function createClient(): Databases {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || '')
    .setProject(process.env.APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

  return new Databases(client);
}

// ── Collection config ───────────────────────────────────────────────────────

const SEARCH_COLLECTIONS: Array<{
  id: string;
  type: 'tool' | 'component' | 'issue';
  fields: string[];
}> = [
  { id: 'tools',     type: 'tool',      fields: ['name', 'description', 'slug'] },
  { id: 'components',type: 'component', fields: ['name', 'type', 'slug'] },
  { id: 'issues',    type: 'issue',     fields: ['title', 'description', 'slug'] },
];

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '';

// ── GET handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q')?.trim().toLowerCase();

    if (!query || query.length < 1) {
      return NextResponse.json({
        tools: [],
        components: [],
        issues: [],
      });
    }

    // If Appwrite credentials are missing, return empty results (graceful degradation)
    if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID) {
      console.warn('[search] Appwrite credentials not configured — returning empty results');
      return NextResponse.json({
        tools: [],
        components: [],
        issues: [],
      });
    }

    const databases = createClient();
    const results: Record<string, unknown[]> = {};

    await Promise.all(
      SEARCH_COLLECTIONS.map(async ({ id, type, fields }) => {
        try {
          const queryStrings = fields.map((f) =>
            Query.search(f, query),
          );

          const response = await databases.listDocuments(
            DATABASE_ID,
            id,
            [
              Query.or(queryStrings),
              Query.limit(5),
              Query.orderDesc('$updatedAt'),
            ],
          );

          results[id] = response.documents.map((doc: any) => ({
            id: doc.$id,
            title: doc.name || doc.title || doc.$id,
            type,
            href: `/${type}s/${doc.slug || doc.$id}`,
            description: doc.description || undefined,
          }));
        } catch (err) {
          console.warn(`[search] collection "${id}" query failed:`, err);
          results[id] = [];
        }
      }),
    );

    return NextResponse.json({
      tools: results.tools || [],
      components: results.components || [],
      issues: results.issues || [],
    });
  } catch (err: any) {
    console.error('[search] unexpected error:', err);
    return NextResponse.json(
      {
        tools: [],
        components: [],
        issues: [],
      },
      { status: 200 },
    );
  }
}
