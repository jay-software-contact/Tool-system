import { NextRequest, NextResponse } from 'next/server';
import { client, DATABASE_ID } from '../../../../lib/appwrite';
import { Databases, ID, Query } from 'appwrite';

export const runtime = 'nodejs';

const COLLECTION_ID = process.env.APPWRITE_COMPONENTS_COLLECTION_ID || 'components';

const databases = new Databases(client());

// ── GET /api/components/[id] — Fetch single component ────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);

    return NextResponse.json({
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
    });
  } catch (err: any) {
    if (err?.code === 404) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }
    console.error('[api/components/[id]] GET error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch component' },
      { status: 500 }
    );
  }
}

// ── PUT /api/components/[id] — Update a component ────────────────────────────

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, aestheticCategory, type, designTokens } = body;

    const patch: Record<string, any> = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
      }
      patch.name = name.trim();
    }
    if (description !== undefined) {
      patch.description = description?.trim() || '';
    }
    if (aestheticCategory !== undefined) {
      if (typeof aestheticCategory !== 'string') {
        return NextResponse.json({ error: 'Aesthetic must be a string' }, { status: 400 });
      }
      patch.aestheticCategory = aestheticCategory;
    }
    if (type !== undefined) {
      if (typeof type !== 'string') {
        return NextResponse.json({ error: 'Type must be a string' }, { status: 400 });
      }
      patch.type = type;
    }
    if (designTokens !== undefined) {
      patch.designTokens = JSON.stringify(designTokens);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const doc = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, patch);

    return NextResponse.json({
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
    });
  } catch (err: any) {
    if (err?.code === 404) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }
    console.error('[api/components/[id]] PUT error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update component' },
      { status: 500 }
    );
  }
}

// ── DELETE /api/components/[id] — Delete a component ─────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (err: any) {
    if (err?.code === 404) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }
    console.error('[api/components/[id]] DELETE error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to delete component' },
      { status: 500 }
    );
  }
}
