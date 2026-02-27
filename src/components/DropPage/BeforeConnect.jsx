import { QRCodeSVG } from 'qrcode.react';

export default function BeforeConnect({
  myId, customId, setCustomId, onSetCustomId,
  targetId, setTargetId, onConnect
}) {
  return (
    <main className="dp-before-main">
      <div className="dp-before-hero">
        <h1 className="dp-hero-title">Ready to Connect?</h1>
        <p className="dp-hero-sub">
          Fast, secure local network file &amp; message transfer. Scan the code or use an ID below to start sharing instantly.
        </p>
      </div>

      <div className="dp-before-card">
        {/* Left: QR Code */}
        <div className="dp-qr-panel">
          <div className="dp-qr-label">SCAN TO CONNECT QUICK</div>
          <div className="dp-qr-box">
            {myId ? (
              <QRCodeSVG
                value={`${window.location.origin}/drop?peerId=${myId}`}
                size={200}
              />
            ) : (
              <div className="dp-qr-loading">Loading...</div>
            )}
            <div className="dp-qr-caption">CONNECTION</div>
          </div>
          <div className="dp-qr-note">
            <span>🖥</span>
            <span>Works on all local devices</span>
          </div>
        </div>

        {/* Divider */}
        <div className="dp-before-divider" />

        {/* Right: Inputs */}
        <div className="dp-connect-panel">
          <div className="dp-connect-card">
            <div className="dp-connect-card-title">
              <span className="dp-connect-icon green">👤</span>
              Set Custom Display ID
            </div>
            <div className="dp-connect-row">
              <input
                className="dp-input"
                placeholder="Enter custom ID (optional)"
                value={customId}
                onChange={e => setCustomId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSetCustomId()}
              />
              <button className="dp-btn-outline" onClick={onSetCustomId}>Set ID</button>
            </div>
          </div>

          <div className="dp-connect-card">
            <div className="dp-connect-card-title">
              <span className="dp-connect-icon blue">▶</span>
              Connect to Recipient
            </div>
            <div className="dp-connect-row">
              <input
                className="dp-input"
                placeholder="Enter recipient's ID..."
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onConnect()}
              />
              <button className="dp-btn-primary" onClick={onConnect}>Connect</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
