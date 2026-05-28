/**
 * Appwrite Database Bootstrap Script
 * 
 * Creates the 'core_db' database with all 9 collections and their attributes.
 * Run: node scripts/create-appwrite-db.cjs
 * 
 * Requires APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY in env.
 */

const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

const ENDPOINT = process.env.APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_SERVER_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'core_db';

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error('ERROR: Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY env vars');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// ── Collection definitions ──────────────────────────────────────────────────
// Each collection: { id, name, attributes[], indexes[] }
// Attribute types: string, integer, float, boolean, email, url, ip, datetime, relationship, json

const COLLECTIONS = [
  {
    id: 'tools',
    name: 'Tools',
    attributes: [
      { key: 'name', type: 'string', size: 256, required: true },
      { key: 'slug', type: 'string', size: 256, required: false },
      { key: 'category', type: 'string', size: 128, required: true },
      { key: 'description', type: 'string', size: 4096, required: false },
      { key: 'ratings', type: 'string', size: 8192, required: false }, // JSON blob
      { key: 'iconUrl', type: 'string', size: 1024, required: false },
      { key: 'status', type: 'string', size: 64, required: false, default: 'active' },
    ],
    indexes: [
      { key: 'idx_tools_name', type: 'key', attributes: ['name'] },
      { key: 'idx_tools_category', type: 'key', attributes: ['category'] },
      { key: 'idx_tools_slug', type: 'unique', attributes: ['slug'] },
    ],
  },
  {
    id: 'aesthetic_taxonomy',
    name: 'Aesthetic Taxonomy',
    attributes: [
      { key: 'name', type: 'string', size: 256, required: true },
      { key: 'slug', type: 'string', size: 256, required: true },
      { key: 'parentId', type: 'string', size: 64, required: false },
      { key: 'description', type: 'string', size: 2048, required: false },
      { key: 'color', type: 'string', size: 32, required: false },
      { key: 'sortOrder', type: 'integer', required: false, default: 0 },
    ],
    indexes: [
      { key: 'idx_taxonomy_name', type: 'key', attributes: ['name'] },
      { key: 'idx_taxonomy_slug', type: 'unique', attributes: ['slug'] },
      { key: 'idx_taxonomy_parent', type: 'key', attributes: ['parentId'] },
    ],
  },
  {
    id: 'components',
    name: 'Components',
    attributes: [
      { key: 'name', type: 'string', size: 256, required: true },
      { key: 'description', type: 'string', size: 4096, required: false },
      { key: 'aestheticCategory', type: 'string', size: 128, required: true },
      { key: 'type', type: 'string', size: 128, required: true },
      { key: 'designTokens', type: 'string', size: 16384, required: false }, // JSON blob
      { key: 'code', type: 'string', size: 65536, required: false },
      { key: 'previewUrl', type: 'string', size: 1024, required: false },
    ],
    indexes: [
      { key: 'idx_components_name', type: 'key', attributes: ['name'] },
      { key: 'idx_components_aesthetic', type: 'key', attributes: ['aestheticCategory'] },
      { key: 'idx_components_type', type: 'key', attributes: ['type'] },
    ],
  },
  {
    id: 'templates',
    name: 'Templates',
    attributes: [
      { key: 'name', type: 'string', size: 256, required: true },
      { key: 'slug', type: 'string', size: 256, required: true },
      { key: 'description', type: 'string', size: 4096, required: false },
      { key: 'category', type: 'string', size: 128, required: false },
      { key: 'config', type: 'string', size: 32768, required: false }, // JSON blob
      { key: 'previewUrl', type: 'string', size: 1024, required: false },
      { key: 'status', type: 'string', size: 64, required: false, default: 'draft' },
    ],
    indexes: [
      { key: 'idx_templates_name', type: 'key', attributes: ['name'] },
      { key: 'idx_templates_slug', type: 'unique', attributes: ['slug'] },
      { key: 'idx_templates_category', type: 'key', attributes: ['category'] },
    ],
  },
  {
    id: 'user_templates',
    name: 'User Templates',
    attributes: [
      { key: 'userId', type: 'string', size: 64, required: true },
      { key: 'templateId', type: 'string', size: 64, required: true },
      { key: 'name', type: 'string', size: 256, required: true },
      { key: 'config', type: 'string', size: 32768, required: false }, // JSON blob
      { key: 'isPublic', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'idx_ut_user', type: 'key', attributes: ['userId'] },
      { key: 'idx_ut_template', type: 'key', attributes: ['templateId'] },
      { key: 'idx_ut_user_template', type: 'unique', attributes: ['userId', 'templateId'] },
    ],
  },
  {
    id: 'issues',
    name: 'Issues',
    attributes: [
      { key: 'title', type: 'string', size: 512, required: true },
      { key: 'description', type: 'string', size: 8192, required: false },
      { key: 'status', type: 'string', size: 64, required: false, default: 'open' },
      { key: 'priority', type: 'string', size: 32, required: false, default: 'medium' },
      { key: 'assigneeId', type: 'string', size: 64, required: false },
      { key: 'reporterId', type: 'string', size: 64, required: false },
      { key: 'toolId', type: 'string', size: 64, required: false },
      { key: 'labels', type: 'string', size: 2048, required: false }, // JSON array
    ],
    indexes: [
      { key: 'idx_issues_status', type: 'key', attributes: ['status'] },
      { key: 'idx_issues_priority', type: 'key', attributes: ['priority'] },
      { key: 'idx_issues_assignee', type: 'key', attributes: ['assigneeId'] },
      { key: 'idx_issues_tool', type: 'key', attributes: ['toolId'] },
    ],
  },
  {
    id: 'pipelines',
    name: 'Pipelines',
    attributes: [
      { key: 'name', type: 'string', size: 256, required: true },
      { key: 'description', type: 'string', size: 4096, required: false },
      { key: 'stages', type: 'string', size: 16384, required: false }, // JSON array
      { key: 'status', type: 'string', size: 64, required: false, default: 'active' },
      { key: 'ownerId', type: 'string', size: 64, required: false },
    ],
    indexes: [
      { key: 'idx_pipelines_name', type: 'key', attributes: ['name'] },
      { key: 'idx_pipelines_status', type: 'key', attributes: ['status'] },
      { key: 'idx_pipelines_owner', type: 'key', attributes: ['ownerId'] },
    ],
  },
  {
    id: 'activity_log',
    name: 'Activity Log',
    attributes: [
      { key: 'userId', type: 'string', size: 64, required: false },
      { key: 'action', type: 'string', size: 128, required: true },
      { key: 'entityType', type: 'string', size: 64, required: true },
      { key: 'entityId', type: 'string', size: 64, required: true },
      { key: 'metadata', type: 'string', size: 8192, required: false }, // JSON blob
      { key: 'ipAddress', type: 'string', size: 64, required: false },
    ],
    indexes: [
      { key: 'idx_activity_user', type: 'key', attributes: ['userId'] },
      { key: 'idx_activity_action', type: 'key', attributes: ['action'] },
      { key: 'idx_activity_entity', type: 'key', attributes: ['entityType', 'entityId'] },
      { key: 'idx_activity_created', type: 'key', attributes: ['$createdAt'] },
    ],
  },
  {
    id: 'rating_schemas',
    name: 'Rating Schemas',
    attributes: [
      { key: 'name', type: 'string', size: 256, required: true },
      { key: 'slug', type: 'string', size: 256, required: true },
      { key: 'description', type: 'string', size: 2048, required: false },
      { key: 'dimensions', type: 'string', size: 16384, required: false }, // JSON array
      { key: 'maxScore', type: 'integer', required: false, default: 5 },
      { key: 'isDefault', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'idx_rs_name', type: 'key', attributes: ['name'] },
      { key: 'idx_rs_slug', type: 'unique', attributes: ['slug'] },
      { key: 'idx_rs_default', type: 'key', attributes: ['isDefault'] },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function createDatabase() {
  try {
    const db = await databases.create(DATABASE_ID, 'core_db');
    console.log(`  Database created: ${db.$id} (${db.name})`);
    return db;
  } catch (err) {
    if (err.code === 409) {
      console.log(`  Database already exists: ${DATABASE_ID}`);
      return { $id: DATABASE_ID };
    }
    throw err;
  }
}

async function createCollection(def) {
  try {
    const col = await databases.createCollection(
      DATABASE_ID,
      def.id,
      def.name,
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false // documentSecurity: false — use attribute-level permissions
    );
    console.log(`  Collection created: ${col.$id} (${col.name})`);
    return col;
  } catch (err) {
    if (err.code === 409) {
      console.log(`  Collection already exists: ${def.id}`);
      return { $id: def.id };
    }
    throw err;
  }
}

async function createAttribute(collectionId, attr) {
  const { key, type, size, required, array, default: defVal } = attr;
  try {
    switch (type) {
      case 'string':
        await databases.createStringAttribute(
          DATABASE_ID, collectionId, key, size, required ?? false, defVal, array ?? false
        );
        break;
      case 'integer':
        await databases.createIntegerAttribute(
          DATABASE_ID, collectionId, key, required ?? false, undefined, undefined, defVal, array ?? false
        );
        break;
      case 'float':
        await databases.createFloatAttribute(
          DATABASE_ID, collectionId, key, required ?? false, undefined, undefined, defVal, array ?? false
        );
        break;
      case 'boolean':
        await databases.createBooleanAttribute(
          DATABASE_ID, collectionId, key, required ?? false, defVal, array ?? false
        );
        break;
      case 'email':
        await databases.createEmailAttribute(
          DATABASE_ID, collectionId, key, required ?? false, defVal, array ?? false
        );
        break;
      case 'url':
        await databases.createUrlAttribute(
          DATABASE_ID, collectionId, key, required ?? false, defVal, array ?? false
        );
        break;
      case 'ip':
        await databases.createIpAttribute(
          DATABASE_ID, collectionId, key, required ?? false, defVal, array ?? false
        );
        break;
      case 'datetime':
        await databases.createDatetimeAttribute(
          DATABASE_ID, collectionId, key, required ?? false, defVal, array ?? false
        );
        break;
      default:
        console.log(`    WARN: Unknown attribute type '${type}' for '${key}' — skipping`);
        return;
    }
    console.log(`    Attribute: ${key} (${type}${size ? ', ' + size : ''})`);
  } catch (err) {
    if (err.code === 409) {
      console.log(`    Attribute already exists: ${key}`);
    } else {
      console.error(`    ERROR creating attribute ${key}: ${err.message}`);
    }
  }
}

async function createIndex(collectionId, idx) {
  try {
    await databases.createIndex(
      DATABASE_ID,
      collectionId,
      idx.key,
      idx.type,
      idx.attributes
    );
    console.log(`    Index: ${idx.key} (${idx.type}: ${idx.attributes.join(', ')})`);
  } catch (err) {
    if (err.code === 409) {
      console.log(`    Index already exists: ${idx.key}`);
    } else {
      console.error(`    ERROR creating index ${idx.key}: ${err.message}`);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Appwrite Database Bootstrap ===');
  console.log(`  Endpoint:  ${ENDPOINT}`);
  console.log(`  Project:   ${PROJECT_ID}`);
  console.log(`  Database:  ${DATABASE_ID}`);
  console.log('');

  // Step 1: Database already created — skip
  // await createDatabase();
  console.log('Step 1: Database already exists — skipping.');
  console.log('');

  // Step 2: Create collections with attributes and indexes
  for (const def of COLLECTIONS) {
    console.log(`Step: Collection '${def.id}'...`);
    await createCollection(def);

    // Create attributes
    for (const attr of def.attributes) {
      await createAttribute(def.id, attr);
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    }

    // Create indexes
    for (const idx of def.indexes) {
      await createIndex(def.id, idx);
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('');
  }

  console.log('=== Bootstrap complete ===');
  console.log(`Database '${DATABASE_ID}' is ready with ${COLLECTIONS.length} collections.`);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
