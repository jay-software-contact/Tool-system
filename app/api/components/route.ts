import { NextRequest, NextResponse } from 'next/server';

/**
 * Components API — CRUD for extracted components stored in Appwrite
 * 
 * POST /api/components — Create a new component
 * GET /api/components — List components (with optional filters)
 */

// In-memory store for demo (will be replaced with Appwrite)
const COMPONENT_STORE: Array<{
  id: string;
  name: string;
  description: string;
  aestheticCategory: string;
  type: string;
  function: string;
  designTokens: Record<string, string>;
  sourceUrl?: string;
  createdAt: string;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, aestheticCategory, type, function: fn, designTokens, sourceUrl } = body;

    if (!name || !aestheticCategory || !type) {
      return NextResponse.json(
        { error: 'name, aestheticCategory, and type are required' },
        { status: 400 }
      );
    }

    const component = {
      id: crypto.randomUUID(),
      name,
      description: description || '—',
      aestheticCategory,
      type,
      function: fn || 'Display',
      designTokens: designTokens || {},
      sourceUrl: sourceUrl || '',
      createdAt: new Date().toISOString(),
    };

    COMPONENT_STORE.push(component);

    return NextResponse.json({ success: true, component });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to create component' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const aesthetic = searchParams.get('aesthetic');
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let results = [...COMPONENT_STORE];

  if (aesthetic) {
    results = results.filter(c => c.aestheticCategory === aesthetic);
  }
  if (type) {
    results = results.filter(c => c.type === type);
  }

  return NextResponse.json({
    success: true,
    components: results.slice(0, limit),
    total: results.length,
  });
}
