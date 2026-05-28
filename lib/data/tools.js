/**
 * Tools Data Layer — Appwrite Collection CRUD
 *
 * Provides query and mutation operations for the 'tools' Appwrite collection.
 * Each function uses the shared Appwrite client from ../appwrite.js and the
 * Appwrite SDK's Databases service (SDK v14+).
 *
 * Collection configuration:
 *   APPWRITE_DATABASE_ID - Database ID (defaults to 'default')
 *   APPWRITE_TOOLS_COLLECTION_ID - Override the default collection ID
 */

import { client, DATABASE_ID } from '../appwrite.js';
import { Databases, ID, Query } from 'appwrite';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** @constant {string} Appwrite collection ID for tools */
const COLLECTION_ID =
  process.env.APPWRITE_TOOLS_COLLECTION_ID || 'tools';

/** Appwrite Databases service instance */
const databases = new Databases(client);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build Appwrite Query array from a filters object.
 *   { search: "term" }        → Query.search("term")
 *   { limit: 25 }             → Query.limit(25)
 *   { offset: 10 }            → Query.offset(10)
 *   { orderBy: "name" }       → Query.orderAsc("name")
 *   { order: "desc" }         → Query.orderDesc(orderBy)
 *   { category: "hand" }      → Query.equal("category", "hand")
 *
 * @param   {object}    [filters]
 * @returns {string[]}
 */
function buildQueries(filters = {}) {
  const queries = [];

  if (filters.limit != null) queries.push(Query.limit(filters.limit));
  if (filters.offset != null) queries.push(Query.offset(filters.offset));
  if (filters.orderBy) {
    const fn = filters.order === 'desc' ? Query.orderDesc : Query.orderAsc;
    queries.push(fn(filters.orderBy));
  }
  if (filters.search) queries.push(Query.search(filters.search));

  for (const [key, value] of Object.entries(filters)) {
    if (['limit', 'offset', 'order', 'orderBy', 'search'].includes(key)) continue;
    if (value != null) queries.push(Query.equal(key, value));
  }

  return queries;
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

/**
 * List tools from the Appwrite collection, optionally filtered.
 *
 * @param   {object}      [filters]
 * @returns {Promise<object[]>} Array of tool documents
 */
export async function listTools(filters = {}) {
  const queries = buildQueries(filters);
  const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
  return result?.documents ?? [];
}

/**
 * Retrieve a single tool by its Appwrite document ID.
 *
 * @param   {string}          id - The Appwrite $id
 * @returns {Promise<object>}    The tool document
 */
export async function getTool(id) {
  return databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
}

/**
 * Create a new tool document.
 *
 * @param   {object}          data - Tool fields to persist
 * @returns {Promise<object>}      The newly created document
 */
export async function createTool(data) {
  return databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
}

/**
 * Update an existing tool document.
 *
 * @param   {string}          id   - The Appwrite $id
 * @param   {object}          data - Fields to update
 * @returns {Promise<object>}      The updated document
 */
export async function updateTool(id, data) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
}

/**
 * Delete a tool document.
 *
 * @param   {string}      id - The Appwrite $id
 * @returns {Promise<void>}
 */
export async function deleteTool(id) {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
}
