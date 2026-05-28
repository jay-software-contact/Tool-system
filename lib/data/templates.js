/**
 * Templates Data Layer — Appwrite Collection CRUD
 *
 * Provides query and mutation operations for the 'templates' Appwrite collection.
 * Each function uses the shared Appwrite client from ../appwrite.js and the
 * Appwrite SDK's Databases service (SDK v14+).
 *
 * Collection configuration:
 *   APPWRITE_DATABASE_ID - Database ID (defaults to 'default')
 *   APPWRITE_TEMPLATES_COLLECTION_ID - Override the default collection ID
 */

import { client, DATABASE_ID } from '../appwrite.js';
import { Databases, ID, Query } from 'appwrite';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** @constant {string} Appwrite collection ID for templates */
const COLLECTION_ID =
  process.env.APPWRITE_TEMPLATES_COLLECTION_ID || 'templates';

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
 * List templates from the Appwrite collection, optionally filtered.
 *
 * @param   {object}      [filters]
 * @returns {Promise<object[]>} Array of template documents
 */
export async function listTemplates(filters = {}) {
  const queries = buildQueries(filters);
  const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
  return result?.documents ?? [];
}

/**
 * Retrieve a single template by its Appwrite document ID.
 *
 * @param   {string}          id - The Appwrite $id
 * @returns {Promise<object>}    The template document
 */
export async function getTemplate(id) {
  return databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
}

/**
 * Create a new template document.
 *
 * @param   {object}          data - Template fields to persist
 * @returns {Promise<object>}      The newly created document
 */
export async function createTemplate(data) {
  return databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
}

/**
 * Update an existing template document.
 *
 * @param   {string}          id   - The Appwrite $id
 * @param   {object}          data - Fields to update
 * @returns {Promise<object>}      The updated document
 */
export async function updateTemplate(id, data) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
}

/**
 * Delete a template document.
 *
 * @param   {string}      id - The Appwrite $id
 * @returns {Promise<void>}
 */
export async function deleteTemplate(id) {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
}
