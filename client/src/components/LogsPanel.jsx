import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { formatTimestamp } from '../utils/date';
import './LogsPanel.css';

function LogsPanel({ client, ws, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  // Load initial logs
  useEffect(() => {
    loadLogs();
  }, [client.id]);

  // Listen for new logs via WebSocket
  useEffect(() => {
    if (!ws) return;

    function handleMessage(event) {
      const message = JSON.parse(event.data);

      if (message.type === 'log' && message.clientId === client.id) {
        // Add new logs at the beginning (newest first)
        setLogs(prev => [message.data, ...prev]);
      }
    }

    ws.addEventListener('message', handleMessage);

    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws, client.id]);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await api.getLogs(client.id, 100);
      // Don't reverse - show newest first
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    if (!confirm('Clear all logs for this client?')) {
      return;
    }
    // Note: You'll need to add a clear logs endpoint to the API
    setLogs([]);
  }

  function getLogLevel(message) {
    const msg = message.toLowerCase();
    if (msg.includes('error') || msg.includes('failed')) return 'error';
    if (msg.includes('warning') || msg.includes('warn')) return 'warning';
    if (msg.includes('success') || msg.includes('booked')) return 'success';
    return 'info';
  }

  return (
    <div className="logs-panel">
      <div className="logs-header">
        <div>
          <h3>📋 Logs: {client.name}</h3>
          <p className="logs-subtitle">{client.email}</p>
        </div>
        <div className="logs-actions">
          <button
            className="btn-icon"
            onClick={loadLogs}
            title="Refresh logs"
          >
            🔄
          </button>
          <button
            className="btn-icon"
            onClick={handleClear}
            title="Clear logs"
          >
            🗑️
          </button>
          <button
            className="btn-close"
            onClick={onClose}
            title="Close panel"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="logs-content" ref={containerRef}>
        {loading ? (
          <div className="logs-loading">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="logs-empty">
            No logs yet. Start the bot to see activity.
          </div>
        ) : (
          <div className="logs-list">
            {logs.map((log, index) => (
              <div
                key={log.id || index}
                className={`log-entry log-${getLogLevel(log.message)}`}
              >
                <div className="log-timestamp">
                  {formatTimestamp(log.timestamp)}
                </div>
                <div className="log-message">{log.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LogsPanel;
