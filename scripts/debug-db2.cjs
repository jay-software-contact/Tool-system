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
  // List string attributes in tools collection
  try {
    const attrs = await db.listAttributes('core_db', 'tools');
    console.log('Attributes:');
    if (attrs.attributes) {
      attrs.attributes.forEach(a => {
        console.log('  dbKey=' + (a.key || '$id') + ' type=' + a.type + ' required=' + a.required + ' array=' + !!a.array);
      });
    } else {
      console.log('  total:', attrs.total);
      console.log('  raw:', JSON.stringify(attrs).slice(0, 500));
    }
  } catch (e) {
    console.log('ERR listAttributes:', e.code, e.message);
  }

  // Try creating with just a name field
  try {
    const { ID } = require('node-appwrite');
    const r = await db.createDocument('core_db', 'tools', ID.unique(), { name: 'TestTool' });
    console.log('\nCreated with just name:', r.$id);
  } catch (e) {
    console.log('\nCreate with name error:', e.code, e.message);
  }
})();
