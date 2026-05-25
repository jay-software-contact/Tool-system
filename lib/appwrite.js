/**
 * Appwrite Client Initialization Module
 *
 * Required environment variables:
 *   APPWRITE_ENDPOINT   - Appwrite server endpoint (e.g. https://nyc.cloud.appwrite.io/v1)
 *   APPWRITE_PROJECT_ID - Appwrite project ID
 *   APPWRITE_API_KEY    - Appwrite API key (server-side, keep secret)
 *
 * Usage:
 *   import { client } from '@/lib/appwrite';
 *   // or
 *   import { Client, Account, Databases } from '@/lib/appwrite';
 */

import { Client } from 'appwrite';

// --- Validate required env vars at module load time ---
const ENDPOINT = process.env.APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

const missing = [];
if (!ENDPOINT) missing.push('APPWRITE_ENDPOINT');
if (!PROJECT_ID) missing.push('APPWRITE_PROJECT_ID');
if (!API_KEY) missing.push('APPWRITE_API_KEY');

if (missing.length > 0) {
  throw new Error(
    `[lib/appwrite] Missing required environment variable(s): ${missing.join(', ')}. ` +
    `Set them in your .env file or environment before importing this module.`
  );
}

// --- Initialize Appwrite SDK client ---
const client = new Client();

client
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

// --- Re-export SDK services for convenience ---
export { Client } from 'appwrite';
export { client };
export default client;
