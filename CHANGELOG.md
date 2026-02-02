# Changelog

All notable changes to US Visa Bot Manager will be documented in this file.

## [1.2.0] - 2025-12-26

### 🔧 Fixed
- **Server restart issue in dev mode**
  - Added exit event handler for server process
  - Server no longer restarts infinitely
  - Added guard against multiple server starts
  - Removed automatic restart on server exit

### ✨ Added
- **Dev mode for developers** (`npm run dev`)
  - Launches web server without Electron wrapper
  - Opens interface in browser at http://localhost:3001
  - Faster development iteration
  - No Electron API issues in dev environment

### 🎨 Improved
- **Package structure**
  - Moved electron to devDependencies (proper practice)
  - Updated to Electron 30.0.0 for better compatibility
  - Fixed better-sqlite3 compilation issues

### 📚 Documentation
- **Enhanced README.md**
  - Added dev and production mode instructions
  - Explained known issues with solutions
  - Added developer setup guide
  - Included project structure and tech stack details

## [1.1.0] - 2025-12-26

### ✨ Added
- **Loading Screen**: Beautiful animated loading screen while server starts
  - Gradient background with spinner animation
  - Automatic dismissal when ready
  - No more white screen on startup!

- **Status Bar**: New bottom status bar with real-time information
  - 🟢 Connection status indicator (Connected/Disconnected)
  - 📊 Live statistics (Total Clients, Running Bots count)
  - 💾 Database Export button with instructions
  - 📂 Database Import button with restore guide
  - Pulsating animations for active elements

- **Server Health Check**: Improved startup reliability
  - Electron now waits for server to be fully ready
  - Checks `/health` endpoint before opening window
  - Eliminates white screen issues

- **View Logs Button**: Added 📋 button in Actions column
  - Makes log viewing feature more discoverable
  - Click to open real-time logs panel

### 🐛 Fixed
- Fixed bot execution issue (exit code 1)
  - Added `src/package.json` with `"type": "module"` for ES6 support
  - Changed from `fork()` to `spawn()` with proper Node.js flags
  - Bots now start correctly

- Fixed STOP button being disabled when errors occur
  - Button now always active when bot is running
  - Users can stop bots even during errors

- Fixed log auto-scroll behavior
  - Removed auto-scroll to bottom
  - New logs appear at the top instead
  - Users can scroll freely without interruption

### 🎨 Improved
- Better error handling with alert dialogs
  - All operations show clear error messages
  - Alerts appear for start/stop/save/delete failures
  - Errors also logged to status banner

- Enhanced visual feedback
  - Running bots count highlighted in green
  - Connection status with pulsating indicator
  - Professional gradient design throughout

### 📚 Documentation
- Added comprehensive [USER_GUIDE.md](USER_GUIDE.md)
  - Installation instructions for macOS and Windows
  - Step-by-step quick start guide
  - How to find Schedule ID and Facility ID
  - Troubleshooting common issues
  - Database backup and restore instructions

## [1.0.0] - 2025-12-26

### 🎉 Initial Release
- Desktop application for managing US Visa appointment bots
- Support for multiple clients simultaneously
- Real-time WebSocket logs
- SQLite database for local data storage
- Start/Stop controls for each bot
- Edit and delete client functionality
- macOS (Apple Silicon) and Windows (x64) support

### Features
- **Client Management**: Add, edit, delete clients with all visa parameters
- **Bot Control**: Individual start/stop buttons for each client
- **Live Logs**: Real-time log streaming via WebSocket
- **Database**: Local SQLite storage (server/db/clients.db)
- **Multi-platform**: Electron-based desktop app

### Technical Stack
- Frontend: React 18 + Vite
- Backend: Node.js + Express + WebSocket
- Database: SQLite (better-sqlite3)
- Desktop: Electron
- Process Management: Child processes for bot isolation

---

## Version Format

We use [Semantic Versioning](https://semver.org/):
- **Major.Minor.Patch** (e.g., 1.1.0)
- **Major**: Breaking changes
- **Minor**: New features (backwards compatible)
- **Patch**: Bug fixes (backwards compatible)

## Categories

- ✨ **Added**: New features
- 🐛 **Fixed**: Bug fixes
- 🎨 **Improved**: Enhancements to existing features
- ⚠️ **Deprecated**: Soon-to-be removed features
- 🗑️ **Removed**: Removed features
- 🔒 **Security**: Security improvements
- 📚 **Documentation**: Documentation changes
