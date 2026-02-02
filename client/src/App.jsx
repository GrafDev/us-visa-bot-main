import { useState, useEffect } from 'react';
import ClientsTable from './components/ClientsTable';
import EditModal from './components/EditModal';
import LogsPanel from './components/LogsPanel';
import StatusBar from './components/StatusBar';
import LoadingScreen from './components/LoadingScreen';
import { api } from './services/api';
import './App.css';

function App() {
  const [clients, setClients] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [ws, setWs] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  // Setup WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:3001`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'initial_status') {
        setStatuses(message.data);
      } else if (message.type === 'status') {
        setStatuses(prev => ({
          ...prev,
          [message.clientId]: message.data
        }));
      } else if (message.type === 'log') {
        // Log messages are handled by LogsPanel component
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  async function loadClients() {
    try {
      const data = await api.getClients();
      setClients(data);

      // Extract statuses
      const newStatuses = {};
      data.forEach(client => {
        if (client.status) {
          newStatuses[client.id] = client.status;
        }
      });
      setStatuses(newStatuses);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleStart(clientId) {
    try {
      await api.startBot(clientId);
      setError(null);
    } catch (err) {
      const errorMsg = `Failed to start bot: ${err.message}`;
      setError(errorMsg);
      alert(errorMsg);
    }
  }

  async function handleStop(clientId) {
    try {
      await api.stopBot(clientId);
      setError(null);
    } catch (err) {
      const errorMsg = `Failed to stop bot: ${err.message}`;
      setError(errorMsg);
      alert(errorMsg);
    }
  }

  async function handleEdit(client) {
    setEditingClient(client);
  }

  async function handleDelete(clientId) {
    if (!confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      await api.deleteClient(clientId);
      await loadClients();
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
      setError(null);
    } catch (err) {
      const errorMsg = `Failed to delete client: ${err.message}`;
      setError(errorMsg);
      alert(errorMsg);
    }
  }

  async function handleSave(data) {
    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, data);
      } else {
        await api.createClient(data);
      }
      await loadClients();
      setEditingClient(null);
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      const errorMsg = `Failed to save client: ${err.message}`;
      setError(errorMsg);
      alert(errorMsg);
      throw err;
    }
  }

  function handleSelectClient(client) {
    setSelectedClient(client);
  }

  function handleExportDb() {
    alert('Database export functionality\n\nThe database file is located at:\nserver/db/clients.db\n\nCopy this file to backup your data.');
  }

  function handleImportDb() {
    alert('Database import functionality\n\nTo restore from backup:\n1. Stop all running bots\n2. Close the application\n3. Replace server/db/clients.db with your backup file\n4. Restart the application');
  }

  const runningCount = Object.values(statuses).filter(s => s.running).length;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 US Visa Bot Manager</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Add Client
        </button>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className={`app-content ${selectedClient ? 'has-logs' : ''}`}>
        <div className="table-container">
          <ClientsTable
            clients={clients}
            statuses={statuses}
            onStart={handleStart}
            onStop={handleStop}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelectClient={handleSelectClient}
            selectedClientId={selectedClient?.id}
          />
        </div>

        {selectedClient && (
          <div className="logs-container">
            <LogsPanel
              client={selectedClient}
              ws={ws}
              onClose={() => setSelectedClient(null)}
            />
          </div>
        )}
      </div>

      {(editingClient || showAddModal) && (
        <EditModal
          client={editingClient}
          onSave={handleSave}
          onClose={() => {
            setEditingClient(null);
            setShowAddModal(false);
          }}
        />
      )}

      <StatusBar
        ws={ws}
        clientsCount={clients.length}
        runningCount={runningCount}
        onExportDb={handleExportDb}
        onImportDb={handleImportDb}
      />
    </div>
  );
}

export default App;
