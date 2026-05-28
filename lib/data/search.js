/**
 * Search Data Layer — Multi-Collection Full-Text Search
 *
 * Provides a unified search function that queries across multiple Appwrite
 * collections and merges the results. Uses the Appwrite SDK's Databases
 * service (SDK v14+) via Query.search().
 *
 * Configuration:
 *   APPWRITE_DATABASE_ID - Database ID (defaults via ../appwrite.js)
 *
 * By default searches the 'tools' and 'taxonomy' collections.
 * Pass a custom `collections` array to override.
 */

import { client, DATABASE_ID } from '../appwrite.js';
import { Databases, Query } from 'appwrite';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Appwrite Databases service instance */
const databases = new Databases(client);

/**
 * Default collection IDs to search across.
 * Override per-call via the `collections` parameter.
 */
const DEFAULT_COLLECTIONS = ['tools', 'taxonomy'];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search across multiple Appwrite collections using full-text search.
 *
 * For each collection, issues a Query.search() call and merges results into a
 * single array. Results from each collection are tagged with a `_collection`
 * field indicating their source.
 *
 * Per-collection error handling: if one collection fails, the search continues
 * on remaining collections. Errors are logged to stderr but do not reject the
 * overall search.
 *
 * @param   {string}      query       - Search term
 * @param   {string[]}    [collections] - Collection IDs to search (default: ['tools', 'taxonomy'])
 * @param   {object}      [filters]   - Per-collection filter keys to return
 * @returns {Promise<object[]>} Merged array of matching documents, each tagged with `_collection`
 *
 * @example
 *   // Default search (tools + taxonomy)
 *   const results = await search('hammer');
 *
 *   // Custom collections
 *   const results = await search('layout', ['components', 'templates']);
 */
export async function search(
  query,
  collections = DEFAULT_COLLECTIONS,
  filters = {}
) {
  if (!query || typeof query !== 'string') {
    throw new Error('[lib/data/search] "query" must be a non-empty string');
  }

  const allResults = [];

  for (const collectionId of collections) {
    try {
      const queries = [Query.search(query)];

      if (filters.limit != null) {
        queries.push(Query.limit(filters.limit));
      }

      const result = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        queries
      );

      const docs = (result?.documents ?? []).map((doc) => ({
        ...doc,
        _collection: collectionId,
      }));

      allResults.push(...docs);
    } catch (err) {
      console.error(
        `[lib/data/search] Error searching collection "${collectionId}": ${err.message}`
      );
    }
  }

  return allResults;
}
