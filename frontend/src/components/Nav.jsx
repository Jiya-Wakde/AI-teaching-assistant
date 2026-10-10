import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const { pathname } = useLocation()
  return (
    <nav className="nav">
      <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" rx="2" fill="var(--accent)" opacity=".9"/>
          <rect x="13" y="3" width="8" height="8" rx="2" fill="var(--violet)" opacity=".9"/>
          <rect x="3" y="13" width="8" height="8" rx="2" fill="var(--violet)" opacity=".6"/>
          <rect x="13" y="13" width="8" height="8" rx="2" fill="var(--accent)" opacity=".5"/>
        </svg>
        AI Coding <span>Mentor</span>
      </Link>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {pathname !== '/' && (
          <Link to="/" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '13px' }}>
            ← Home
          </Link>
        )}
        {pathname === '/' && (
          <Link to="/workspace" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '13px' }}>
            Open Workspace
          </Link>
        )}
      </div>
    </nav>
  )
}
