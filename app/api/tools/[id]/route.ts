import { NextRequest, NextResponse } from 'next/server';
import { client, DATABASE_ID } from '../../../../lib/appwrite';
import { Databases, ID } from 'appwrite';

export const runtime = 'nodejs';

const COLLECTION_ID = process.env.APPWRITE_TOOLS_COLLECTION_ID || 'tools';

const databases = new Databases(client());

// ── GET /api/tools/[id] — Fetch single tool ─────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);

    return NextResponse.json({
      id: doc.$id,
      name: doc.name,
      category: doc.category,
      description: doc.description,
      ratings: typeof doc.ratings === 'string' ? JSON.parse(doc.ratings) : doc.ratings,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    });
  } catch (err: any) {
    if (err?.code === 404) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch tool' },
      { status: 500 }
    );
  }
}

// ── PUT /api/tools/[id] — Update a tool ─────────────────────────────────────

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, category, description, ratings } = body;

    const patch: Record<string, any> = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
      }
      patch.name = name.trim();
    }
    if (category !== undefined) {
      if (typeof category !== 'string') {
        return NextResponse.json({ error: 'Category must be a string' }, { status: 400 });
      }
      patch.category = category;
    }
    if (description !== undefined) {
      patch.description = description?.trim() || '';
    }
    if (ratings !== undefined) {
      patch.ratings = JSON.stringify(ratings);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const doc = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, patch);

    return NextResponse.json({
      id: doc.$id,
      name: doc.name,
      category: doc.category,
      description: doc.description,
      ratings: typeof doc.ratings === 'string' ? JSON.parse(doc.ratings) : doc.ratings,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    });
  } catch (err: any) {
    if (err?.code === 404) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: err?.message || 'Failed to update tool' },
      { status: 500 }
    );
  }
}

// ── DELETE /api/tools/[id] — Delete a tool ──────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (err: any) {
    if (err?.code === 404) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: err?.message || 'Failed to delete tool' },
      { status: 500 }
    );
  }
}
