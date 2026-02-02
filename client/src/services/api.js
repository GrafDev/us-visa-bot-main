const API_BASE = '/api';

export const api = {
  // Clients
  async getClients() {
    const res = await fetch(`${API_BASE}/clients`);
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  },

  async getClient(id) {
    const res = await fetch(`${API_BASE}/clients/${id}`);
    if (!res.ok) throw new Error('Failed to fetch client');
    return res.json();
  },

  async createClient(data) {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create client');
    }
    return res.json();
  },

  async updateClient(id, data) {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update client');
    }
    return res.json();
  },

  async deleteClient(id) {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete client');
    return res.json();
  },

  // Bot control
  async startBot(id) {
    const res = await fetch(`${API_BASE}/clients/${id}/start`, {
      method: 'POST',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to start bot');
    }
    return res.json();
  },

  async stopBot(id) {
    const res = await fetch(`${API_BASE}/clients/${id}/stop`, {
      method: 'POST',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to stop bot');
    }
    return res.json();
  },

  // Logs
  async getLogs(id, limit = 100, offset = 0) {
    const res = await fetch(`${API_BASE}/clients/${id}/logs?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },
};
