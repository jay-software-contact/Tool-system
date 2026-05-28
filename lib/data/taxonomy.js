/**
 * Taxonomy Data Layer — Appwrite Collection CRUD
 *
 * Provides query and mutation operations for the 'taxonomy' Appwrite collection.
 * Each function uses the shared Appwrite client from ../appwrite.js and the
 * Appwrite SDK's Databases service (SDK v14+).
 *
 * Collection configuration:
 *   APPWRITE_DATABASE_ID - Database ID (defaults to 'default')
 *   APPWRITE_TAXONOMY_COLLECTION_ID - Override the default collection ID
 */

import { client, DATABASE_ID } from '../appwrite.js';
import { Databases, ID, Query } from 'appwrite';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** @constant {string} Appwrite collection ID for taxonomy */
const COLLECTION_ID =
  process.env.APPWRITE_TAXONOMY_COLLECTION_ID || 'taxonomy';

/** Appwrite Databases service instance */
const databases = new Databases(client);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build Appwrite Query array from a filters object.
 *   { search: "term" }        → Query.search("term")
 *   { status: "active" }      → Query.equal("status", "active")
 *   { limit: 25 }             → Query.limit(25)
 *   { offset: 10 }            → Query.offset(10)
 *   { orderBy: "name" }       → Query.orderAsc("name")
 *   { order: "desc" }         → Query.orderDesc(orderBy)
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
    if (value != null) queries.push(Query.equal(key, String(value)));
  }

  return queries;
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

/**
 * List taxonomy entries with optional filters.
 *
 * @param   {object}      [filters]
 * @returns {Promise<object[]>} Array of taxonomy documents
 */
export async function listTaxonomyEntries(filters = {}) {
  const queries = buildQueries(filters);
  const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
  return result?.documents ?? [];
}

/**
 * Retrieve a single taxonomy entry by its Appwrite document ID.
 *
 * @param   {string}          id - The Appwrite $id
 * @returns {Promise<object>}    The taxonomy document
 */
export async function getTaxonomyEntry(id) {
  return databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
}

/**
 * Create a new taxonomy entry.
 *
 * @param   {object}          data - Taxonomy fields to persist
 * @returns {Promise<object>}      The newly created document
 */
export async function createTaxonomyEntry(data) {
  return databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
}

/**
 * Update an existing taxonomy entry.
 *
 * @param   {string}          id   - The Appwrite $id
 * @param   {object}          data - Fields to update
 * @returns {Promise<object>}      The updated document
 */
export async function updateTaxonomyEntry(id, data) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
}

/**
 * Delete a taxonomy entry.
 *
 * @param   {string}      id - The Appwrite $id
 * @returns {Promise<void>}
 */
export async function deleteTaxonomyEntry(id) {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
}
