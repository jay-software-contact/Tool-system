import { NextRequest, NextResponse } from 'next/server';
import { client, DATABASE_ID } from '../../../lib/appwrite';
import { Databases, ID, Query } from 'appwrite';

export const runtime = 'nodejs';

const COLLECTION_ID = process.env.APPWRITE_COMPONENTS_COLLECTION_ID || 'components';

const databases = new Databases(client());

// ── POST /api/components — Create a new component ────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, aestheticCategory, type, designTokens } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required (min 2 chars)' }, { status: 400 });
    }
    if (!aestheticCategory || typeof aestheticCategory !== 'string') {
      return NextResponse.json({ error: 'Aesthetic category is required' }, { status: 400 });
    }
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        name: name.trim(),
        description: description?.trim() || '',
        aestheticCategory,
        type,
        designTokens: JSON.stringify(designTokens || {}),
      }
    );

    return NextResponse.json(
      {
        id: doc.$id,
        name: doc.name,
        description: doc.description,
        aestheticCategory: doc.aestheticCategory,
        type: doc.type,
        designTokens: typeof doc.designTokens === 'string'
          ? JSON.parse(doc.designTokens)
          : doc.designTokens,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to create component' },
      { status: 500 }
    );
  }
}

// ── GET /api/components — List components ────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const aesthetic = searchParams.get('aesthetic');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const queries = [];
    if (aesthetic) {
      queries.push(Query.equal('aestheticCategory', aesthetic));
    }
    if (type) {
      queries.push(Query.equal('type', type));
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
      components: result.documents.map((doc) => ({
        id: doc.$id,
        name: doc.name,
        description: doc.description,
        aestheticCategory: doc.aestheticCategory,
        type: doc.type,
        designTokens: typeof doc.designTokens === 'string'
          ? JSON.parse(doc.designTokens)
          : doc.designTokens,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      })),
      total: result.total,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to list components' },
      { status: 500 }
    );
  }
}
