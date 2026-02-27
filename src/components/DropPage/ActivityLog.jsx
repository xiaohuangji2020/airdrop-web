export default function ActivityLog({ logs }) {
  return (
    <div className="dp-log-section">
      <div className="dp-log-header">
        <span>🕐</span>
        <span>Activity Log</span>
      </div>
      <div className="dp-log-body">
        {logs.length === 0 ? (
          <div className="dp-log-row muted">Service initialized. Waiting for connection...</div>
        ) : (
          logs.slice().reverse().map((log, i) => (
            <div key={i} className={`dp-log-row ${log.highlight || ''}`}>
              <span className="dp-log-time">{log.time}</span>
              <span className={`dp-log-text ${log.color || ''}`}>{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
