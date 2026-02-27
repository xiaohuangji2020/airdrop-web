export default function Navbar({ myId, connected, onDisconnect }) {
  return (
    <nav className="dp-navbar">
      <div className="dp-navbar-left">
        <div className="dp-logo">
          <span className="dp-logo-icon">✈</span>
          <div>
            <div className="dp-logo-title">AirDrop Web</div>
            <div className="dp-logo-sub">LOCAL TRANSFER</div>
          </div>
        </div>
        {connected && myId && (
          <div className="dp-navbar-id">
            <span className="dp-navbar-id-label">MY ID</span>
            <span className="dp-navbar-id-value">{myId}</span>
          </div>
        )}
      </div>
      <div className="dp-navbar-right">
        {!connected && myId && (
          <div className="dp-navbar-autoid">
            <span className="dp-navbar-autoid-label">AUTO-GENERATED ID</span>
            <span className="dp-navbar-autoid-value">{myId}</span>
          </div>
        )}
        <div className={`dp-status-badge ${connected ? 'connected' : ''}`}>
          <span className="dp-status-dot" />
          {connected ? 'Connected' : 'Waiting for connection'}
        </div>
        {connected && (
          <button className="dp-disconnect-btn" onClick={onDisconnect} title="Disconnect">
            ⎋
          </button>
        )}
      </div>
    </nav>
  );
}
