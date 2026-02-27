import { useRef } from 'react';

function FileIcon({ fileType }) {
  if (fileType?.startsWith('image/')) return <span>🖼</span>;
  if (fileType?.startsWith('video/')) return <span>🎥</span>;
  if (fileType?.startsWith('audio/')) return <span>🎵</span>;
  if (fileType?.includes('pdf')) return <span>📄</span>;
  if (fileType?.includes('zip') || fileType?.includes('rar')) return <span>📦</span>;
  return <span>📎</span>;
}

function formatSize(bytes) {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function ReceivedItem({ item, onDownload, onRemove, onCopy }) {
  const isText = !item.file;
  return (
    <div className="dp-file-item">
      <div className="dp-file-icon-wrap">
        {isText ? <span>📝</span> : <FileIcon fileType={item.fileType} />}
      </div>
      <div className="dp-file-info">
        {isText ? (
          <div className="dp-file-message">{item.message}</div>
        ) : (
          <div className="dp-file-name">{item.fileName}</div>
        )}
        <div className="dp-file-meta">
          {item.receivedAt}
          {isText && <span className="dp-tag-text">TEXT</span>}
          {!isText && item.size > 0 && <span>{formatSize(item.size)}</span>}
        </div>
      </div>
      <div className="dp-file-actions">
        {isText ? (
          <button className="dp-btn-ghost" onClick={() => onCopy(item.message)}>Copy</button>
        ) : (
          <button className="dp-btn-ghost" onClick={() => onDownload(item)}>Download</button>
        )}
        <button className="dp-btn-ghost danger" onClick={() => onRemove(item.id)}>Remove</button>
      </div>
    </div>
  );
}

function SentItem({ item }) {
  const isText = !item.file;
  return (
    <div className="dp-file-item">
      <div className="dp-file-icon-wrap">
        {isText ? <span>💬</span> : <FileIcon fileType={item.fileType} />}
      </div>
      <div className="dp-file-info">
        {isText ? (
          <div className="dp-file-message">{item.message}</div>
        ) : (
          <div className="dp-file-name">{item.fileName}</div>
        )}
        <div className="dp-file-meta">
          {item.sentAt}
          {!isText && item.size > 0 && <span>{formatSize(item.size)}</span>}
        </div>
      </div>
    </div>
  );
}

export default function AfterConnect({
  receivedFiles, sentFiles,
  textMessage, setTextMessage,
  onSendText, onSendFile,
  onDownload, onRemove
}) {
  const fileInputRef = useRef(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onSendFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onSendFile(file);
      e.target.value = '';
    }
  };

  return (
    <main className="dp-after-main">
      <div className="dp-after-grid">
        {/* Left column */}
        <div className="dp-left-col">
          {/* Upload zone */}
          <div
            className="dp-upload-zone"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div className="dp-upload-icon">⬆</div>
            <div className="dp-upload-title">Drag &amp; Drop Files</div>
            <div className="dp-upload-sub">Or click to browse from computer</div>
            <div className="dp-upload-limit">MAX 2GB</div>
          </div>

          {/* Text message */}
          <div className="dp-message-box">
            <textarea
              className="dp-textarea"
              placeholder="Type a message..."
              value={textMessage}
              onChange={e => setTextMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onSendText())}
            />
            <button className="dp-btn-send" onClick={onSendText}>Send &gt;</button>
          </div>
        </div>

        {/* Middle column: Received */}
        <div className="dp-mid-col">
          <div className="dp-panel">
            <div className="dp-panel-header">
              <span className="dp-panel-icon blue">⬇</span>
              <span className="dp-panel-title">Received Content</span>
              <span className="dp-badge blue">{receivedFiles.length}</span>
            </div>
            <div className="dp-panel-body">
              {receivedFiles.length === 0 ? (
                <div className="dp-empty">No content received yet</div>
              ) : (
                receivedFiles.map(item => (
                  <ReceivedItem
                    key={item.id}
                    item={item}
                    onDownload={onDownload}
                    onRemove={onRemove}
                    onCopy={handleCopy}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Sent */}
        <div className="dp-right-col">
          <div className="dp-panel">
            <div className="dp-panel-header">
              <span className="dp-panel-icon green">⬆</span>
              <span className="dp-panel-title">Sent Content</span>
              <span className="dp-badge green">{sentFiles.length}</span>
            </div>
            <div className="dp-panel-body">
              {sentFiles.length === 0 ? (
                <div className="dp-empty">
                  <div className="dp-empty-icon">☁</div>
                  No files sent yet
                </div>
              ) : (
                sentFiles.map(item => (
                  <SentItem key={item.id} item={item} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
