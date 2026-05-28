const { Client, Databases } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Manual .env.local loader
const envPath = path.resolve(__dirname, '..', '.env.local');
const env = {};
fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
  const t = line.trim();
  if (!t || t.startsWith('#')) return;
  const eq = t.indexOf('=');
  if (eq === -1) return;
  env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
});

const c = new Client()
  .setEndpoint(env.APPWRITE_ENDPOINT)
  .setProject(env.APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_SERVER_KEY);
const db = new Databases(c);

(async () => {
  try {
    const colls = await db.listCollections('core_db');
    console.log('Collections:');
    colls.collections.forEach(c => console.log(' -', c.$id, c.name));

    const r = await db.listDocuments('core_db', 'tools');
    console.log('\nTools found:', r.total);
    if (r.documents.length > 0) {
      console.log('First doc:', JSON.stringify(r.documents[0]).slice(0, 300));
    }
  } catch (e) {
    console.log('ERR:', e.code, e.message);
  }

  // Try getting collection metadata
  try {
    const col = await db.getCollection('core_db', 'tools');
    console.log('\nCollection attrs:');
    if (col.attributes) {
      col.attributes.forEach(a => console.log(' -', a.key || a.$id, typeof a));
    }
  } catch (e) {
    console.log('ERR getCollection:', e.message);
  }
})();
