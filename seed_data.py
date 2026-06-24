#!/usr/bin/env python3
"""
Seed script for the-System — Appwrite SDK 19.x compatible.
Populates tables with sample data matching the actual Appwrite schema.

Run with: python3.13 seed_data.py

Component fields per Appwrite schema:
  - name: string
  - description: string
  - aestheticCategory: string
  - type: JSON string (parsed to object by API)
  - createdAt: number (Unix timestamp)
  - updatedAt: number (Unix timestamp)
  - designTokens: JSON string with borderRadius, padding, gap, blur, border, focusRing
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


# ---- Sample Tools (matching Appwrite schema) ----

SAMPLE_TOOLS = [
    {
        "name": "React Hook Form",
        "description": "Performant, flexible and extensible forms with easy-to-use validation.",
        "aestheticCategory": "Minimalist",
        "type": json.dumps({"name": "PrimaryButton", "role": "input", "variant": "rounded"}),
        "designTokens": json.dumps({"borderRadius": "12px", "padding": "12px 16px", "gap": "8px", "border": "1px solid #E5E7EB", "focusRing": "0 0 0 3px rgba(99,102,241,0.2)"}),
    },
    {
        "name": "Zod",
        "description": "TypeScript-first schema validation with static type inference.",
        "aestheticCategory": "Minimalist",
        "type": json.dumps({"name": "ValidationSchema", "role": "logic", "variant": "type-driven"}),
        "designTokens": json.dumps({"borderRadius": "0px", "padding": "0px", "gap": "0px"}),
    },
    {
        "name": "TanStack Query",
        "description": "Powerful asynchronous state management with automatic caching.",
        "aestheticCategory": "GXSC",
        "type": json.dumps({"name": "DataFetcher", "role": "data", "variant": "cache-aware"}),
        "designTokens": json.dumps({"borderRadius": "8px", "padding": "16px", "gap": "12px", "blur": "backdrop-filter: blur(8px)"}),
    },
    {
        "name": "Prisma",
        "description": "Next-generation ORM with type-safe database client.",
        "aestheticCategory": "Corporate",
        "type": json.dumps({"name": "DatabaseClient", "role": "data", "variant": "type-safe"}),
        "designTokens": json.dumps({"borderRadius": "6px", "padding": "24px", "gap": "16px", "border": "1px solid #0066FF"}),
    },
    {
        "name": "Vercel AI SDK",
        "description": "Open-source AI-powered UI library with streaming-first primitives.",
        "aestheticCategory": "Futuristic",
        "type": json.dumps({"name": "ChatInterface", "role": "ai", "variant": "conversational"}),
        "designTokens": json.dumps({"borderRadius": "16px", "padding": "20px 24px", "gap": "12px", "border": "1px solid rgba(124,58,237,0.3)", "focusRing": "0 0 0 3px rgba(124,58,237,0.15)"}),
    },
    {
        "name": "OpenAI API",
        "description": "Access to GPT-4, DALL-E, Whisper, and Embeddings for production apps.",
        "aestheticCategory": "Futuristic",
        "type": json.dumps({"name": "LLMEndpoint", "role": "ai", "variant": "api-driven"}),
        "designTokens": json.dumps({"borderRadius": "12px", "padding": "16px", "gap": "8px", "blur": "backdrop-filter: blur(12px)", "border": "1px solid rgba(255,255,255,0.1)"}),
    },
    {
        "name": "Framer Motion",
        "description": "Production-ready motion library with spring physics and gestures.",
        "aestheticCategory": "Playful",
        "type": json.dumps({"name": "MotionContainer", "role": "animation", "variant": "spring-physics"}),
        "designTokens": json.dumps({"borderRadius": "20px", "padding": "24px", "gap": "16px", "border": "none"}),
    },
    {
        "name": "Tailwind CSS",
        "description": "Utility-first CSS framework for rapid custom UI development.",
        "aestheticCategory": "Minimalist",
        "type": json.dumps({"name": "StyleSystem", "role": "styling", "variant": "utility-first"}),
        "designTokens": json.dumps({"borderRadius": "0px", "padding": "0px", "gap": "0px"}),
    },
    {
        "name": "Shadcn UI",
        "description": "Beautifully designed components built with Radix UI and Tailwind CSS.",
        "aestheticCategory": "GXSC",
        "type": json.dumps({"name": "ComponentLibrary", "role": "ui", "variant": "composable"}),
        "designTokens": json.dumps({"borderRadius": "12px", "padding": "20px", "gap": "12px", "border": "1px solid #E5E7EB", "focusRing": "0 0 0 2px rgba(0,0,0,0.1)"}),
    },
    {
        "name": "Appwrite",
        "description": "Open-source backend server. Auth, databases, functions, storage, realtime.",
        "aestheticCategory": "Corporate",
        "type": json.dumps({"name": "BackendService", "role": "backend", "variant": "baas"}),
        "designTokens": json.dumps({"borderRadius": "8px", "padding": "24px", "gap": "16px", "border": "1px solid #2563EB"}),
    },
    {
        "name": "Drizzle ORM",
        "description": "TypeScript ORM for SQL lovers. Lightweight, performant, zero abstraction cost.",
        "aestheticCategory": "Corporate",
        "type": json.dumps({"name": "SQLClient", "role": "data", "variant": "sql-first"}),
        "designTokens": json.dumps({"borderRadius": "6px", "padding": "16px", "gap": "8px", "border": "1px solid #CBD5E1"}),
    },
    {
        "name": "Figma Plugin API",
        "description": "Build plugins for Figma. Access canvas, read design tokens, automate workflows.",
        "aestheticCategory": "Playful",
        "type": json.dumps({"name": "DesignTooling", "role": "design", "variant": "plugin"}),
        "designTokens": json.dumps({"borderRadius": "16px", "padding": "20px", "gap": "12px", "blur": "backdrop-filter: blur(8px)"}),
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
                "createdAt": now,
                "updatedAt": now,
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
