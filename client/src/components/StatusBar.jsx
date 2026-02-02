import { useState, useEffect } from 'react';
import './StatusBar.css';

function StatusBar({ ws, clientsCount, runningCount, onExportDb, onImportDb }) {
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    if (!ws) {
      setWsConnected(false);
      return;
    }

    const checkConnection = () => {
      setWsConnected(ws.readyState === WebSocket.OPEN);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, [ws]);

  return (
    <div className="status-bar">
      <div className="status-left">
        <div className={`status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {wsConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="status-stats">
          <span>Total Clients: {clientsCount}</span>
          <span className="separator">•</span>
          <span className={runningCount > 0 ? 'running-bots' : ''}>
            Running: {runningCount}
          </span>
        </div>
      </div>

      <div className="status-right">
        <button
          className="btn-status"
          onClick={onExportDb}
          title="Export database backup"
        >
          💾 Export DB
        </button>
        <button
          className="btn-status"
          onClick={onImportDb}
          title="Import database backup"
        >
          📂 Import DB
        </button>
      </div>
    </div>
  );
}

export default StatusBar;
