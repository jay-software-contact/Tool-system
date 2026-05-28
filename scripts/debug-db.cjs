const { Client, Databases } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

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
  // List collections
  try {
    const colls = await db.listCollections('core_db');
    console.log('Collections:');
    colls.collections.forEach(c => console.log(' -', c.$id, c.name));
  } catch (e) {
    console.log('ERR listCollections:', e.code, e.message);
  }

  // List collection attributes using the native client
  try {
    const col = await db.getCollection('core_db', 'tools');
    console.log('\nCollection $id:', col.$id);
    console.log('Collection name:', col.name);
    console.log('Attributes:');
    if (col.attributes) {
      col.attributes.forEach(a => {
        console.log('  key=' + (a.key || a.$id) + ' type=' + (a.type || a.attribute));
      });
    } else {
      console.log('  (no attributes array — dumping keys):');
      console.log('  ' + Object.keys(col).join(', '));
    }
  } catch (e) {
    console.log('ERR getCollection:', e.code, e.message);
  }

  // Try creating a minimal doc to see what errors we get
  try {
    const { ID } = require('node-appwrite');
    const r = await db.createDocument('core_db', 'tools', ID.unique(), { test: 'hello' });
    console.log('\nTest doc created:', r.$id);
  } catch (e) {
    console.log('\nTest create error:', e.code, e.message);
  }
})();
