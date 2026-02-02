import express from 'express';
import db from '../db/database.js';
import { botManager } from '../services/BotManager.js';

const router = express.Router();

// Get all clients
router.get('/', (req, res) => {
  try {
    const clients = db.prepare(`
      SELECT * FROM clients ORDER BY created_at DESC
    `).all();

    // Add running status to each client
    const clientsWithStatus = clients.map(client => ({
      ...client,
      status: botManager.getStatus(client.id)
    }));

    res.json(clientsWithStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single client
router.get('/:id', (req, res) => {
  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      ...client,
      status: botManager.getStatus(client.id)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new client
router.post('/', (req, res) => {
  try {
    const {
      name,
      email,
      password,
      country_code,
      schedule_id,
      facility_id,
      current_date,
      target_date,
      min_date,
      refresh_delay
    } = req.body;

    // Validation
    if (!name || !email || !password || !country_code || !schedule_id || !facility_id || !current_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = db.prepare(`
      INSERT INTO clients (
        name, email, password, country_code, schedule_id, facility_id,
        current_date, target_date, min_date, refresh_delay
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      email,
      password,
      country_code,
      schedule_id,
      facility_id,
      current_date,
      target_date || null,
      min_date || null,
      refresh_delay || 3
    );

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      ...client,
      status: botManager.getStatus(client.id)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update client
router.put('/:id', (req, res) => {
  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Don't allow updating if bot is running
    if (botManager.isRunning(client.id)) {
      return res.status(400).json({ error: 'Cannot update client while bot is running. Stop the bot first.' });
    }

    const {
      name,
      email,
      password,
      country_code,
      schedule_id,
      facility_id,
      current_date,
      target_date,
      min_date,
      refresh_delay
    } = req.body;

    db.prepare(`
      UPDATE clients SET
        name = ?,
        email = ?,
        password = ?,
        country_code = ?,
        schedule_id = ?,
        facility_id = ?,
        current_date = ?,
        target_date = ?,
        min_date = ?,
        refresh_delay = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || client.name,
      email || client.email,
      password || client.password,
      country_code || client.country_code,
      schedule_id || client.schedule_id,
      facility_id || client.facility_id,
      current_date || client.current_date,
      target_date !== undefined ? target_date : client.target_date,
      min_date !== undefined ? min_date : client.min_date,
      refresh_delay !== undefined ? refresh_delay : client.refresh_delay,
      req.params.id
    );

    const updatedClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);

    res.json({
      ...updatedClient,
      status: botManager.getStatus(updatedClient.id)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete client
router.delete('/:id', (req, res) => {
  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Stop bot if running
    if (botManager.isRunning(client.id)) {
      botManager.stop(client.id);
    }

    db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);

    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start bot for client
router.post('/:id/start', (req, res) => {
  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    botManager.start(client);

    res.json({
      message: 'Bot started successfully',
      status: botManager.getStatus(client.id)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Stop bot for client
router.post('/:id/stop', (req, res) => {
  try {
    botManager.stop(parseInt(req.params.id));

    res.json({
      message: 'Bot stopped successfully',
      status: botManager.getStatus(parseInt(req.params.id))
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get logs for client
router.get('/:id/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const logs = db.prepare(`
      SELECT * FROM logs
      WHERE client_id = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(req.params.id, limit, offset);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
