import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class BotManager {
  constructor() {
    // Map of client_id -> child process
    this.processes = new Map();
    // Map of client_id -> last log message
    this.lastLogs = new Map();
    // WebSocket broadcast function
    this.broadcast = null;
  }

  setBroadcast(broadcastFn) {
    this.broadcast = broadcastFn;
  }

  isRunning(clientId) {
    return this.processes.has(clientId);
  }

  getStatus(clientId) {
    const running = this.isRunning(clientId);
    const lastLog = this.lastLogs.get(clientId) || null;
    return { running, lastLog };
  }

  getAllStatuses() {
    const statuses = {};
    const clients = db.prepare('SELECT id FROM clients').all();

    clients.forEach(client => {
      statuses[client.id] = this.getStatus(client.id);
    });

    return statuses;
  }

  start(client) {
    if (this.isRunning(client.id)) {
      throw new Error(`Bot for client ${client.id} is already running`);
    }

    const botPath = path.join(__dirname, '../../src/commands/bot-worker.js');

    const args = [
      '--client-id', client.id.toString(),
      '--current', client.current_date,
    ];

    if (client.target_date) {
      args.push('--target', client.target_date);
    }

    if (client.min_date) {
      args.push('--min', client.min_date);
    }

    // Set environment variables for this bot
    const env = {
      ...process.env,
      EMAIL: client.email,
      PASSWORD: client.password,
      COUNTRY_CODE: client.country_code,
      SCHEDULE_ID: client.schedule_id,
      FACILITY_ID: client.facility_id,
      REFRESH_DELAY: client.refresh_delay.toString()
    };

    const childProcess = fork(botPath, args, {
      env,
      silent: true
    });

    // Handle bot output
    childProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      this.handleLog(client.id, message);
    });

    childProcess.stderr.on('data', (data) => {
      const message = `ERROR: ${data.toString().trim()}`;
      this.handleLog(client.id, message);
    });

    // Handle bot exit
    childProcess.on('exit', (code) => {
      const message = code === 0
        ? 'Bot completed successfully'
        : `Bot exited with code ${code}`;

      this.handleLog(client.id, message);
      this.processes.delete(client.id);

      // Broadcast status update
      if (this.broadcast) {
        this.broadcast({
          type: 'status',
          clientId: client.id,
          data: this.getStatus(client.id)
        });
      }
    });

    childProcess.on('error', (err) => {
      const message = `Process error: ${err.message}`;
      this.handleLog(client.id, message);
    });

    this.processes.set(client.id, childProcess);
    this.handleLog(client.id, 'Bot started');

    return true;
  }

  stop(clientId) {
    const process = this.processes.get(clientId);

    if (!process) {
      throw new Error(`Bot for client ${clientId} is not running`);
    }

    process.kill('SIGTERM');
    this.processes.delete(clientId);
    this.handleLog(clientId, 'Bot stopped by user');

    return true;
  }

  handleLog(clientId, message) {
    const logEntry = {
      client_id: clientId,
      message,
      timestamp: new Date().toISOString()
    };

    // Save to database
    db.prepare(`
      INSERT INTO logs (client_id, message, timestamp)
      VALUES (?, ?, ?)
    `).run(clientId, message, logEntry.timestamp);

    // Update last log in memory
    this.lastLogs.set(clientId, {
      message,
      timestamp: logEntry.timestamp
    });

    // Broadcast to WebSocket clients
    if (this.broadcast) {
      this.broadcast({
        type: 'log',
        clientId,
        data: logEntry
      });

      this.broadcast({
        type: 'status',
        clientId,
        data: this.getStatus(clientId)
      });
    }
  }

  stopAll() {
    this.processes.forEach((process, clientId) => {
      try {
        this.stop(clientId);
      } catch (err) {
        console.error(`Error stopping bot ${clientId}:`, err);
      }
    });
  }
}

// Singleton instance
export const botManager = new BotManager();

// Graceful shutdown
process.on('SIGTERM', () => botManager.stopAll());
process.on('SIGINT', () => botManager.stopAll());
