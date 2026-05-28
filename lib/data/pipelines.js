/**
 * Pipelines Data Layer — Appwrite Collection CRUD
 *
 * Provides query and mutation operations for the 'pipelines' Appwrite collection.
 * Each function uses the shared Appwrite client from ../appwrite.js and the
 * Appwrite SDK's Databases service (SDK v14+).
 *
 * Collection configuration:
 *   APPWRITE_DATABASE_ID - Database ID (defaults to 'default')
 *   APPWRITE_PIPELINES_COLLECTION_ID - Override the default collection ID
 */

import { client, DATABASE_ID } from '../appwrite.js';
import { Databases, ID, Query } from 'appwrite';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** @constant {string} Appwrite collection ID for pipelines */
const COLLECTION_ID =
  process.env.APPWRITE_PIPELINES_COLLECTION_ID || 'pipelines';

/** Appwrite Databases service instance */
const databases = new Databases(client);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
 * List pipelines from the Appwrite collection, optionally filtered.
 *
 * @param   {object}      [filters]
 * @returns {Promise<object[]>} Array of pipeline documents
 */
export async function listPipelines(filters = {}) {
  const queries = buildQueries(filters);
  const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
  return result?.documents ?? [];
}

/**
 * Retrieve a single pipeline by its Appwrite document ID.
 *
 * @param   {string}          id - The Appwrite $id
 * @returns {Promise<object>}    The pipeline document
 */
export async function getPipeline(id) {
  return databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
}

/**
 * Create a new pipeline document.
 *
 * @param   {object}          data - Pipeline fields to persist
 * @returns {Promise<object>}      The newly created document
 */
export async function createPipeline(data) {
  return databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
}

/**
 * Update an existing pipeline document.
 *
 * @param   {string}          id   - The Appwrite $id
 * @param   {object}          data - Fields to update
 * @returns {Promise<object>}      The updated document
 */
export async function updatePipeline(id, data) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
}

/**
 * Delete a pipeline document.
 *
 * @param   {string}      id - The Appwrite $id
 * @returns {Promise<void>}
 */
export async function deletePipeline(id) {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
}
