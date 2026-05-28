const { Client, Databases, Query } = require('node-appwrite');

const ENDPOINT = process.env.APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_SERVER_KEY;

const c = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const db = new Databases(c);

(async () => {
  const r = await db.listDocuments('core_db', 'tools', [Query.limit(200)]);
  console.log('Total tools:', r.total);
  r.documents.forEach(d => {
    console.log(`  - ${d.name} [${d.category}] icon=${d.iconUrl} status=${d.status}`);
  });
})().catch(e => console.log('ERR:', e.message));
