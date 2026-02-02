import { formatDistanceToNow } from '../utils/date';
import './ClientsTable.css';

function ClientsTable({
  clients,
  statuses,
  onStart,
  onStop,
  onEdit,
  onDelete,
  onSelectClient,
  selectedClientId
}) {
  function getLastLog(clientId) {
    const status = statuses[clientId];
    if (!status?.lastLog) return null;
    return status.lastLog;
  }

  function isRunning(clientId) {
    const status = statuses[clientId];
    return status?.running || false;
  }

  function handleToggle(clientId) {
    if (isRunning(clientId)) {
      onStop(clientId);
    } else {
      onStart(clientId);
    }
  }

  return (
    <div className="clients-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Current Date</th>
            <th>Target Date</th>
            <th>Min Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty-state">
                No clients yet. Click "Add Client" to get started.
              </td>
            </tr>
          ) : (
            clients.map((client) => {
              const running = isRunning(client.id);
              const lastLog = getLastLog(client.id);
              const isSelected = client.id === selectedClientId;

              return (
                <tr
                  key={client.id}
                  className={isSelected ? 'selected' : ''}
                >
                  <td>{client.name}</td>
                  <td>{client.current_date}</td>
                  <td>{client.target_date || '-'}</td>
                  <td>{client.min_date || '-'}</td>
                  <td className="actions-cell">
                    <button
                      className={`btn-toggle ${running ? 'running' : 'stopped'}`}
                      onClick={() => handleToggle(client.id)}
                    >
                      {running ? '⏹ STOP' : '▶ START'}
                    </button>
                    <button
                      className="btn-toggle logs-btn"
                      onClick={() => onSelectClient(client)}
                    >
                      LOGS
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => onEdit(client)}
                      disabled={running}
                      title={running ? 'Stop the bot before editing' : 'Edit client'}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => onDelete(client.id)}
                      disabled={running}
                      title={running ? 'Stop the bot before deleting' : 'Delete client'}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ClientsTable;
