import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px', fontWeight: 'bold' }}>
        AirDrop Web
      </h1>
      <p style={{ fontSize: '20px', marginBottom: '40px', textAlign: 'center', maxWidth: '600px' }}>
        基于 WebRTC 的 P2P 文件传输工具，无需服务器中转，直接点对点传输文件和消息
      </p>
      <Link
        to="/drop"
        style={{
          padding: '15px 40px',
          fontSize: '18px',
          background: 'white',
          color: '#667eea',
          textDecoration: 'none',
          borderRadius: '10px',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s'
        }}
        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.target.style.transform = 'scale(1)'}
      >
        开始传输
      </Link>
      <div style={{ marginTop: '60px', textAlign: 'center', opacity: 0.9 }}>
        <h3 style={{ marginBottom: '15px' }}>特性</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>✨ P2P 直连，无需服务器中转</li>
          <li style={{ marginBottom: '10px' }}>🔒 端到端加密，安全可靠</li>
          <li style={{ marginBottom: '10px' }}>📱 扫码连接，快速便捷</li>
          <li style={{ marginBottom: '10px' }}>💬 支持文件和文本消息</li>
        </ul>
      </div>
    </div>
  );
}
