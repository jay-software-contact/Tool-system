/**
 * Appwrite Client & Service Layer (SDK 19.x compatible)
 * 
 * Uses the new Databases API (replaced TablesDB in SDK 18+).
 * API: createDocument, listDocument, etc.
 * 
 * Component fields match Appwrite schema:
 *   - name: string
 *   - description: string
 *   - aestheticCategory: string (one of 7 presets)
 *   - type: JSON string in Appwrite, parsed to object by API
 *   - createdAt: number (Unix timestamp)
 *   - updatedAt: number (Unix timestamp)
 *   - designTokens: { borderRadius?, padding?, gap?, blur?, border?, focusRing? }
 */

import { Client, Databases, Storage, Functions, ID, Query, Permission, Role } from "appwrite";

// ---- Configuration ----

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://nyc.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const apiKey = process.env.APPWRITE_SERVER_KEY || process.env.APPWRITE_API_KEY || "";
const databaseId = "core_db";

// ---- Client ----

const client = new Client();
client.setEndpoint(endpoint).setProject(projectId);
if (apiKey) {
  (client as any).setKey(apiKey);
}

export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// ---- Constants ----

export const DB_ID = databaseId;

export const Tables = {
  TOOLS: "tools",
  AESTHETIC_TAXONOMY: "aesthetic_taxonomy",
  UI_COMPONENTS: "ui_components",
  TEMPLATES: "templates",
  USER_TEMPLATES: "user_templates",
  ISSUES: "issues",
  PIPELINES: "pipelines",
  ACTIVITY_LOG: "activity_log",
  RATING_SCHEMAS: "rating_schemas",
} as const;

// ---- Design Tokens Type ----

export interface DesignTokens {
  borderRadius?: string;
  padding?: string;
  gap?: string;
  blur?: string;
  border?: string;
  focusRing?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  boxShadow?: string;
  gradient?: string;
  [key: string]: string | undefined;
}

// ---- Tool Component (matches Appwrite schema) ----

export interface Tool {
  $id: string;
  name: string;
  description: string;
  aestheticCategory: string;
  type: string;
  createdAt: number;
  updatedAt?: number;
  designTokens?: DesignTokens;
  status?: string;
  domain?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  proximityCluster?: string;
  proximityNeighbors?: string[];
  proximityDistance?: number[];
  aestheticTags?: string[];
  componentIds?: string[];
  ratingSchema?: string;
  differentiation?: string;
  bestCases?: string[];
  worstCases?: string[];
  integrationIds?: string[];
  issueIds?: string[];
  repoUrl?: string;
  docsUrl?: string;
  createdBy?: string;
}

// ---- Pipeline ----

export type PipelineStatus = "draft" | "active" | "paused" | "error" | "completed";

export interface PipelineDomain {
  $id: string;
  userId: string;
  name: string;
  description?: string;
  domain?: string;
  status: PipelineStatus;
  nodes?: string;
  connections?: string;
  aestheticTaxonomyIds?: string[];
  createdAt: number;
  updatedAt?: number;
  toolCount?: number;
  steps?: Array<{
    id: string;
    label: string;
    order: number;
    tools: Array<{ id: string; name: string; role: string; icon?: string; filled: boolean }>;
    valid: boolean;
  }>;
  tags?: string[];
}

// ---- Aesthetic Taxonomy ----

export interface AestheticTaxonomy {
  $id: string;
  name: string;
  slug: string;
  parentId?: string;
  parent_id?: string;
  level: number;
  sortOrder: number;
  sort_order?: number;
  isActive: boolean;
  is_active?: boolean;
  perceptualObjective?: string;
  perceptual_objective?: string;
  aestheticClassification?: string;
  aesthetic_classification?: string;
  masterPromptTemplate?: string;
  master_prompt_template?: string;
  externalTags?: string[];
  external_tags?: string[];
  createdAt: number;
  created_at?: number;
}

// ---- Activity Log ----

export interface ActivityLog {
  $id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  diff?: string; // JSON string
  timestamp: number;
}



// ---- Query Helpers ----

export const Queries = {
  bySlug: (value: string) => Query.equal("slug", [value]),
  byStatus: (status: string) => Query.equal("status", [status]),
  byDomain: (domain: string) => Query.equal("domain", [domain]),
  byCategory: (category: string) => Query.equal("category", [category]),
  byUser: (userId: string) => Query.equal("userId", [userId]),
  recent: () => [Query.orderDesc("$createdAt")],
  active: () => [Query.equal("status", ["active"])],
  paginated: (offset: number, limit: number) => [Query.offset(offset), Query.limit(limit)],
  limit: (n: number) => Query.limit(n),
};

// ---- Permission Helpers ----

export const Permissions = {
  admin: (teamId: string = "admin") => [
    Permission.read(Role.team(teamId)),
    Permission.create(Role.team(teamId)),
    Permission.update(Role.team(teamId)),
    Permission.delete(Role.team(teamId)),
  ],
  publicRead: () => [
    Permission.read(Role.users()),
    Permission.read(Role.any()),
  ],
  ownerOnly: (userId: string) => [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ],
};

// ---- Helper: Parse Appwrite component with JSON type field ----

export function parseToolFromAppwrite(doc: Record<string, unknown>): Tool {
  return {
    $id: doc.$id as string,
    name: (doc.name as string) || "—",
    description: (doc.description as string) || "—",
    aestheticCategory: (doc.aestheticCategory as string) || (doc.aesthetic_category as string) || "—",
    type: (doc.type as string) || "{}",
    createdAt: (doc.createdAt as number) || (doc.created_at as number) || 0,
    updatedAt: (doc.updatedAt as number) || (doc.updated_at as number),
    designTokens: parseDesignTokens(doc.designTokens || doc.design_tokens),
    status: doc.status as string | undefined,
  };
}

export function parseDesignTokens(value: unknown): DesignTokens {
  if (!value) return {};
  if (typeof value === "object") return value as DesignTokens;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as DesignTokens;
    } catch {
      return {};
    }
  }
  return {};
}

// ---- Re-exports ----

export { ID, Query, Permission, Role };
export default client;
