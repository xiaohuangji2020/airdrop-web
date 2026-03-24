import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import Navbar from '../components/DropPage/Navbar';
import Footer from '../components/DropPage/Footer';
import BeforeConnect from '../components/DropPage/BeforeConnect';
import AfterConnect from '../components/DropPage/AfterConnect';
import ActivityLog from '../components/DropPage/ActivityLog';
import './DropPage.css';

export default function DropPage() {
  const [myId, setMyId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [conn, setConn] = useState(null);
  const [logs, setLogs] = useState([]);
  const [customId, setCustomId] = useState('');
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [textMessage, setTextMessage] = useState('');
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const autoConnectAttempted = useRef(false);

  const addLog = (msg, color = '') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: msg, color }]);
  };

  const setupConnection = (connection) => {
    connRef.current = connection;
    setConn(connection);
    connection.on('data', (data) => {
      if (data.type === 'text') {
        addLog(`Received message from ${connection.peer.slice(0, 8)}...`, 'log-blue');
        setReceivedFiles(prev => [...prev, {
          id: Date.now(), message: data.message,
          receivedAt: new Date().toLocaleTimeString()
        }]);
      } else {
        addLog(`Received file: ${data.fileName}`, 'log-blue');
        setReceivedFiles(prev => [...prev, {
          id: Date.now(), file: data.file,
          fileName: data.fileName, fileType: data.fileType,
          size: data.file?.size || 0,
          receivedAt: new Date().toLocaleTimeString()
        }]);
      }
    });
    connection.on('close', () => {
      connRef.current = null;
      setConn(null);
      addLog('Connection closed.');
    });
  };

  const initializePeer = (customPeerId = null, autoConnectId = null) => {
    if (peerRef.current) peerRef.current.destroy();
    const peerConfig = {
      config: {
        iceServers: [
          { urls: 'stun:stun.miwifi.com' },
          { urls: 'stun:stun.qq.com' },
          { urls: 'stun:stun.cloudflare.com:3478' },
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      },
    };
    const peer = customPeerId ? new Peer(customPeerId, peerConfig) : new Peer(peerConfig);

    peer.on('open', (id) => {
      setMyId(id);
      addLog(`My ID is: ${id}`, 'log-blue');
      addLog('Service initialized. Searching for peers...');

      if (autoConnectId && !autoConnectAttempted.current) {
        autoConnectAttempted.current = true;
        addLog(`Auto-connecting to: ${autoConnectId}`);
        setTimeout(() => {
          const connection = peer.connect(autoConnectId);
          connection.on('open', () => {
            addLog(`Connected to ${autoConnectId}`, 'log-green');
            setupConnection(connection);
            setIsAutoConnecting(false);
            const url = new URL(window.location.href);
            url.searchParams.delete('peerId');
            window.history.replaceState({}, '', url.toString());
          });
          connection.on('error', () => {
            addLog('Connection failed.', 'log-red');
            setIsAutoConnecting(false);
          });
        }, 500);
      }
    });

    peer.on('connection', (connection) => {
      addLog(`User ${connection.peer.slice(0, 16)}... connected to you`, 'log-green');
      setupConnection(connection);
    });

    peer.on('error', (err) => addLog(`Error: ${err.type}`, 'log-red'));
    peerRef.current = peer;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const peerIdFromUrl = urlParams.get('peerId');
    if (peerIdFromUrl) {
      setTargetId(peerIdFromUrl);
      setIsAutoConnecting(true);
      initializePeer(null, peerIdFromUrl);
    } else {
      initializePeer();
    }
    return () => peerRef.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetCustomId = () => {
    if (!customId.trim()) return;
    addLog(`Using custom ID: ${customId}`);
    initializePeer(customId);
  };

  const connectToPeer = () => {
    if (!targetId || !peerRef.current) return;
    const connection = peerRef.current.connect(targetId);
    addLog(`Connecting to ${targetId}...`);
    connection.on('open', () => {
      addLog(`Connected to ${targetId}`, 'log-green');
      setupConnection(connection);
    });
  };

  const handleSendFile = (file) => {
    if (!file || !connRef.current) return;
    addLog(`Sending ${file.name}...`);
    connRef.current.send({ file, fileName: file.name, fileType: file.type });
    setSentFiles(prev => [...prev, {
      id: Date.now(), file, fileName: file.name,
      fileType: file.type, size: file.size,
      sentAt: new Date().toLocaleTimeString()
    }]);
  };

  const handleSendText = () => {
    if (!textMessage.trim() || !connRef.current) return;
    addLog(`Sending message: ${textMessage}`);
    connRef.current.send({ type: 'text', message: textMessage });
    setSentFiles(prev => [...prev, {
      id: Date.now(), message: textMessage,
      sentAt: new Date().toLocaleTimeString()
    }]);
    setTextMessage('');
  };

  const handleDownload = (fileData) => {
    const blob = new Blob([fileData.file], { type: fileData.fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileData.fileName; a.click();
    URL.revokeObjectURL(url);
    addLog(`Downloaded: ${fileData.fileName}`);
  };

  const handleRemove = (id) => setReceivedFiles(prev => prev.filter(f => f.id !== id));

  const handleDisconnect = () => {
    connRef.current?.close();
    connRef.current = null;
    setConn(null);
    addLog('Disconnected.');
  };

  return (
    <div className="dp-page">
      {isAutoConnecting && (
        <div className="dp-overlay">
          <div className="dp-spinner" />
          <p>Auto-connecting...</p>
          <p className="dp-overlay-sub">Connecting to: {targetId}</p>
        </div>
      )}

      <Navbar myId={myId} connected={!!conn} onDisconnect={handleDisconnect} />

      {!conn ? (
        <div className="dp-content-wrapper">
          <BeforeConnect
            myId={myId}
            customId={customId} setCustomId={setCustomId} onSetCustomId={handleSetCustomId}
            targetId={targetId} setTargetId={setTargetId} onConnect={connectToPeer}
          />
          <div className="dp-log-wrapper">
            <ActivityLog logs={logs} />
          </div>
        </div>
      ) : (
        <>
          <AfterConnect
            receivedFiles={receivedFiles} sentFiles={sentFiles}
            textMessage={textMessage} setTextMessage={setTextMessage}
            onSendText={handleSendText} onSendFile={handleSendFile}
            onDownload={handleDownload} onRemove={handleRemove}
          />
          <div className="dp-log-wrapper">
            <ActivityLog logs={logs} />
          </div>
        </>
      )}

      <Footer connected={!!conn} />
    </div>
  );
}
