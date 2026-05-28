const { Client } = require('appwrite');
const c = new Client();
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(c)).filter(m => m.startsWith('set'));
console.log('Setter methods:', methods);
