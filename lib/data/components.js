/**
 * Components Data Layer — Appwrite Collection CRUD
 *
 * Provides query and mutation operations for the 'components' Appwrite collection.
 * Each function uses the shared Appwrite client from ../appwrite.js and the
 * Appwrite SDK's Databases service.
 *
 * Expected environment variables (set in ../appwrite.js):
 *   APPWRITE_ENDPOINT
 *   APPWRITE_PROJECT_ID
 *   APPWRITE_API_KEY
 *
 * Collection configuration:
 *   Set APPWRITE_COLLECTION_COMPONENTS_ID to override the default collection ID.
 *
 * Usage:
 *   import { listComponents, getComponent, createComponent, updateComponent, deleteComponent }
 *     from '@/lib/data/components';
 */

import { client } from '../appwrite.js';
import { Databases, ID, Query } from 'appwrite';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** @constant {string} Appwrite database ID — override via env if needed */
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '';

/** @constant {string} Appwrite collection ID for components */
const COLLECTION_ID = process.env.APPWRITE_COLLECTION_COMPONENTS_ID || 'components';

/** Appwrite Databases service instance, bound to the shared client */
const databases = new Databases(client);

// ---------------------------------------------------------------------------
// helpers (internal)
// ---------------------------------------------------------------------------

/**
 * Resolve the full document list payload into a plain array of documents.
 * Appwrite SDK returns { total, documents } from listDocuments.
 *
 * @param {{ total: number, documents: object[] }} result
 * @returns {object[]} The documents array
 */
function unwrapList(result) {
  return result?.documents ?? [];
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

/**
 * List components from the Appwrite collection, optionally filtered.
 *
 * Supported filter keys (maps to Appwrite Query helpers):
 *   search    {string}  Full-text search query
 *   limit     {number}  Max documents to return (default: 25)
 *   offset    {number}  Pagination offset (default: 0)
 *   orderBy   {string}  Document attribute to sort by
 *   order     {'asc'|'desc'} Sort direction (default: 'asc')
 *   where     {Array<[string, string, any]>} Raw [attribute, operator, value] triples
 *
 * @param   {object}  [filters={}]         Filter options
 * @param   {string}  [filters.search]     Full-text search term
 * @param   {number}  [filters.limit]      Max results (1-100)
 * @param   {number}  [filters.offset]     Pagination offset
 * @param   {string}  [filters.orderBy]    Field to sort by
 * @param   {string}  [filters.order]      Sort direction ('asc' | 'desc')
 * @param   {Array}   [filters.where]      Raw Appwrite Query conditions
 * @returns {Promise<object[]>}            Array of component documents
 */
export async function listComponents(filters = {}) {
  const { search, limit, offset, orderBy, order, where } = filters;

  /** @type {string[]} */
  const queries = [];

  if (limit != null) queries.push(Query.limit(limit));
  if (offset != null) queries.push(Query.offset(offset));
  if (orderBy) {
    const fn = order === 'desc' ? Query.orderDesc : Query.orderAsc;
    queries.push(fn(orderBy));
  }
  if (search) queries.push(Query.search(search));
  if (where?.length) {
    for (const [attr, op, val] of where) {
      switch (op) {
        case '=':   queries.push(Query.equal(attr, val)); break;
        case '!=':  queries.push(Query.notEqual(attr, val)); break;
        case '>':   queries.push(Query.greaterThan(attr, val)); break;
        case '>=':  queries.push(Query.greaterThanEqual(attr, val)); break;
        case '<':   queries.push(Query.lessThan(attr, val)); break;
        case '<=':  queries.push(Query.lessThanEqual(attr, val)); break;  default: break; // unknown operator — skip
      }
    }
  }

  const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
  return unwrapList(result);
}

/**
 * Retrieve a single component document by its Appwrite document ID.
 *
 * @param   {string}          id - The Appwrite document ($id)
 * @returns {Promise<object>}    The component document
 * @throws  {Error}              If the document is not found or the request fails
 */
export async function getComponent(id) {
  return databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
}

/**
 * Create a new component document in the Appwrite collection.
 *
 * @param   {object}          data - Component fields to persist
 * @returns {Promise<object>}      The newly created component document
 * @throws  {Error}                If validation fails or the request fails
 */
export async function createComponent(data) {
  return databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
}

/**
 * Update an existing component document in the Appwrite collection.
 * Only the supplied fields are merged; omitted fields remain unchanged.
 *
 * @param   {string}          id   - The Appwrite document ($id) to update
 * @param   {object}          data - Fields to update
 * @returns {Promise<object>}      The updated component document
 * @throws  {Error}                If the document is not found or the request fails
 */
export async function updateComponent(id, data) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
}

/**
 * Delete a component document from the Appwrite collection.
 *
 * @param   {string}      id - The Appwrite document ($id) to delete
 * @returns {Promise<void>}  Resolves when the document is deleted
 * @throws  {Error}          If the document is not found or the request fails
 */
export async function deleteComponent(id) {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
}
