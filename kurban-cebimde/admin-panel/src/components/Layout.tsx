import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Video,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ChevronRight,
  BarChart3,
  Activity,
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, description: 'Genel bakış ve istatistikler' },
  { name: 'Kullanıcılar', href: '/admin/users', icon: Users, description: 'Kullanıcı yönetimi' },
  { name: 'Bağışlar', href: '/admin/donations', icon: ShoppingCart, description: 'Kurban bağışları' },
  { name: 'Canlı Yayınlar', href: '/admin/streams', icon: Video, description: 'Canlı yayın yönetimi' },
  { name: 'Backend Durumu', href: '/admin/backend-status', icon: Activity, description: 'Backend monitörü ve sistem durumu' },
  { name: 'Raporlar', href: '/admin/reports', icon: BarChart3, description: 'Detaylı raporlar ve analizler' },
  { name: 'Ayarlar', href: '/admin/settings', icon: Settings, description: 'Sistem ayarları' },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Mobile sidebar */}
      <div style={{
        position: 'fixed',
        inset: '0',
        zIndex: 50,
        display: sidebarOpen ? 'block' : 'none'
      }} className="lg:hidden">
        <div 
          style={{
            position: 'fixed',
            inset: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }} 
          onClick={() => setSidebarOpen(false)} 
        />
        <div style={{
          position: 'fixed',
          top: '0',
          bottom: '0',
          left: '0',
          width: '18rem',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideInLeft 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            height: '5rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <LayoutDashboard style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: 'white'
                }}>Kurban Cebimde</h1>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0
                }}>Admin Panel</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              <X style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
            </button>
          </div>
          <nav style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            padding: '1rem 0.75rem'
          }}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    color: isActive ? '#1e40af' : '#64748b',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    border: isActive ? '1px solid #dbeafe' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => setSidebarOpen(false)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f8fafc'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.borderColor = 'transparent'
                    }
                  }}
                >
                  <item.icon style={{ 
                    marginRight: '0.75rem', 
                    height: '1.25rem', 
                    width: '1.25rem',
                    color: isActive ? '#1e40af' : '#64748b'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div>{item.name}</div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: isActive ? '#3b82f6' : '#94a3b8',
                      marginTop: '0.125rem'
                    }}>{item.description}</div>
                  </div>
                  {isActive && (
                    <ChevronRight style={{ 
                      height: '1rem', 
                      width: '1rem', 
                      color: '#1e40af' 
                    }} />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div style={{
        display: 'none',
        position: 'fixed',
        top: '0',
        bottom: '0',
        left: '0',
        width: '18rem',
        flexDirection: 'column'
      }} className="lg:flex">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: '1',
          backgroundColor: 'white',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '4px 0 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '5rem',
            padding: '0 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <LayoutDashboard style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: 'white'
                }}>Kurban Cebimde</h1>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0
                }}>Admin Panel</p>
              </div>
            </div>
          </div>
          <nav style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            padding: '1rem 0.75rem'
          }}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    color: isActive ? '#1e40af' : '#64748b',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    border: isActive ? '1px solid #dbeafe' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f8fafc'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.borderColor = 'transparent'
                    }
                  }}
                >
                  <item.icon style={{ 
                    marginRight: '0.75rem', 
                    height: '1.25rem', 
                    width: '1.25rem',
                    color: isActive ? '#1e40af' : '#64748b'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div>{item.name}</div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: isActive ? '#3b82f6' : '#94a3b8',
                      marginTop: '0.125rem'
                    }}>{item.description}</div>
                  </div>
                  {isActive && (
                    <ChevronRight style={{ 
                      height: '1rem', 
                      width: '1rem', 
                      color: '#1e40af' 
                    }} />
                  )}
                </Link>
              )
            })}
          </nav>
          
          {/* User section */}
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
              }}>
                <User style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#1e293b' 
                }}>
                  {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#64748b' 
                }}>
                  {user?.roles?.includes('admin') ? 'Sistem Yöneticisi' : 'Kullanıcı'}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#94a3b8',
                  marginTop: '0.25rem'
                }}>
                  {user?.phoneNumber || 'Telefon yok'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.875rem',
                color: '#dc2626',
                backgroundColor: 'white',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2'
                e.currentTarget.style.borderColor = '#fca5a5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.borderColor = '#fecaca'
              }}
            >
              <LogOut style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        marginLeft: '0',
        padding: '2rem'
      }} className="lg:ml-72">
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="lg:hidden"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc'
              e.currentTarget.style.borderColor = '#cbd5e1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
          >
            <Menu style={{ height: '1.25rem', width: '1.25rem', color: '#64748b' }} />
          </button>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0
            }}>Admin Panel</h2>
            <div style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              v1.0.0
            </div>
          </div>
        </div>

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
