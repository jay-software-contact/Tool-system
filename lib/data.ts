/**
 * Data Layer — Switches between Appwrite (live) and local mock data.
 * 
 * Set USE_APPWRITE=true in .env.local to use live Appwrite.
 * Otherwise, the app uses local mock data so it works without a backend.
 * 
 * This lets you develop and demo the full UI before Appwrite is resumed.
 */

import type { Tool, PipelineDomain, AestheticTaxonomy, ActivityLog } from "./appwrite";

// ---- Configuration ----

// Default to mock data since Appwrite SDK types need migration for v19
// Set NEXT_PUBLIC_USE_APPWRITE=true once types are updated
const USE_APPWRITE = process.env.NEXT_PUBLIC_USE_APPWRITE === "true";

// ---- Mock Data ----

const MOCK_TOOLS: Tool[] = [
  {
    $id: "tool-1", name: "React Hook Form", slug: "react-hook-form",
    domain: "frontend", category: "forms", subcategory: "form-management",
    description: "Performant, flexible and extensible forms with easy-to-use validation.",
    repoUrl: "https://github.com/react-hook-form/react-hook-form",
    version: "7.53.0", license: "MIT", status: "active",
    tags: ["react", "forms", "validation", "performance"],
    aestheticTags: ["minimal", "functional", "state-driven"],
    ratingSchema: "frontend_framework",
    differentiation: "Uncontrolled components with minimal re-renders.",
    bestCases: ["Complex forms", "Performance-critical apps"],
    worstCases: ["Simple one-page forms"],
    integrationIds: [], issueIds: [],
    proximityCluster: "frontend-forms", proximityNeighbors: ["tool-2"],
    proximityDistance: [0.3], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 86400,
  },
  {
    $id: "tool-2", name: "Zod", slug: "zod",
    domain: "frontend", category: "validation", subcategory: "schema-validation",
    description: "TypeScript-first schema validation with static type inference.",
    repoUrl: "https://github.com/colinhacks/zod",
    version: "3.23.8", license: "MIT", status: "active",
    tags: ["typescript", "validation", "schema", "type-safety"],
    aestheticTags: ["type-driven", "functional", "minimal"],
    ratingSchema: "frontend_framework",
    differentiation: "Static TypeScript types inferred from schemas automatically.",
    bestCases: ["API boundary validation", "Form validation with type safety"],
    worstCases: ["Non-TypeScript projects"],
    integrationIds: [], issueIds: [],
    proximityCluster: "frontend-forms", proximityNeighbors: ["tool-1"],
    proximityDistance: [0.3], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 172800,
  },
  {
    $id: "tool-3", name: "TanStack Query", slug: "tanstack-query",
    domain: "frontend", category: "data-fetching", subcategory: "server-state",
    description: "Powerful asynchronous state management with automatic caching.",
    repoUrl: "https://github.com/TanStack/query",
    version: "5.59.0", license: "MIT", status: "active",
    tags: ["react", "data-fetching", "caching", "async"],
    aestheticTags: ["state-driven", "realtime", "cache-aware"],
    ratingSchema: "frontend_framework",
    differentiation: "Framework-agnostic with granular cache lifecycle control.",
    bestCases: ["Complex data dependencies", "Real-time dashboards"],
    worstCases: ["Simple CRUD apps"],
    integrationIds: [], issueIds: [],
    proximityCluster: "frontend-data", proximityNeighbors: ["tool-4"],
    proximityDistance: [0.4], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 259200,
  },
  {
    $id: "tool-4", name: "Prisma", slug: "prisma",
    domain: "backend", category: "database", subcategory: "orm",
    description: "Next-generation ORM with type-safe database client and migrations.",
    repoUrl: "https://github.com/prisma/prisma",
    version: "5.20.0", license: "Apache-2.0", status: "active",
    tags: ["database", "orm", "typescript", "migrations"],
    aestheticTags: ["type-driven", "declarative", "data-heavy"],
    ratingSchema: "database",
    differentiation: "Generated client with full type safety and declarative schema.",
    bestCases: ["PostgreSQL projects", "Type-safe queries"],
    worstCases: ["NoSQL databases"],
    integrationIds: [], issueIds: [],
    proximityCluster: "backend-data", proximityNeighbors: ["tool-3"],
    proximityDistance: [0.4], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 345600,
  },
  {
    $id: "tool-5", name: "Vercel AI SDK", slug: "vercel-ai-sdk",
    domain: "ai", category: "ai-framework", subcategory: "llm-integration",
    description: "Open-source AI-powered UI library for React, Svelte, Vue.",
    repoUrl: "https://github.com/vercel/ai",
    version: "4.0.0", license: "Apache-2.0", status: "active",
    tags: ["ai", "llm", "streaming", "react"],
    aestheticTags: ["conversational", "streaming", "realtime"],
    ratingSchema: "frontend_framework",
    differentiation: "Streaming-first primitives that work with any LLM provider.",
    bestCases: ["Chat interfaces", "Streaming AI responses"],
    worstCases: ["Non-streaming AI"],
    integrationIds: [], issueIds: [],
    proximityCluster: "ai-interface", proximityNeighbors: ["tool-6"],
    proximityDistance: [0.5], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 432000,
  },
  {
    $id: "tool-6", name: "OpenAI API", slug: "openai-api",
    domain: "ai", category: "llm-api", subcategory: "completion-api",
    description: "Access to GPT-4, DALL-E, Whisper, and Embeddings.",
    docsUrl: "https://platform.openai.com/docs",
    version: "2024", license: "proprietary", status: "active",
    tags: ["ai", "llm", "gpt", "embeddings"],
    aestheticTags: ["api-driven", "cloud-hosted", "token-based"],
    ratingSchema: "data_extraction_tool",
    differentiation: "Broadest model lineup and highest production throughput.",
    bestCases: ["General AI tasks", "Image generation"],
    worstCases: ["Cost-sensitive apps"],
    integrationIds: [], issueIds: [],
    proximityCluster: "ai-interface", proximityNeighbors: ["tool-5"],
    proximityDistance: [0.5], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 518400,
  },
  {
    $id: "tool-7", name: "Framer Motion", slug: "framer-motion",
    domain: "frontend", category: "animation", subcategory: "motion-system",
    description: "Production-ready motion library with spring physics and gestures.",
    repoUrl: "https://github.com/framer/motion",
    version: "11.11.0", license: "MIT", status: "active",
    tags: ["animation", "react", "gestures", "layout-animation"],
    aestheticTags: ["motion-heavy", "declarative", "interactive"],
    ratingSchema: "frontend_framework",
    differentiation: "Spring physics with declarative component-level primitives.",
    bestCases: ["Layout transitions", "Gesture interfaces"],
    worstCases: ["Simple fades only"],
    integrationIds: [], issueIds: [],
    proximityCluster: "frontend-animation", proximityNeighbors: ["tool-1"],
    proximityDistance: [0.6], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 604800,
  },
  {
    $id: "tool-8", name: "Tailwind CSS", slug: "tailwind-css",
    domain: "frontend", category: "styling", subcategory: "css-framework",
    description: "Utility-first CSS framework for rapid custom UI development.",
    repoUrl: "https://github.com/tailwindlabs/tailwindcss",
    version: "3.4.16", license: "MIT", status: "active",
    tags: ["css", "utility-first", "responsive", "design-system"],
    aestheticTags: ["utility-driven", "configurable", "design-system"],
    ratingSchema: "frontend_framework",
    differentiation: "Low-level utilities composing into any design without opinionated components.",
    bestCases: ["Custom design systems", "Rapid prototyping"],
    worstCases: ["Pre-built component teams"],
    integrationIds: [], issueIds: [],
    proximityCluster: "frontend-styling", proximityNeighbors: ["tool-9"],
    proximityDistance: [0.3], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 691200,
  },
  {
    $id: "tool-9", name: "Shadcn UI", slug: "shadcn-ui",
    domain: "frontend", category: "component-library", subcategory: "ui-components",
    description: "Beautifully designed components built with Radix UI and Tailwind CSS.",
    repoUrl: "https://github.com/shadcn-ui/ui",
    version: "2024", license: "MIT", status: "active",
    tags: ["react", "components", "tailwind", "radix"],
    aestheticTags: ["design-system", "accessible", "composable"],
    ratingSchema: "frontend_framework",
    differentiation: "Copy-paste components you own and modify freely.",
    bestCases: ["Custom design systems", "Tailwind projects"],
    worstCases: ["Non-Tailwind projects"],
    integrationIds: [], issueIds: [],
    proximityCluster: "frontend-styling", proximityNeighbors: ["tool-8"],
    proximityDistance: [0.3], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 777600,
  },
  {
    $id: "tool-10", name: "Appwrite", slug: "appwrite",
    domain: "backend", category: "backend-as-service", subcategory: "full-stack-baas",
    description: "Open-source backend server. Auth, databases, functions, storage, realtime.",
    repoUrl: "https://github.com/appwrite/appwrite",
    version: "1.6.0", license: "BSD-3-Clause", status: "active",
    tags: ["baas", "backend", "authentication", "database", "realtime"],
    aestheticTags: ["api-driven", "self-hosted", "comprehensive"],
    ratingSchema: "database",
    differentiation: "Self-hosted-first with complete admin UI out of the box.",
    bestCases: ["Full-stack apps", "Self-hosted requirements"],
    worstCases: ["Serverless-only architectures"],
    integrationIds: [], issueIds: [],
    proximityCluster: "backend-baas", proximityNeighbors: ["tool-4"],
    proximityDistance: [0.5], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 864000,
  },
  {
    $id: "tool-11", name: "Drizzle ORM", slug: "drizzle-orm",
    domain: "backend", category: "database", subcategory: "orm",
    description: "TypeScript ORM for SQL lovers. Lightweight, performant, zero abstraction cost.",
    repoUrl: "https://github.com/drizzle-team/drizzle-orm",
    version: "0.36.0", license: "Apache-2.0", status: "active",
    tags: ["database", "orm", "typescript", "sql"],
    aestheticTags: ["type-driven", "sql-first", "minimal"],
    ratingSchema: "database",
    differentiation: "SQL-first with full query control while maintaining type safety.",
    bestCases: ["Teams that know SQL", "Complex joins"],
    worstCases: ["Visual schema editors"],
    integrationIds: [], issueIds: [],
    proximityCluster: "backend-data", proximityNeighbors: ["tool-4"],
    proximityDistance: [0.2], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 950400,
  },
  {
    $id: "tool-12", name: "Figma Plugin API", slug: "figma-plugin-api",
    domain: "design", category: "design-tools", subcategory: "plugin-development",
    description: "Build plugins for Figma. Access canvas, read design tokens, automate workflows.",
    docsUrl: "https://www.figma.com/plugin-docs/",
    version: "1.0", license: "proprietary", status: "active",
    tags: ["design", "figma", "plugins", "automation"],
    aestheticTags: ["visual", "design-driven", "token-aware"],
    ratingSchema: "social_tool",
    differentiation: "Direct access to the design document model and real-time collaboration.",
    bestCases: ["Design-to-code pipelines", "Automated style guides"],
    worstCases: ["Non-Figma teams"],
    integrationIds: [], issueIds: [],
    proximityCluster: "design-tools", proximityNeighbors: ["tool-8"],
    proximityDistance: [0.6], componentIds: [],
    createdBy: "system", createdAt: Math.floor(Date.now() / 1000) - 1036800,
  },
];

const MOCK_PIPELINES: PipelineDomain[] = [
  {
    $id: "pipe-1",
    userId: "system",
    name: "Design to Code Pipeline",
    description: "Extract design tokens from Figma, generate React components with Tailwind, validate with Zod forms",
    status: "active",
    steps: [
      { id: "s1", label: "Extract", order: 0, tools: [{ id: "tool-12", name: "Figma Plugin API", role: "input", filled: true }], valid: true },
      { id: "s2", label: "Style", order: 1, tools: [{ id: "tool-8", name: "Tailwind CSS", role: "transform", filled: true }], valid: true },
      { id: "s3", label: "Components", order: 2, tools: [{ id: "tool-9", name: "Shadcn UI", role: "output", filled: true }], valid: true },
    ],
    createdAt: Math.floor((Date.now() - 86400000) / 1000),
    updatedAt: Math.floor((Date.now() - 86400000) / 1000),
    toolCount: 3,
    tags: ["frontend", "design-system"],
  },
  {
    $id: "pipe-2",
    userId: "system",
    name: "Full-Stack AI App",
    description: "AI-powered app with OpenAI, Prisma backend, React frontend, and Appwrite auth",
    status: "active",
    steps: [
      { id: "s1", label: "AI Layer", order: 0, tools: [{ id: "tool-6", name: "OpenAI API", role: "input", filled: true }], valid: true },
      { id: "s2", label: "UI Layer", order: 1, tools: [{ id: "tool-5", name: "Vercel AI SDK", role: "transform", filled: true }, { id: "tool-3", name: "TanStack Query", role: "data", filled: true }], valid: true },
      { id: "s3", label: "Backend", order: 2, tools: [{ id: "tool-4", name: "Prisma", role: "data", filled: true }, { id: "tool-10", name: "Appwrite", role: "auth", filled: true }], valid: true },
    ],
    createdAt: Math.floor((Date.now() - 172800000) / 1000),
    updatedAt: Math.floor((Date.now() - 172800000) / 1000),
    toolCount: 5,
    tags: ["fullstack", "ai"],
  },
  {
    $id: "pipe-3",
    userId: "system",
    name: "Type-Safe Form System",
    description: "End-to-end type-safe forms with Zod, React Hook Form, and Shadcn UI",
    status: "draft",
    steps: [
      { id: "s1", label: "Schema", order: 0, tools: [{ id: "tool-2", name: "Zod", role: "schema", filled: true }], valid: true },
      { id: "s2", label: "Form", order: 1, tools: [{ id: "tool-1", name: "React Hook Form", role: "form", filled: true }], valid: true },
      { id: "s3", label: "UI", order: 2, tools: [{ id: "tool-9", name: "Shadcn UI", role: "ui", filled: true }], valid: true },
    ],
    createdAt: Math.floor((Date.now() - 259200000) / 1000),
    updatedAt: Math.floor((Date.now() - 259200000) / 1000),
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
    const { databases, Tables, Queries } = await import("./appwrite");
    const result = await databases.listDocuments("core_db", Tables.TOOLS, Queries.active());
    return result.documents as unknown as Tool[];
  }
  return MOCK_TOOLS;
}

export async function fetchPipelines(): Promise<PipelineDomain[]> {
  if (USE_APPWRITE) {
    const { databases, Tables } = await import("./appwrite");
    const result = await databases.listDocuments("core_db", Tables.PIPELINES, []);
    return result.documents as unknown as PipelineDomain[];
  }
  return MOCK_PIPELINES;
}

export async function fetchTaxonomy(): Promise<AestheticTaxonomy[]> {
  if (USE_APPWRITE) {
    const { databases, Tables } = await import("./appwrite");
    const result = await databases.listDocuments("core_db", Tables.AESTHETIC_TAXONOMY, []);
    return result.documents as unknown as AestheticTaxonomy[];
  }
  return MOCK_TAXONOMY;
}

export async function fetchActivityLog(): Promise<ActivityLog[]> {
  if (USE_APPWRITE) {
    const { databases, Tables } = await import("./appwrite");
    const result = await databases.listDocuments("core_db", Tables.ACTIVITY_LOG, []);
    return result.documents as unknown as ActivityLog[];
  }
  return MOCK_ACTIVITY;
}

export async function fetchToolBySlug(slug: string): Promise<Tool | null> {
  if (USE_APPWRITE) {
    const { databases, Tables } = await import("./appwrite");
    const result = await databases.listDocuments("core_db", Tables.TOOLS, [`slug:equal:${slug}`]);
    const docs = result.documents as unknown as Tool[];
    return docs[0] || null;
  }
  return MOCK_TOOLS.find(t => t.slug === slug) || null;
}

export { MOCK_TOOLS, MOCK_PIPELINES, MOCK_TAXONOMY, MOCK_ACTIVITY };
