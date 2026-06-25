/**
 * Data Layer — Switches between Appwrite (live) and local mock data.
 * 
 * Set NEXT_PUBLIC_USE_APPWRITE=true in .env.local to use live Appwrite.
 * Otherwise, the app uses local mock data so it works without a backend.
 * 
 * Appwrite schema for components:
 *   - name: string
 *   - description: string
 *   - aestheticCategory: string
 *   - type: JSON string (parsed to object by API)
 *   - createdAt: number (Unix timestamp)
 *   - updatedAt: number (Unix timestamp)
 *   - designTokens: JSON string with borderRadius, padding, gap, blur, border, focusRing
 */

import type { Tool, PipelineDomain, AestheticTaxonomy, ActivityLog, DesignTokens } from "./appwrite";
import { databases, DB_ID, Tables, Queries, parseDesignTokens } from "./appwrite";

// Default to mock data since Appwrite SDK types need migration for v19
// Set NEXT_PUBLIC_USE_APPWRITE=true once types are updated
const USE_APPWRITE = process.env.NEXT_PUBLIC_USE_APPWRITE === "true";

// ---- Mock Data (matches Appwrite schema) ----

const MOCK_TOOLS: Tool[] = [
  {
    $id: "tool-1", name: "React Hook Form",
    description: "Performant, flexible and extensible forms with easy-to-use validation.",
    aestheticCategory: "Minimalist",
    type: JSON.stringify({ name: "PrimaryButton", role: "input", variant: "rounded" }),
    designTokens: { borderRadius: "12px", padding: "12px 16px", gap: "8px", border: "1px solid #E5E7EB", focusRing: "0 0 0 3px rgba(99,102,241,0.2)" },
    createdAt: Math.floor((Date.now() - 86400000) / 1000),
    updatedAt: Math.floor((Date.now() - 86400000) / 1000),
  },
  {
    $id: "tool-2", name: "Zod",
    description: "TypeScript-first schema validation with static type inference.",
    aestheticCategory: "Minimalist",
    type: JSON.stringify({ name: "ValidationSchema", role: "logic", variant: "type-driven" }),
    designTokens: { borderRadius: "0px", padding: "0px", gap: "0px" },
    createdAt: Math.floor((Date.now() - 172800000) / 1000),
    updatedAt: Math.floor((Date.now() - 172800000) / 1000),
  },
  {
    $id: "tool-3", name: "TanStack Query",
    description: "Powerful asynchronous state management with automatic caching.",
    aestheticCategory: "GXSC",
    type: JSON.stringify({ name: "DataFetcher", role: "data", variant: "cache-aware" }),
    designTokens: { borderRadius: "8px", padding: "16px", gap: "12px", blur: "backdrop-filter: blur(8px)" },
    createdAt: Math.floor((Date.now() - 259200000) / 1000),
    updatedAt: Math.floor((Date.now() - 259200000) / 1000),
  },
  {
    $id: "tool-4", name: "Prisma",
    description: "Next-generation ORM with type-safe database client.",
    aestheticCategory: "Corporate",
    type: JSON.stringify({ name: "DatabaseClient", role: "data", variant: "type-safe" }),
    designTokens: { borderRadius: "6px", padding: "24px", gap: "16px", border: "1px solid #0066FF" },
    createdAt: Math.floor((Date.now() - 345600000) / 1000),
    updatedAt: Math.floor((Date.now() - 345600000) / 1000),
  },
  {
    $id: "tool-5", name: "Vercel AI SDK",
    description: "Open-source AI-powered UI library with streaming-first primitives.",
    aestheticCategory: "Futuristic",
    type: JSON.stringify({ name: "ChatInterface", role: "ai", variant: "conversational" }),
    designTokens: { borderRadius: "16px", padding: "20px 24px", gap: "12px", border: "1px solid rgba(124,58,237,0.3)", focusRing: "0 0 0 3px rgba(124,58,237,0.15)" },
    createdAt: Math.floor((Date.now() - 432000000) / 1000),
    updatedAt: Math.floor((Date.now() - 432000000) / 1000),
  },
  {
    $id: "tool-6", name: "OpenAI API",
    description: "Access to GPT-4, DALL-E, Whisper, and Embeddings for production apps.",
    aestheticCategory: "Futuristic",
    type: JSON.stringify({ name: "LLMEndpoint", role: "ai", variant: "api-driven" }),
    designTokens: { borderRadius: "12px", padding: "16px", gap: "8px", blur: "backdrop-filter: blur(12px)", border: "1px solid rgba(255,255,255,0.1)" },
    createdAt: Math.floor((Date.now() - 518400000) / 1000),
    updatedAt: Math.floor((Date.now() - 518400000) / 1000),
  },
  {
    $id: "tool-7", name: "Framer Motion",
    description: "Production-ready motion library with spring physics and gestures.",
    aestheticCategory: "Playful",
    type: JSON.stringify({ name: "MotionContainer", role: "animation", variant: "spring-physics" }),
    designTokens: { borderRadius: "20px", padding: "24px", gap: "16px", border: "none" },
    createdAt: Math.floor((Date.now() - 604800000) / 1000),
    updatedAt: Math.floor((Date.now() - 604800000) / 1000),
  },
  {
    $id: "tool-8", name: "Tailwind CSS",
    description: "Utility-first CSS framework for rapid custom UI development.",
    aestheticCategory: "Minimalist",
    type: JSON.stringify({ name: "StyleSystem", role: "styling", variant: "utility-first" }),
    designTokens: { borderRadius: "0px", padding: "0px", gap: "0px" },
    createdAt: Math.floor((Date.now() - 691200000) / 1000),
    updatedAt: Math.floor((Date.now() - 691200000) / 1000),
  },
  {
    $id: "tool-9", name: "Shadcn UI",
    description: "Beautifully designed components built with Radix UI and Tailwind CSS.",
    aestheticCategory: "GXSC",
    type: JSON.stringify({ name: "ComponentLibrary", role: "ui", variant: "composable" }),
    designTokens: { borderRadius: "12px", padding: "20px", gap: "12px", border: "1px solid #E5E7EB", focusRing: "0 0 0 2px rgba(0,0,0,0.1)" },
    createdAt: Math.floor((Date.now() - 777600000) / 1000),
    updatedAt: Math.floor((Date.now() - 777600000) / 1000),
  },
  {
    $id: "tool-10", name: "Appwrite",
    description: "Open-source backend server. Auth, databases, functions, storage, realtime.",
    aestheticCategory: "Corporate",
    type: JSON.stringify({ name: "BackendService", role: "backend", variant: "baas" }),
    designTokens: { borderRadius: "8px", padding: "24px", gap: "16px", border: "1px solid #2563EB" },
    createdAt: Math.floor((Date.now() - 864000000) / 1000),
    updatedAt: Math.floor((Date.now() - 864000000) / 1000),
  },
  {
    $id: "tool-11", name: "Drizzle ORM",
    description: "TypeScript ORM for SQL lovers. Lightweight, performant, zero abstraction cost.",
    aestheticCategory: "Corporate",
    type: JSON.stringify({ name: "SQLClient", role: "data", variant: "sql-first" }),
    designTokens: { borderRadius: "6px", padding: "16px", gap: "8px", border: "1px solid #CBD5E1" },
    createdAt: Math.floor((Date.now() - 950400000) / 1000),
    updatedAt: Math.floor((Date.now() - 950400000) / 1000),
  },
  {
    $id: "tool-12", name: "Figma Plugin API",
    description: "Build plugins for Figma. Access canvas, read design tokens, automate workflows.",
    aestheticCategory: "Playful",
    type: JSON.stringify({ name: "DesignTooling", role: "design", variant: "plugin" }),
    designTokens: { borderRadius: "16px", padding: "20px", gap: "12px", blur: "backdrop-filter: blur(8px)" },
    createdAt: Math.floor((Date.now() - 1036800000) / 1000),
    updatedAt: Math.floor((Date.now() - 1036800000) / 1000),
  },
];

const MOCK_PIPELINES: PipelineDomain[] = [
  {
    $id: "pipe-1", userId: "system",
    name: "Design to Code Pipeline",
    description: "Extract design tokens from Figma, generate React components with Tailwind, validate with Zod forms",
    status: "active",
    steps: [
      { id: "s1", label: "Extract", order: 0, tools: [{ id: "tool-12", name: "Figma Plugin API", role: "input", filled: true }], valid: true },
      { id: "s2", label: "Style", order: 1, tools: [{ id: "tool-8", name: "Tailwind CSS", role: "transform", filled: true }], valid: true },
      { id: "s3", label: "Components", order: 2, tools: [{ id: "tool-9", name: "Shadcn UI", role: "output", filled: true }], valid: true },
    ],
    createdAt: Math.floor(Date.now() / 1000) - 86400,
    updatedAt: Math.floor(Date.now() / 1000) - 86400,
    toolCount: 3,
    tags: ["frontend", "design-system"],
  },
  {
    $id: "pipe-2", userId: "system",
    name: "Full-Stack AI App",
    description: "AI-powered app with OpenAI, Prisma backend, React frontend, and Appwrite auth",
    status: "active",
    steps: [
      { id: "s1", label: "AI Layer", order: 0, tools: [{ id: "tool-6", name: "OpenAI API", role: "input", filled: true }], valid: true },
      { id: "s2", label: "UI Layer", order: 1, tools: [{ id: "tool-5", name: "Vercel AI SDK", role: "transform", filled: true }, { id: "tool-3", name: "TanStack Query", role: "data", filled: true }], valid: true },
      { id: "s3", label: "Backend", order: 2, tools: [{ id: "tool-4", name: "Prisma", role: "data", filled: true }, { id: "tool-10", name: "Appwrite", role: "auth", filled: true }], valid: true },
    ],
    createdAt: Math.floor(Date.now() / 1000) - 172800,
    updatedAt: Math.floor(Date.now() / 1000) - 172800,
    toolCount: 5,
    tags: ["fullstack", "ai"],
  },
  {
    $id: "pipe-3", userId: "system",
    name: "Type-Safe Form System",
    description: "End-to-end type-safe forms with Zod, React Hook Form, and Shadcn UI",
    status: "draft",
    steps: [
      { id: "s1", label: "Schema", order: 0, tools: [{ id: "tool-2", name: "Zod", role: "schema", filled: true }], valid: true },
      { id: "s2", label: "Form", order: 1, tools: [{ id: "tool-1", name: "React Hook Form", role: "form", filled: true }], valid: true },
      { id: "s3", label: "UI", order: 2, tools: [{ id: "tool-9", name: "Shadcn UI", role: "ui", filled: true }], valid: true },
    ],
    createdAt: Math.floor(Date.now() / 1000) - 259200,
    updatedAt: Math.floor(Date.now() / 1000) - 259200,
    toolCount: 3,
    tags: ["frontend", "forms"],
  },
];

const MOCK_TAXONOMY: AestheticTaxonomy[] = [
  { $id: "tax-1", name: "Gen X Soft Club", slug: "gxsc", level: 0, sortOrder: 0, isActive: true,
    perceptualObjective: "Hazy Melancholia and Comfy Futurism",
    aestheticClassification: "Analog-Residue, Muted-Chromatic, Ultramodern-Revival",
    externalTags: ["retro-futurism", "muted-palette"],
    createdAt: Math.floor(Date.now() / 1000) },
  { $id: "tax-2", name: "Ultramodern Revival", slug: "ultramodern-revival", parentId: "gxsc", level: 1, sortOrder: 0, isActive: true,
    perceptualObjective: "Clean lines meet nostalgic warmth",
    aestheticClassification: "Geometric, Warm-Muted, Layered-Depth",
    externalTags: ["minimal", "warm-tones"],
    createdAt: Math.floor(Date.now() / 1000) },
  { $id: "tax-3", name: "Analog Residue", slug: "analog-residue", parentId: "gxsc", level: 1, sortOrder: 1, isActive: true,
    perceptualObjective: "The feeling of old technology still in use",
    aestheticClassification: "Textured, Warm-Amber, Nostalgic",
    externalTags: ["retro", "textured"],
    createdAt: Math.floor(Date.now() / 1000) },
  { $id: "tax-4", name: "Functional Minimalism", slug: "functional-minimalism", level: 0, sortOrder: 1, isActive: true,
    perceptualObjective: "Maximum information density with zero visual noise",
    aestheticClassification: "Grid-Based, Monochromatic, Systematic",
    externalTags: ["minimal", "grid"],
    createdAt: Math.floor(Date.now() / 1000) },
  { $id: "tax-5", name: "Conversational AI", slug: "conversational-ai", level: 0, sortOrder: 2, isActive: true,
    perceptualObjective: "Interfaces that feel like talking to a knowledgeable friend",
    aestheticClassification: "Streaming, Bilateral, Warm-Chromatic",
    externalTags: ["ai", "chat", "streaming"],
    createdAt: Math.floor(Date.now() / 1000) },
];

const MOCK_ACTIVITY: ActivityLog[] = [
  { $id: "act-1", userId: "system", action: "tool.created", entityType: "tool", entityId: "tool-1", diff: JSON.stringify({ name: "React Hook Form" }), timestamp: Math.floor(Date.now() / 1000) },
  { $id: "act-2", userId: "system", action: "tool.created", entityType: "tool", entityId: "tool-2", diff: JSON.stringify({ name: "Zod" }), timestamp: Math.floor(Date.now() / 1000) - 60 },
  { $id: "act-3", userId: "system", action: "pipeline.created", entityType: "pipeline", entityId: "pipe-1", diff: JSON.stringify({ name: "Design to Code Pipeline" }), timestamp: Math.floor(Date.now() / 1000) - 120 },
  { $id: "act-4", userId: "system", action: "taxonomy.created", entityType: "aesthetic_taxonomy", entityId: "tax-1", diff: JSON.stringify({ name: "Gen X Soft Club" }), timestamp: Math.floor(Date.now() / 1000) - 180 },
];

// ---- Data Access Functions ----

export function isUsingAppwrite(): boolean {
  return USE_APPWRITE;
}

export async function fetchTools(): Promise<Tool[]> {
  if (USE_APPWRITE) {
    const result = await databases.listDocuments(DB_ID, Tables.TOOLS, Queries.active());
    return (result.documents as unknown[]).map(doc => {
      const d = doc as Record<string, unknown>;
      return {
        $id: d.$id as string,
        name: (d.name as string) || "—",
        description: (d.description as string) || "—",
        aestheticCategory: (d.aestheticCategory as string) || "—",
        type: (d.type as string) || "{}",
        createdAt: (d.createdAt as number) || 0,
        updatedAt: (d.updatedAt as number),
        designTokens: parseDesignTokens(d.designTokens),
        status: d.status as string | undefined,
      };
    });
  }
  return MOCK_TOOLS;
}

export async function fetchPipelines(): Promise<PipelineDomain[]> {
  if (USE_APPWRITE) {
    const result = await databases.listDocuments(DB_ID, Tables.PIPELINES, []);
    return result.documents as unknown as PipelineDomain[];
  }
  return MOCK_PIPELINES;
}

export async function fetchTaxonomy(): Promise<AestheticTaxonomy[]> {
  if (USE_APPWRITE) {
    const result = await databases.listDocuments(DB_ID, Tables.AESTHETIC_TAXONOMY, []);
    return result.documents as unknown as AestheticTaxonomy[];
  }
  return MOCK_TAXONOMY;
}

export async function fetchActivityLog(): Promise<ActivityLog[]> {
  if (USE_APPWRITE) {
    const result = await databases.listDocuments(DB_ID, Tables.ACTIVITY_LOG, []);
    return result.documents as unknown as ActivityLog[];
  }
  return MOCK_ACTIVITY;
}

export async function fetchToolBySlug(slug: string): Promise<Tool | null> {
  if (USE_APPWRITE) {
    const result = await databases.listDocuments(DB_ID, Tables.TOOLS, [Queries.bySlug(slug)]);
    const docs = result.documents as unknown[];
    if (docs.length === 0) return null;
    const d = docs[0] as Record<string, unknown>;
    return {
      $id: d.$id as string,
      name: (d.name as string) || "—",
      description: (d.description as string) || "—",
      aestheticCategory: (d.aestheticCategory as string) || "—",
      type: (d.type as string) || "{}",
      createdAt: (d.createdAt as number) || 0,
      updatedAt: (d.updatedAt as number),
      designTokens: parseDesignTokens(d.designTokens),
      status: d.status as string | undefined,
    };
  }
  return MOCK_TOOLS.find(t => t.$id === slug) || null;
}

export { MOCK_TOOLS, MOCK_PIPELINES, MOCK_TAXONOMY, MOCK_ACTIVITY };
