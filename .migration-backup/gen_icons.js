const fs = require('fs');
const path = require('path');

const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const buf = Buffer.from(b64, 'base64');

fs.writeFileSync(path.join(__dirname, 'public', 'icon-192.png'), buf);
fs.writeFileSync(path.join(__dirname, 'public', 'icon-512.png'), buf);

console.log('Created placeholder icons');
