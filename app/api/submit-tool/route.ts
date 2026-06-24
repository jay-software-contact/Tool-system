/**
 * Tool Submission API
 * 
 * POST /api/submit-tool
 * 
 * Accepts tool data, validates it, and persists to Appwrite.
 * This is the entry point for adding new tools to the system.
 */

import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, Tables, ID, Permissions } from "../../../lib/appwrite";

// ---- Types ----

interface ToolSubmission {
  name: string;
  slug?: string;
  domain: string;
  category: string;
  subcategory?: string;
  description?: string;
  icon_url?: string;
  docs_url?: string;
  repo_url?: string;
  version?: string;
  license?: string;
  status?: string;
  tags?: string[];
  aesthetic_tags?: string[];
  rating_schema?: string;
  differentiation?: string;
  best_cases?: string[];
  worst_cases?: string[];
  created_by: string;
}

// ---- Validation ----

function validateTool(data: Partial<ToolSubmission>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 1) {
    errors.push("name is required");
  }
  if (!data.domain || data.domain.trim().length < 1) {
    errors.push("domain is required");
  }
  if (!data.category || data.category.trim().length < 1) {
    errors.push("category is required");
  }
  if (!data.created_by || data.created_by.trim().length < 1) {
    errors.push("created_by is required");
  }

  return { valid: errors.length === 0, errors };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---- Handler ----

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const submission: ToolSubmission = {
      ...body,
      slug: body.slug || generateSlug(body.name),
      status: body.status || "active",
      created_by: body.created_by || "system",
    };

    // Validate
    const { valid, errors } = validateTool(submission);
    if (!valid) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // Build document
    const now = Math.floor(Date.now() / 1000);
    const document = {
      name: submission.name,
      slug: submission.slug,
      domain: submission.domain,
      category: submission.category,
      subcategory: submission.subcategory || null,
      description: submission.description || null,
      icon_url: submission.icon_url || null,
      docs_url: submission.docs_url || null,
      repo_url: submission.repo_url || null,
      version: submission.version || null,
      license: submission.license || null,
      status: submission.status,
      tags: submission.tags || [],
      aesthetic_tags: submission.aesthetic_tags || [],
      rating_schema: submission.rating_schema || null,
      ratings: null,
      differentiation: submission.differentiation || null,
      best_cases: submission.best_cases || [],
      worst_cases: submission.worst_cases || [],
      integration_ids: [],
      issue_ids: [],
      proximity_cluster: null,
      proximity_neighbors: [],
      proximity_distance: [],
      component_ids: [],
      created_by: submission.created_by,
      created_at: now,
      updated_at: null,
    };

    // Persist
    const result = await databases.createDocument(
      DB_ID,
      Tables.TOOLS,
      ID.unique(),
      document,
      Permissions.admin()
    );

    return NextResponse.json({
      success: true,
      tool: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit tool";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ---- GET: List tools ----

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const queries = ["status:equal:active", `limit:${limit}`];
    
    if (domain) queries.push(`domain:equal:${domain}`);
    if (category) queries.push(`category:equal:${category}`);

    const result = await databases.listDocuments(DB_ID, Tables.TOOLS, queries as any);

    return NextResponse.json({
      success: true,
      tools: result.documents,
      total: (result as any).total || result.documents.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch tools";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
