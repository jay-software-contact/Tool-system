"""
Seed script for the-System — Appwrite SDK 19.x compatible.
Populates tables with sample data matching the actual column schema.

Run with: python3.13 seed_data.py
"""

from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.id import ID
from appwrite.exception import AppwriteException
import json, os, time

# ---- Load credentials ----
env_file = r"C:\Users\nayth\the-system\.env.local"
creds = {}
with open(env_file) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            creds[k.strip()] = v.strip()

client = Client()
client.set_endpoint(creds["NEXT_PUBLIC_APPWRITE_ENDPOINT"])
client.set_project(creds["NEXT_PUBLIC_APPWRITE_PROJECT_ID"])
client.set_key(creds["APPWRITE_API_KEY"])

tdb = TablesDB(client)
DB_ID = "core_db"

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}")


# ---- Sample Tools (matching actual DB columns) ----
SAMPLE_TOOLS = [
    {
        "name": "React Hook Form",
        "slug": "react-hook-form",
        "domain": "frontend",
        "category": "forms",
        "subcategory": "form-management",
        "description": "Performant, flexible and extensible forms with easy-to-use validation. Minimal re-renders.",
        "repo_url": "https://github.com/react-hook-form/react-hook-form",
        "version": "7.53.0",
        "license": "MIT",
        "status": "active",
        "rating_schema": "frontend_framework",
        "differentiation": "Uncontrolled components with minimal re-renders. Unlike Formik, uses refs rather than state.",
        "best_cases": ["Complex forms","Dynamic fields","Performance-critical apps"],
        "worst_cases": ["Simple one-page forms"],
        "proximity_cluster": "frontend-forms",
        "proximity_neighbors": ["zod","react-hook-form"],
        "proximity_distance": [0.3],
        "aesthetic_tags": ["minimal","functional","state-driven"],
        "integration_ids": [],
        "issue_ids": [],
    },
    {
        "name": "Zod",
        "slug": "zod",
        "domain": "frontend",
        "category": "validation",
        "subcategory": "schema-validation",
        "description": "TypeScript-first schema validation with static type inference. Build once, validate everywhere.",
        "repo_url": "https://github.com/colinhacks/zod",
        "version": "3.23.8",
        "license": "MIT",
        "status": "active",
        "rating_schema": "frontend_framework",
        "differentiation": "Unlike Yup or Joi, Zod provides static TypeScript types inferred from schemas automatically.",
        "best_cases": ["API boundary validation","Form validation","Config validation"],
        "worst_cases": ["Non-TypeScript projects"],
        "proximity_cluster": "frontend-forms",
        "proximity_neighbors": ["react-hook-form"],
        "proximity_distance": [0.3],
        "aesthetic_tags": ["type-driven","functional","minimal"],
        "integration_ids": [],
        "issue_ids": [],
    },
    {
        "name": "TanStack Query",
        "slug": "tanstack-query",
        "domain": "frontend",
        "category": "data-fetching",
        "subcategory": "server-state",
        "description": "Powerful asynchronous state management with automatic caching, background updates.",
        "repo_url": "https://github.com/TanStack/query",
        "version": "5.59.0",
        "license": "MIT",
        "status": "active",
        "rating_schema": "frontend_framework",
        "differentiation": "Framework-agnostic with granular control over cache lifecycle.",
        "best_cases": ["Complex data dependencies","Real-time dashboards","Frequent mutations"],
        "worst_cases": ["Simple CRUD apps","Static content sites"],
        "proximity_cluster": "frontend-data",
        "proximity_neighbors": ["prisma","vercel-ai-sdk"],
        "proximity_distance": [0.4],
        "aesthetic_tags": ["state-driven","realtime","cache-aware"],
        "integration_ids": [],
        "issue_ids": [],
    },
    {
        "name": "Prisma",
        "slug": "prisma",
        "domain": "backend",
        "category": "database",
        "subcategory": "orm",
        "description": "Next-generation ORM with type-safe database client and auto-completion.",
        "repo_url": "https://github.com/prisma/prisma",
        "version": "5.20.0",
        "license": "Apache-2.0",
        "status": "active",
        "rating_schema": "database",
        "differentiation": "Generated client with full type safety and declarative schema language.",
        "best_cases": ["PostgreSQL projects","Type-safe queries","Rapid prototyping"],
        "worst_cases": ["NoSQL databases","Complex raw SQL needs"],
        "proximity_cluster": "backend-data",
        "proximity_neighbors": ["tanstack-query","drizzle-orm"],
        "proximity_distance": [0.2],
        "aesthetic_tags": ["type-driven","declarative","data-heavy"],
        "integration_ids": [],
        "issue_ids": [],
    },
    {
        "name": "Vercel AI SDK",
        "slug": "vercel-ai-sdk",
        "domain": "ai",
        "category": "ai-framework",
        "subcategory": "llm-integration",
        "description": "Open-source AI-powered UI library for React, Svelte, Vue. Streaming-first.",
        "repo_url": "https://github.com/vercel/ai",
        "version": "4.0.0",
        "license": "Apache-2.0",
        "status": "active",
        "rating_schema": "frontend_framework",
        "differentiation": "Streaming-first primitives that work with any LLM provider.",
        "best_cases": ["Chat interfaces","Streaming AI","Multi-provider AI apps"],
        "worst_cases": ["Non-streaming AI","Backend-only pipelines"],
        "proximity_cluster": "ai-interface",
        "proximity_neighbors": ["openai-api","tanstack-query"],
        "proximity_distance": [0.5],
        "aesthetic_tags": ["conversational","streaming","realtime"],
        "integration_ids": [],
        "issue_ids": [],
    },
    {
        "name": "OpenAI API",
        "slug": "openai-api",
        "domain": "ai",
        "category": "llm-api",
        "subcategory": "completion-api",
        "description": "Access to GPT-4, DALL-E, Whisper, and Embeddings for production apps.",
        "docs_url": "https://platform.openai.com/docs",
        "version": "2024",
        "license": "proprietary",
        "status": "active",
        "rating_schema": "data_extraction_tool",
        "differentiation": "Broadest model lineup and highest production throughput.",
        "best_cases": ["General AI tasks","Image generation","Speech-to-text"],
        "worst_cases": ["Cost-sensitive apps","Data privacy concerns"],
        "proximity_cluster": "ai-interface",
        "proximity_neighbors": ["vercel-ai-sdk"],
        "proximity_distance": [0.5],
        "aesthetic_tags": ["api-driven","cloud-hosted","token-based"],
        "integration_ids": [],
        "issue_ids": [],
    },
    {
        "name": "Framer Motion",
        "slug": "framer-motion",
        "domain": "frontend",
        "category": "animation",
        "subcategory": "motion-system",
        "description": "Production-ready motion library with spring physics and gestures.",
        "repo_url": "https://github.com/framer/motion",
        "version": "11.11.0",
        "license": "MIT",
        "status": "active",
        "rating_schema": "frontend_framework",
        "differentiation": "Spring physics with declarative component-level animation primitives.",
        "best_cases": ["Layout transitions","Gesture interfaces","Micro-interactions"],
        "worst_cases": ["Simple fades only","Performance-critical lists"],
        "proximity_cluster": "frontend-animation",
        "proximity_neighbors": ["tailwind-css","react-hook-form"],
        "proximity_distance": [0.6],
        "aesthetic_tags": ["motion-heavy","declarative","interactive"],
        "integration_ids": [],
        "issue_ids": [],
    },
    {
        "name": "Tailwind CSS",
        "slug": "tailwind-css",
        "domain": "frontend",
        "category": "styling",
        "subcategory": "css-framework",
        "description": "Utility-first CSS framework for rapid custom UI development.",
        "repo_url": "https://github.com/tailwindlabs/tailwindcss",
        "version": "3.4.16",
        "license": "MIT",
        "status": "active",
        "rating_schema": "frontend_framework",
        "differentiation": "Low-level utilities composing into any design without opinionated components.",
        "best_cases": ["Custom design systems","Rapid prototyping","Consistent spacing"],
        "worst_cases": ["Pre-built component teams","Non-technical designers"],
        "proximity_cluster": "frontend-styling",
        "proximity_neighbors": ["shadcn-ui","figma-plugin-api"],
        "proximity_distance": [0.3],
        "aesthetic_tags": ["utility-driven","configurable","design-system"],
        "integration_ids": [],
        "issue_ids": [],
    },
    {
        "name": "Shadcn UI",
        "slug": "shadcn-ui",
        "domain": "frontend",
        "category": "component-library",
        "subcategory": "ui-components",
        "description": "Beautifully designed components built with Radix UI and Tailwind CSS.",
        "repo_url": "https://github.com/shadcn-ui/ui",
        "version": "2024",
        "license": "MIT",
        "status": "active",
        "rating_schema": "frontend_framework",
        "differentiation": "Copy-paste components you own and modify freely.",
        "best_cases": ["Custom design systems","Tailwind projects","Full control needed"],
        "worst_cases": ["Non-Tailwind projects","Teams wanting pre-built APIs"],
        "proximity_cluster": "frontend-styling",
        "proximity_neighbors": ["tailwind-css","zod"],
        "proximity_distance": [0.3],
        "aesthetic_tags": ["design-system","accessible","composable"],
        "integration_ids": [],
        "issue_ids": [],
    },
    {
        "name": "Appwrite",
        "slug": "appwrite",
        "domain": "backend",
        "category": "backend-as-service",
        "subcategory": "full-stack-baas",
        "description": "Open-source backend server. Auth, databases, functions, storage, realtime.",
        "repo_url": "https://github.com/appwrite/appwrite",
        "version": "1.6.0",
        "license": "BSD-3-Clause",
        "status": "active",
        "rating_schema": "database",
        "differentiation": "Self-hosted-first with complete admin UI out of the box.",
        "best_cases": ["Full-stack apps","Self-hosted requirements","Multi-tenant apps"],
        "worst_cases": ["Serverless-only","Simple static sites"],
        "proximity_cluster": "backend-baas",
        "proximity_neighbors": ["prisma"],
        "proximity_distance": [0.5],
        "aesthetic_tags": ["api-driven","self-hosted","comprehensive"],
        "integration_ids": [],
        "issue_ids": [],
    },
    {
        "name": "Drizzle ORM",
        "slug": "drizzle-orm",
        "domain": "backend",
        "category": "database",
        "subcategory": "orm",
        "description": "TypeScript ORM for SQL lovers. Lightweight, performant, zero abstraction cost.",
        "repo_url": "https://github.com/drizzle-team/drizzle-orm",
        "version": "0.36.0",
        "license": "Apache-2.0",
        "status": "active",
        "rating_schema": "database",
        "differentiation": "SQL-first with full control over queries while maintaining type safety.",
        "best_cases": ["Teams that know SQL","Complex joins","Performance-critical DB work"],
        "worst_cases": ["Visual schema editors","Rapid prototyping"],
        "proximity_cluster": "backend-data",
        "proximity_neighbors": ["prisma"],
        "proximity_distance": [0.2],
        "aesthetic_tags": ["type-driven","sql-first","minimal"],
        "integration_ids": [],
        "issue_ids": [],
    },
    {
        "name": "Figma Plugin API",
        "slug": "figma-plugin-api",
        "domain": "design",
        "category": "design-tools",
        "subcategory": "plugin-development",
        "description": "Build plugins for Figma. Access canvas, read design tokens, automate workflows.",
        "docs_url": "https://www.figma.com/plugin-docs/",
        "version": "1.0",
        "license": "proprietary",
        "status": "active",
        "rating_schema": "social_tool",
        "differentiation": "Direct access to the design document model and real-time collaboration.",
        "best_cases": ["Design-to-code","Automated style guides","Custom design tooling"],
        "worst_cases": ["Non-Figma teams","Simple design tasks"],
        "proximity_cluster": "design-tools",
        "proximity_neighbors": ["tailwind-css"],
        "proximity_distance": [0.6],
        "aesthetic_tags": ["visual","design-driven","token-aware"],
        "integration_ids": [],
        "issue_ids": [],
    },
]


def seed_tools():
    """Insert sample tools into the database."""
    log("--- Seeding Tools ---")
    now = int(time.time())
    created = 0

    for tool in SAMPLE_TOOLS:
        try:
            tdb.create_row(DB_ID, "tools", ID.unique(), {
                **tool,
                "created_at": now,
                "updated_at": now,
            })
            created += 1
            log(f"  + {tool['name']}")
        except Exception as e:
            if "already exists" in str(e).lower() or "409" in str(e):
                log(f"  = {tool['name']} already exists")
            else:
                log(f"  ERROR {tool['name']}: {e}")

    log(f"  Total created: {created} tools")
    return created


# ---- Main ----
if __name__ == "__main__":
    log("=" * 60)
    log("Starting Seed Data Population")
    log("=" * 60)

    tools_count = seed_tools()

    log("=" * 60)
    log(f"Seed complete: {tools_count} tools created")
    log("=" * 60)
