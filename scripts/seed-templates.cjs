#!/usr/bin/env node
/**
 * Seed the database with sample template data.
 * Run from the project root:
 *   set -a && source .env.local && set +a && node scripts/seed-templates.cjs
 */

const { Client, Databases, ID } = require("node-appwrite");

const ENDPOINT = process.env.APPWRITE_ENDPOINT || "";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || "";
const API_KEY = process.env.APPWRITE_SERVER_KEY || "";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "core_db";
const COLLECTION_ID = "templates";

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error(
    "ERROR: Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_SERVER_KEY env vars"
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

const SAMPLE_TEMPLATES = [
  {
    name: "E-Commerce Stack",
    slug: "ecommerce-stack",
    description:
      "Full-stack e-commerce platform with product catalog, cart, checkout flow, and Stripe payment integration. Includes inventory management and order tracking.",
    category: "E-Commerce",
    config: JSON.stringify({
      features: ["cart", "checkout", "inventory", "orders", "analytics"],
      pages: ["home", "shop", "product", "cart", "checkout", "account"],
    }),
    tools: JSON.stringify(["Next.js", "Tailwind CSS", "Stripe", "Supabase"]),
    color: "#22C55E",
    icon: "fa-cart-shopping",
    previewUrl: "",
    status: "active",
  },
  {
    name: "Blog Platform",
    slug: "blog-platform",
    description:
      "Content-first publishing platform with MDX support, syntax highlighting, RSS feed generation, and headless CMS integration via Sanity.",
    category: "Content",
    config: JSON.stringify({
      features: ["mdx", "rss", "syntax-highlight", "cms", "tags"],
      pages: ["home", "blog", "post", "tag", "about"],
    }),
    tools: JSON.stringify(["Next.js", "MDX", "Sanity", "Tailwind CSS"]),
    color: "#3B82F6",
    icon: "fa-feather",
    previewUrl: "",
    status: "active",
  },
  {
    name: "SaaS Dashboard",
    slug: "saas-dashboard",
    description:
      "Multi-tenant admin dashboard with real-time analytics, user management, subscription billing, and team collaboration features.",
    category: "SaaS",
    config: JSON.stringify({
      features: [
        "dashboard",
        "analytics",
        "billing",
        "teams",
        "settings",
      ],
      pages: ["dashboard", "analytics", "users", "billing", "settings"],
    }),
    tools: JSON.stringify(["Next.js", "TypeScript", "Supabase", "D3.js"]),
    color: "#8B5CF6",
    icon: "fa-chart-pie",
    previewUrl: "",
    status: "active",
  },
];

async function seed() {
  console.log(`Seeding ${SAMPLE_TEMPLATES.length} templates...`);

  for (const tmpl of SAMPLE_TEMPLATES) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        tmpl
      );
      console.log(`  ✓ ${tmpl.name}`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`  ⏭ ${tmpl.name} (already exists)`);
      } else {
        console.error(`  ✗ ${tmpl.name}: ${err.message}`);
      }
    }
  }

  console.log("Done.");
  process.exit(0);
}

seed();
