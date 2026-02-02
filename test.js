console.log('Testing electron require...');
const electron = require('electron');
console.log('electron:', typeof electron);
console.log('electron keys:', Object.keys(electron || {}));
console.log('electron.app:', typeof electron?.app);
