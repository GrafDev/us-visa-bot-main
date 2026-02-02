// Minimal test to check if electron loads properly
console.log('Test electron file loaded');
console.log('process.versions.electron:', process.versions.electron);
console.log('process.type:', process.type);

try {
  const electron = require('electron');
  console.log('typeof electron:', typeof electron);
  console.log('electron keys:', Object.keys(electron).slice(0, 10));

  if (electron.app) {
    console.log('SUCCESS: electron.app is available!');
    electron.app.on('ready', () => {
      console.log('Electron app ready event fired');
      electron.app.quit();
    });
  } else {
    console.log('FAIL: electron.app is not available');
  }
} catch (err) {
  console.error('Error requiring electron:', err);
}
