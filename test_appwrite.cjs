const { Client } = require('appwrite');
const c = new Client();
console.log('setKey:', typeof c.setKey);
console.log('setEndpoint:', typeof c.setEndpoint);
console.log('setProject:', typeof c.setProject);
