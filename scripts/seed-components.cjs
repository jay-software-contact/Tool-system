#!/usr/bin/env node
/**
 * Seed the database with sample UI component data.
 * Run from the project root:
 *   set -a && source .env.local && set +a && node scripts/seed-components.cjs
 */

const { Client, Databases, ID } = require("node-appwrite");

const ENDPOINT = process.env.APPWRITE_ENDPOINT || "";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || "";
const API_KEY = process.env.APPWRITE_SERVER_KEY || "";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "core_db";
const COLLECTION_ID = "components";

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

const SAMPLE_COMPONENTS = [
  {
    name: "Gradient Hero",
    description: "Full-width hero section with gradient background",
    type: "Hero",
    style: "Modern",
    colors: JSON.stringify(["#3B82F6", "#8B5CF6"]),
    font: "Inter",
    designTokens: JSON.stringify({
      borderRadius: "12px",
      padding: "48px",
      gap: "24px",
    }),
    code: "",
    previewUrl: "",
    status: "active",
  },
  {
    name: "Clean Hero",
    description: "Minimalist hero with stark typography",
    type: "Hero",
    style: "Minimalist",
    colors: JSON.stringify(["#111827", "#F9FAFB"]),
    font: "Space Grotesk",
    designTokens: JSON.stringify({
      borderRadius: "0px",
      padding: "64px",
      gap: "16px",
    }),
    code: "",
    previewUrl: "",
    status: "active",
  },
  {
    name: "Glass Card",
    description: "Glassmorphism card with blur backdrop",
    type: "Card",
    style: "Futuristic",
    colors: JSON.stringify(["rgba(255,255,255,0.05)", "#2DD4BF"]),
    font: "Inter",
    designTokens: JSON.stringify({
      borderRadius: "16px",
      padding: "24px",
      blur: "12px",
    }),
    code: "",
    previewUrl: "",
    status: "active",
  },
  {
    name: "Ghost Button",
    description: "Minimal button with transparent background",
    type: "Button",
    style: "Minimalist",
    colors: JSON.stringify(["transparent", "#E8E2D9"]),
    font: "DM Sans",
    designTokens: JSON.stringify({
      borderRadius: "8px",
      padding: "12px 24px",
      border: "1px solid",
    }),
    code: "",
    previewUrl: "",
    status: "active",
  },
  {
    name: "Floating Label Form",
    description: "Form input with animated floating label",
    type: "Form",
    style: "Modern",
    colors: JSON.stringify(["#F9FAFB", "#3B82F6"]),
    font: "Inter",
    designTokens: JSON.stringify({
      borderRadius: "8px",
      padding: "16px",
      focusRing: "2px",
    }),
    code: "",
    previewUrl: "",
    status: "active",
  },
];

async function seed() {
  console.log(`Seeding ${SAMPLE_COMPONENTS.length} components...`);

  for (const comp of SAMPLE_COMPONENTS) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        comp
      );
      console.log(`  ✓ ${comp.name}`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`  ⏭ ${comp.name} (already exists)`);
      } else {
        console.error(`  ✗ ${comp.name}: ${err.message}`);
      }
    }
  }

  console.log("Done.");
  process.exit(0);
}

seed();
