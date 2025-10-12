import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutGrid, Users, HeartHandshake, Video, BarChart3, Settings, ShieldCheck, Menu, Search, Sun, Moon } from 'lucide-react'

function clsx(...c: (string | false | null | undefined)[]) { return c.filter(Boolean).join(' ') }

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark'|'light'>('dark')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const saved = (localStorage.getItem('admin-theme') as 'dark'|'light'|null) ?? 'dark'
    setTheme(saved)
    const root = document.documentElement
    const body = document.body
    if (saved === 'dark') { root.classList.add('dark'); body.classList.add('dark'); body.setAttribute('data-bs-theme','dark') }
    else { root.classList.remove('dark'); body.classList.remove('dark'); body.setAttribute('data-bs-theme','light') }
  }, [])

  const toggleTheme = () => {
    const t = theme === 'dark' ? 'light' : 'dark'
    setTheme(t)
    localStorage.setItem('admin-theme', t)
    const root = document.documentElement
    const body = document.body
    if (t === 'dark') { root.classList.add('dark'); body.classList.add('dark'); body.setAttribute('data-bs-theme','dark') }
    else { root.classList.remove('dark'); body.classList.remove('dark'); body.setAttribute('data-bs-theme','light') }
  }

  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} />, url: '/dashboard' },
    { key: 'users', label: 'Kullanıcılar', icon: <Users size={18} />, url: '/users' },
    { key: 'donations', label: 'Bağışlar', icon: <HeartHandshake size={18} />, url: '/donations' },
    { key: 'streams', label: 'Canlı Yayın', icon: <Video size={18} />, url: '/streams' },
    { key: 'reports', label: 'Raporlar', icon: <BarChart3 size={18} />, url: '/reports' },
    { key: 'settings', label: 'Ayarlar', icon: <Settings size={18} />, url: '/settings' },
  ]

  const isActive = (url: string) => location.pathname === url

  return (
    <div className="wrapper" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside className={clsx('app-sidebar', sidebarCollapsed && 'condensed')} style={{ position:'sticky', top:0, height:'100vh', zIndex:1030 }}>
        <div className="px-3 border-bottom d-flex align-items-center justify-content-center" style={{ height: 60 }}>
          <div className={clsx('logo-wrap', sidebarCollapsed && 'collapsed')}>
            <img
              src={new URL('../../../kurban-cebimde/frontend/assets/kurbancebimdelogo1.png', import.meta.url).toString()}
              alt="Logo"
              className="logo-img"
            />
            <img
              src={new URL('../../../kurban-cebimde/frontend/assets/kurbancebimdelogo.png', import.meta.url).toString()}
              alt="Logo Small"
              className="logo-img-small"
            />
          </div>
        </div>
        <nav className="px-2 py-3">
          {items.map(it => (
            <button key={it.key} onClick={() => navigate(it.url)}
              className={clsx('w-100 d-flex align-items-center gap-2 rounded-3 px-3 py-2 text-decoration-none border-0 bg-transparent',
                isActive(it.url) ? (theme==='dark' ? 'bg-primary text-white' : 'bg-indigo-50 text-indigo-900') : (theme==='dark' ? 'text-light' : 'text-dark'))}>
              <span className="d-inline-flex align-items-center justify-content-center sidebar-icon" style={{ width: 36, height: 36, background: isActive(it.url) ? (theme==='dark' ? 'rgba(255,255,255,.1)' : '#e0e7ff') : (theme==='dark' ? '#1f2937' : '#eef2ff') }}>{it.icon}</span>
              {!sidebarCollapsed && <span className="text-truncate">{it.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0" style={{ width: '100%', height:'100vh', overflow:'auto' }}>
        <header className="app-topbar border-bottom" style={{ position:'sticky', top:0, zIndex:1005 }}>
          <div className="container-fluid">
            <div className="d-flex align-items-center justify-content-between" style={{ height: 60 }}>
              <div className="d-flex align-items-center gap-2">
                <button onClick={() => setSidebarCollapsed(s=>!s)} className="btn btn-light btn-sm" aria-label="toggle sidebar">
                  <Menu size={18} />
                </button>
                <div className="position-relative d-none d-md-block top-search">
                  <input type="search" className="form-control ps-5" placeholder="Ara..." />
                  <span className="top-search-icon position-absolute top-50 start-0 translate-middle-y ps-2"><Search size={16} /></span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button onClick={toggleTheme} className="btn btn-light btn-sm" aria-label="toggle theme">
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="page-content">
          <div className="container-fluid py-3">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout


