/**
 * Activity Log Data Layer — Appwrite Collection CRUD
 *
 * Provides query and mutation operations for the 'activity' Appwrite collection.
 * Each function uses the shared Appwrite client from ../appwrite.js and the
 * Appwrite SDK's Databases service (SDK v14+).
 *
 * Collection configuration:
 *   APPWRITE_DATABASE_ID - Database ID (defaults to 'default')
 *   APPWRITE_ACTIVITY_COLLECTION_ID - Override the default collection ID
 */

import { client, DATABASE_ID } from '../appwrite.js';
import { Databases, ID, Query } from 'appwrite';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** @constant {string} Appwrite collection ID for activity log */
const COLLECTION_ID =
  process.env.APPWRITE_ACTIVITY_COLLECTION_ID || 'activity';

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
 * List activity log entries, optionally filtered.
 * Results are ordered by createdAt desc by default.
 *
 * @param   {object}      [filters]
 * @returns {Promise<object[]>} Array of activity documents
 */
export async function listActivityEntries(filters = {}) {
  const queries = buildQueries({ orderBy: '$createdAt', order: 'desc', ...filters });
  const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
  return result?.documents ?? [];
}

/**
 * Retrieve a single activity entry by its Appwrite document ID.
 *
 * @param   {string}          id - The Appwrite $id
 * @returns {Promise<object>}    The activity document
 */
export async function getActivityEntry(id) {
  return databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
}

/**
 * Create a new activity log entry.
 *
 * @param   {object}          data - Activity fields to persist
 * @returns {Promise<object>}      The newly created document
 */
export async function createActivityEntry(data) {
  return databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
}

/**
 * Update an existing activity log entry.
 *
 * @param   {string}          id   - The Appwrite $id
 * @param   {object}          data - Fields to update
 * @returns {Promise<object>}      The updated document
 */
export async function updateActivityEntry(id, data) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
}

/**
 * Delete an activity log entry.
 *
 * @param   {string}      id - The Appwrite $id
 * @returns {Promise<void>}
 */
export async function deleteActivityEntry(id) {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
}
