const { Client } = require('appwrite');
const c = new Client();
// Try setting key as header
c.setEndpoint('https://nyc.cloud.appwrite.io/v1');
c.setProject('6a13543d0006a286284f');
// In v14, API key is set via custom header
c.headers = { 'X-Appwrite-Key': 'test-key' };
console.log('Client configured successfully');
console.log('Headers:', JSON.stringify(c.headers));
