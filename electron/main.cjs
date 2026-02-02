const electron = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Try to get app from different possible locations
const app = electron.app || (electron.default && electron.default.app);
const BrowserWindow = electron.BrowserWindow || (electron.default && electron.default.BrowserWindow);

if (!app || !BrowserWindow) {
  console.error('Failed to load Electron modules');
  console.error('electron object:', electron);
  process.exit(1);
}

let mainWindow;
let serverProcess;

const isDev = process.env.NODE_ENV === 'development';
const SERVER_PORT = 3001;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'US Visa Bot Manager',
    show: false
  });

  mainWindow.loadURL('http://localhost:3001');

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  if (serverProcess) {
    console.log('Server already running, skipping start');
    return Promise.resolve();
  }

  const serverPath = path.join(__dirname, '../server/server.js');

  serverProcess = spawn('node', ['--no-warnings', serverPath], {
    env: { ...process.env, PORT: SERVER_PORT },
    stdio: 'inherit'
  });

  serverProcess.on('error', (err) => {
    console.error('Server error:', err);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`Server process exited with code ${code} and signal ${signal}`);
    serverProcess = null;
    // Don't restart automatically - only restart if explicitly requested
  });

  return new Promise((resolve) => setTimeout(resolve, 3000));
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

app.on('ready', async () => {
  await startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (mainWindow === null) {
    if (!serverProcess) {
      await startServer();
    }
    createWindow();
  }
});

app.on('before-quit', () => {
  stopServer();
});
