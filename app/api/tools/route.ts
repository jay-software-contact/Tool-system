import { NextRequest, NextResponse } from 'next/server';
import { client, DATABASE_ID } from '../../../lib/appwrite';
import { Databases, ID, Query } from 'appwrite';

export const runtime = 'nodejs';

const COLLECTION_ID = process.env.APPWRITE_TOOLS_COLLECTION_ID || 'tools';

const databases = new Databases(client());

// ── POST /api/tools — Create a new tool ────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, description, ratings } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required (min 2 chars)' }, { status: 400 });
    }
    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        name: name.trim(),
        category,
        description: description?.trim() || '',
        ratings: JSON.stringify(ratings || {}),
      }
    );

    return NextResponse.json({ id: doc.$id, ...doc }, { status: 201 });
  } catch (err: any) {
    console.error('[api/tools] POST error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to create tool' },
      { status: 500 }
    );
  }
}

// ── GET /api/tools — List tools ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const queries = [];
    if (category) {
      queries.push(Query.equal('category', category));
    }
    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));
    queries.push(Query.orderDesc('$createdAt'));

    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      queries
    );

    return NextResponse.json({
      tools: result.documents.map((doc) => ({
        id: doc.$id,
        name: doc.name,
        category: doc.category,
        description: doc.description,
        ratings: typeof doc.ratings === 'string' ? JSON.parse(doc.ratings) : doc.ratings,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      })),
      total: result.total,
    });
  } catch (err: any) {
    console.error('[api/tools] GET error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to list tools' },
      { status: 500 }
    );
  }
}
