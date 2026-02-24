import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { QRCodeSVG } from 'qrcode.react';
import '../App.css';

export default function DropPage() {
  const [myId, setMyId] = useState(''); // 我的 ID
  const [targetId, setTargetId] = useState(''); // 对方的 ID
  const [conn, setConn] = useState(null); // 连接对象
  const [status, setStatus] = useState('初始化中...'); // 状态提示
  const [logs, setLogs] = useState([]); // 简单的日志记录
  const [customId, setCustomId] = useState(''); // 自定义ID输入
  const [receivedFiles, setReceivedFiles] = useState([]); // 接收到的文件列表
  const [sentFiles, setSentFiles] = useState([]); // 已发送的文件列表
  const [textMessage, setTextMessage] = useState(''); // 文本消息输入
  const [showSentFiles, setShowSentFiles] = useState(true); // 控制已发送文件折叠
  const [showReceivedFiles, setShowReceivedFiles] = useState(true); // 控制接收文件折叠
  const [isAutoConnecting, setIsAutoConnecting] = useState(false); // 自动连接loading状态

  const peerRef = useRef(null);
  const autoConnectAttempted = useRef(false); // 防止重复自动连接

  const addLog = (msg) => setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: msg }]);

  const downloadFile = (blob, fileName, fileType) => {
    const newBlob = new Blob([blob], { type: fileType });
    const url = URL.createObjectURL(newBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setupConnection = (connection) => {
    connection.on('data', (data) => {
      // 判断是文件还是文本消息
      if (data.type === 'text') {
        addLog(`收到消息: ${data.message}`);
        const messageData = {
          id: Date.now(),
          message: data.message,
          receivedAt: new Date().toLocaleTimeString()
        };
        setReceivedFiles(prev => [...prev, messageData]);
      } else {
        addLog(`收到文件: ${data.fileName}`);
        const fileData = {
          id: Date.now(),
          file: data.file,
          fileName: data.fileName,
          fileType: data.fileType,
          size: data.file.size || 0,
          receivedAt: new Date().toLocaleTimeString()
        };
        setReceivedFiles(prev => [...prev, fileData]);
      }
    });

    connection.on('close', () => {
      setStatus('已断开');
      setConn(null);
      addLog('连接已断开');
    });
  };

  // 下载指定文件
  const handleDownload = (fileData) => {
    downloadFile(fileData.file, fileData.fileName, fileData.fileType);
    addLog(`已下载: ${fileData.fileName}`);
  };

  // 移除文件
  const handleRemoveFile = (fileId) => {
    setReceivedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '未知大小';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 生成文件缩略图
  const getFileThumbnail = (fileData) => {
    if (!fileData.file) return null;

    if (fileData.fileType?.startsWith('image/')) {
      const url = URL.createObjectURL(new Blob([fileData.file], { type: fileData.fileType }));
      return <img src={url} alt={fileData.fileName} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }} />;
    }

    // 根据文件类型显示不同图标
    const getIcon = () => {
      if (fileData.fileType?.startsWith('video/')) return '🎥';
      if (fileData.fileType?.startsWith('audio/')) return '🎵';
      if (fileData.fileType?.includes('pdf')) return '📄';
      if (fileData.fileType?.includes('zip') || fileData.fileType?.includes('rar')) return '📦';
      return '📎';
    };

    return <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: '5px', fontSize: '30px' }}>{getIcon()}</div>;
  };

  // 初始化或重新创建 Peer
  const initializePeer = (customPeerId = null, autoConnectId = null) => {
    // 销毁旧的 peer
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    const peer = customPeerId ? new Peer(customPeerId) : new Peer();

    peer.on('open', (id) => {
      setMyId(id);
      addLog(`我的 ID 是: ${id}`);
      setStatus('在线，待连接');

      // 如果有自动连接的ID，在peer初始化完成后自动连接
      if (autoConnectId && !autoConnectAttempted.current) {
        autoConnectAttempted.current = true;
        addLog(`正在自动连接到: ${autoConnectId}`);
        setTimeout(() => {
          const connection = peer.connect(autoConnectId);
          setConn(connection);
          setStatus(`正在连接...`);

          connection.on('open', () => {
            setStatus(`已连接`);
            addLog(`成功连接到 ${autoConnectId}`);
            setupConnection(connection);
            setIsAutoConnecting(false); // 连接成功，关闭loading
          });

          connection.on('error', (err) => {
            addLog(`连接失败: ${err}`);
            setStatus('连接失败');
            setIsAutoConnecting(false); // 连接失败，关闭loading
          });
        }, 500); // 延迟500ms确保peer完全就绪
      }
    });

    peer.on('connection', (connection) => {
      setConn(connection);
      setStatus(`已连接`);
      addLog(`用户 ${connection.peer} 已连接你`);
      setupConnection(connection);
    });

    peer.on('error', (err) => {
      addLog(`错误: ${err.type}`);
      setStatus('连接错误');
    });

    peerRef.current = peer;
  };

  // 处理自定义ID
  const handleSetCustomId = () => {
    if (!customId.trim()) {
      addLog('请输入有效的ID');
      return;
    }
    addLog(`正在使用自定义ID: ${customId}`);
    initializePeer(customId);
  };

  useEffect(() => {
    // 检查URL参数，看是否有peerId
    const urlParams = new URLSearchParams(window.location.search);
    const peerIdFromUrl = urlParams.get('peerId');

    if (peerIdFromUrl) {
      setTargetId(peerIdFromUrl);
      addLog(`从URL获取到对方ID: ${peerIdFromUrl}`);
      setIsAutoConnecting(true); // 开启loading状态
      // 初始化peer并自动连接
      initializePeer(null, peerIdFromUrl);
    } else {
      // 没有peerId参数，正常初始化
      initializePeer();
    }

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const connectToPeer = () => {
    if (!targetId) return;
    const connection = peerRef.current.connect(targetId);
    setConn(connection);
    setStatus(`正在连接...`);

    connection.on('open', () => {
      setStatus(`已连接`);
      addLog(`成功连接到 ${targetId}`);
      setupConnection(connection);
    });
  };

  const sendFile = (event) => {
    const file = event.target.files[0];
    if (!file || !conn) return;

    addLog(`正在发送 ${file.name}...`);

    conn.send({
      file: file,
      fileName: file.name,
      fileType: file.type
    });

    // 添加到已发送列表
    const sentFileData = {
      id: Date.now(),
      file: file,
      fileName: file.name,
      fileType: file.type,
      size: file.size,
      sentAt: new Date().toLocaleTimeString()
    };
    setSentFiles(prev => [...prev, sentFileData]);
    event.target.value = ''; // 清空input
  };

  // 发送文本消息
  const sendTextMessage = () => {
    if (!textMessage.trim() || !conn) return;

    addLog(`发送消息: ${textMessage}`);

    conn.send({
      type: 'text',
      message: textMessage
    });

    // 添加到已发送列表
    const sentMessageData = {
      id: Date.now(),
      message: textMessage,
      sentAt: new Date().toLocaleTimeString()
    };
    setSentFiles(prev => [...prev, sentMessageData]);
    setTextMessage(''); // 清空输入框
  };

  return (
    <>
      {/* Loading 遮罩层 */}
      {isAutoConnecting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: 'white'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid rgba(255, 255, 255, 0.3)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', fontSize: '18px' }}>正在自动连接...</p>
          <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.8 }}>连接到: {targetId}</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <div className="app-container">
      <h1 className="title">AirDrop Web</h1>

      <div className="status-card">
        <div className="status-item">
          <span className="status-label">当前状态</span>
          <span className="status-value" style={{ color: status.includes('已连接') ? '#10b981' : 'inherit' }}>
            {status}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">我的 ID</span>
          <span className="status-value">{myId || '获取中...'}</span>
        </div>

        {/* 自定义ID输入 */}
        {!conn && (
          <div className="input-group" style={{ marginTop: '15px' }}>
            <input
              placeholder="输入自定义ID（可选）"
              value={customId}
              onChange={e => setCustomId(e.target.value)}
            />
            <button onClick={handleSetCustomId}>设置ID</button>
          </div>
        )}

        {myId && !conn && (
          <div className="qr-section">
            <span className="qr-label">扫描二维码连接</span>
            <QRCodeSVG
              value={`${window.location.origin}/drop?peerId=${myId}`}
              size={160}
            />
          </div>
        )}
      </div>

      {!conn ? (
        <div className="input-group">
          <input
            placeholder="输入对方的 ID"
            value={targetId}
            onChange={e => setTargetId(e.target.value)}
          />
          <button onClick={connectToPeer}>连接</button>
        </div>
      ) : (
        <>
          <div className="upload-zone">
            <h3>传输文件</h3>
            <p>点击选择文件发送</p>
            <input type="file" onChange={sendFile} title="" />
          </div>

          {/* 文本消息输入 */}
          <div className="input-group" style={{ marginTop: '15px' }}>
            <input
              placeholder="输入文本消息"
              value={textMessage}
              onChange={e => setTextMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendTextMessage()}
            />
            <button onClick={sendTextMessage}>发送</button>
          </div>
        </>
      )}

      {/* 已发送文件列表 */}
      {sentFiles.length > 0 && (
        <div className="file-section" style={{ marginTop: '20px' }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}
            onClick={() => setShowSentFiles(!showSentFiles)}
          >
            <h3 style={{ fontSize: '18px', margin: 0 }}>已发送 ({sentFiles.length})</h3>
            <span style={{ fontSize: '20px' }}>{showSentFiles ? '▼' : '▶'}</span>
          </div>
          {showSentFiles && (
            <div>
              {sentFiles.map(item => (
                <div key={item.id} style={{
                  padding: '12px',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  {item.file ? (
                    <>
                      {getFileThumbnail(item)}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.fileName}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {formatFileSize(item.size)} • {item.sentAt}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dbeafe', borderRadius: '5px', fontSize: '30px' }}>💬</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px' }}>{item.message}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{item.sentAt}</div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 接收到的文件列表 */}
      {receivedFiles.length > 0 && (
        <div className="file-section" style={{ marginTop: '20px' }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}
            onClick={() => setShowReceivedFiles(!showReceivedFiles)}
          >
            <h3 style={{ fontSize: '18px', margin: 0 }}>接收到的内容 ({receivedFiles.length})</h3>
            <span style={{ fontSize: '20px' }}>{showReceivedFiles ? '▼' : '▶'}</span>
          </div>
          {showReceivedFiles && (
            <div>
              {receivedFiles.map(item => (
                <div key={item.id} style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  {item.file ? (
                    <>
                      {getFileThumbnail(item)}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.fileName}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {formatFileSize(item.size)} • {item.receivedAt}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleDownload(item)}
                          style={{ padding: '6px 12px', cursor: 'pointer', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', fontSize: '13px' }}
                        >
                          下载
                        </button>
                        <button
                          onClick={() => handleRemoveFile(item.id)}
                          style={{ padding: '6px 12px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', fontSize: '13px' }}
                        >
                          移除
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dbeafe', borderRadius: '5px', fontSize: '30px' }}>💬</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px' }}>{item.message}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{item.receivedAt}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(item.id)}
                        style={{ padding: '6px 12px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', fontSize: '13px' }}
                      >
                        移除
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="logs-container" style={{ marginTop: '20px' }}>
        <div className="logs-header">运行日志</div>
        <div className="logs-box" style={{ height: '300px' }}>
          {logs.length === 0 && <div className="log-entry" style={{ color: '#64748b' }}>等待操作...</div>}
          {logs.slice().reverse().map((log, i) => (
            <div key={i} className="log-entry">
              <span className="log-time">{log.time}</span>
              <span className="log-text">{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

