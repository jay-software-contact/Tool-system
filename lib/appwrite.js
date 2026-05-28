/**
 * Appwrite Client — lazy-loaded, server-safe
 *
 * Reads connection values from .env.local. Uses a module-level singleton
 * so every import reuses the same Client instance.
 */

import { Client, Databases, Query } from "node-appwrite";

const ENDPOINT = process.env.APPWRITE_ENDPOINT ?? "";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID ?? "";
const API_KEY = process.env.APPWRITE_SERVER_KEY ?? "";

let _client = null;

export function client() {
  if (!_client) {
    _client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setKey(API_KEY);
  }
  return _client;
}

export function getDatabases() {
  return new Databases(client());
}

export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "core_db";

// ── Query helpers ────────────────────────────────────────────────────────

/**
 * List documents from any collection.
 * Returns the documents array, or [] on error.
 */
export async function listDocuments(collectionId, queries = []) {
  try {
    const res = await getDatabases().listDocuments(DATABASE_ID, collectionId, [
      Query.limit(200),
      ...queries,
    ]);
    return res.documents;
  } catch {
    return [];
  }
}

/**
 * Fetch all tools from the Tools collection.
 */
export async function fetchTools() {
  return listDocuments("tools");
}

/**
 * Fetch a single tool by ID.
 */
export async function fetchToolById(id) {
  try {
    return await getDatabases().getDocument(DATABASE_ID, "tools", id);
  } catch {
    return null;
  }
}
