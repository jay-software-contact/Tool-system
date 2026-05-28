#!/usr/bin/env node
/**
 * Seed Script: Insert 14 hardcoded tools into Appwrite Tools collection
 *
 * Run:  set -a && source .env.local && set +a && node scripts/seed-tools.cjs
 */

const { Client, Databases, ID } = require("node-appwrite");

// Env vars are loaded by the shell via `set -a && source .env.local`
const ENDPOINT = process.env.APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_SERVER_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error(
    "ERROR: Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_SERVER_KEY"
  );
  process.exit(1);
}

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "core_db";
const COLLECTION_ID = "tools";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// ── Ensure attributes exist ───────────────────────────────────────────────

const TOOLS_ATTRS = [
  { key: "name", type: "string", size: 256, required: true },
  { key: "slug", type: "string", size: 256, required: false },
  { key: "category", type: "string", size: 128, required: true },
  { key: "description", type: "string", size: 4096, required: false },
  { key: "ratings", type: "string", size: 8192, required: false },
  { key: "iconUrl", type: "string", size: 1024, required: false },
  { key: "status", type: "string", size: 64, required: false, default: "active" },
];

async function ensureAttribute(attr) {
  const { key, type, size, required, defaultValue } = attr;
  try {
    switch (type) {
      case "string":
        await databases.createStringAttribute(
          DATABASE_ID, COLLECTION_ID, key, size, required, defaultValue
        );
        break;
      case "integer":
        await databases.createIntegerAttribute(
          DATABASE_ID, COLLECTION_ID, key, required, undefined, undefined, undefined, defaultValue
        );
        break;
      case "boolean":
        await databases.createBooleanAttribute(
          DATABASE_ID, COLLECTION_ID, key, required, defaultValue
        );
        break;
      default:
        throw new Error(`Unknown type ${type} for ${key}`);
    }
    console.log(`  attr created: ${key} (${type})`);
  } catch (err) {
    if (err.code === 409 || err.message.includes("already exists")) {
      console.log(`  attr exists:  ${key}`);
    } else {
      console.error(`  attr ERROR ${key}: ${err.message}`);
    }
  }
}

// ── 14 tools ──────────────────────────────────────────────────────────────
const TOOLS = [
  { name: "Tailwind CSS", slug: "tailwind-css", category: "Library", description: "A utility-first CSS framework for rapidly building custom user interfaces.", ratings: JSON.stringify({ ease: 5, custom: 4, perf: 5, cost: 5 }), iconUrl: "fa-palette", status: "active" },
  { name: "React", slug: "react", category: "Frontend", description: "A JavaScript library for building user interfaces using a component-based architecture.", ratings: JSON.stringify({ ease: 3, custom: 5, perf: 3, cost: 5 }), iconUrl: "fa-atom", status: "active" },
  { name: "Next.js", slug: "nextjs", category: "Frontend", description: "A React framework with hybrid static/server rendering and built-in routing.", ratings: JSON.stringify({ ease: 4, custom: 4, perf: 4, cost: 4 }), iconUrl: "fa-forward", status: "active" },
  { name: "Vue", slug: "vue", category: "Frontend", description: "A progressive JavaScript framework for building user interfaces with reactive data binding.", ratings: JSON.stringify({ ease: 4, custom: 4, perf: 4, cost: 5 }), iconUrl: "fa-v", status: "active" },
  { name: "TypeScript", slug: "typescript", category: "Frontend", description: "A strongly typed superset of JavaScript that compiles to plain JavaScript.", ratings: JSON.stringify({ ease: 3, custom: 5, perf: 5, cost: 5 }), iconUrl: "fa-code", status: "active" },
  { name: "D3.js", slug: "d3js", category: "Library", description: "A JavaScript library for producing dynamic, interactive data visualizations in the browser.", ratings: JSON.stringify({ ease: 2, custom: 5, perf: 4, cost: 5 }), iconUrl: "fa-chart-line", status: "active" },
  { name: "PostgreSQL", slug: "postgresql", category: "Backend", description: "A powerful, open source object-relational database system with strong reliability.", ratings: JSON.stringify({ ease: 3, custom: 5, perf: 5, cost: 5 }), iconUrl: "fa-database", status: "active" },
  { name: "MongoDB", slug: "mongodb", category: "Backend", description: "A document-oriented NoSQL database for high volume data storage.", ratings: JSON.stringify({ ease: 4, custom: 4, perf: 4, cost: 4 }), iconUrl: "fa-leaf", status: "active" },
  { name: "Firebase", slug: "firebase", category: "Backend", description: "A Google-backed platform for building mobile and web applications with real-time database.", ratings: JSON.stringify({ ease: 5, custom: 3, perf: 4, cost: 3 }), iconUrl: "fa-fire", status: "active" },
  { name: "Vercel", slug: "vercel", category: "Backend", description: "A cloud platform for static sites and serverless functions, built for Next.js.", ratings: JSON.stringify({ ease: 5, custom: 3, perf: 5, cost: 3 }), iconUrl: "fa-triangle-exclamation", status: "active" },
  { name: "Strapi", slug: "strapi", category: "CMS", description: "An open-source headless CMS built with Node.js for managing content via REST or GraphQL APIs.", ratings: JSON.stringify({ ease: 4, custom: 4, perf: 3, cost: 5 }), iconUrl: "fa-newspaper", status: "active" },
  { name: "Sanity", slug: "sanity", category: "CMS", description: "A real-time structured content platform with a customizable editing environment.", ratings: JSON.stringify({ ease: 3, custom: 5, perf: 4, cost: 3 }), iconUrl: "fa-pen-nib", status: "active" },
  { name: "Supabase", slug: "supabase", category: "Backend", description: "An open source Firebase alternative with PostgreSQL, real-time subscriptions, and authentication.", ratings: JSON.stringify({ ease: 4, custom: 4, perf: 4, cost: 5 }), iconUrl: "fa-bolt", status: "active" },
  { name: "Svelte", slug: "svelte", category: "Frontend", description: "A radical new approach to building user interfaces. Compiles away the framework at build time.", ratings: JSON.stringify({ ease: 4, custom: 4, perf: 5, cost: 5 }), iconUrl: "fa-s", status: "active" },
];

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("Step 1: Ensuring attributes in tools collection...");
  for (const attr of TOOLS_ATTRS) {
    await ensureAttribute(attr);
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  console.log("\nStep 2: Seeding 14 tools...");
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const tool of TOOLS) {
    try {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), tool);
      console.log(`  created: ${tool.name}`);
      created++;
    } catch (err) {
      if (err.code === 409 || err.message.includes("already exists")) {
        console.log(`  skip:    ${tool.name}`);
        skipped++;
      } else {
        console.error(`  ERROR:   ${tool.name} — ${err.message}`);
        failed++;
      }
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDone.  created=${created}  skipped=${skipped}  failed=${failed}`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
