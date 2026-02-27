import { Link } from 'react-router-dom';
import './HomePage.css';

const TOOLS = [
  {
    id: 'drop',
    name: '隔空投送',
    desc: '基于 WebRTC 的 P2P 文件传输，无需服务器，安全快速。',
    path: '/drop',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
    status: 'Online'
  },
  {
    id: 'image',
    name: '图片处理',
    desc: '纯浏览器端图片压缩、格式转换，保护隐私不上传。',
    path: '#',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    ),
    status: 'Coming Soon'
  },
  {
    id: 'json',
    name: 'JSON 格式化',
    desc: '快速格式化、验证及转换 JSON 数据。',
    path: '#',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    ),
    status: 'Coming Soon'
  }
];

export default function HomePage() {
  return (
    <div className="home-container">
      <div className="bg-pattern"></div>
      
      <header className="home-header">
        <h1 className="home-title">Hooji Toolbox</h1>
        <p className="home-subtitle">
          一个清新、高效、安全的 Web 原生工具集。所有操作均在本地完成，确保您的数据隐私。
        </p>
      </header>

      <main className="tool-grid">
        {TOOLS.map(tool => (
          <Link 
            key={tool.id} 
            to={tool.path} 
            className={`tool-card ${tool.status === 'Coming Soon' ? 'coming-soon' : ''}`}
            onClick={(e) => tool.status === 'Coming Soon' && e.preventDefault()}
          >
            <div className="tool-badge">{tool.status}</div>
            <div className="tool-icon">
              {tool.icon}
            </div>
            <h2 className="tool-name">{tool.name}</h2>
            <p className="tool-desc">{tool.desc}</p>
            
            {tool.status !== 'Coming Soon' && (
              <div className="launch-btn">
                立即使用
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            )}
          </Link>
        ))}
      </main>

      <footer style={{ marginTop: 'auto', paddingTop: '60px', color: '#94a3b8', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} Hooji Toolbox • Built with Passion
      </footer>
    </div>
  );
}
