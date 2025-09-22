import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Eye, EyeOff, User, Shield, Package, TrendingUp, Users, FileText, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const { login, isLoading, error, clearError } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast.error('Email ve şifre gerekli')
      return
    }

    try {
      await login(username, password)
      toast.success('Admin girişi başarılı!')
    } catch (error) {
      console.error('Giriş hatası:', error)
      toast.error('Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.')
    }
  }

  const handleReset = () => {
    setUsername('')
    setPassword('')
    clearError()
  }

  const features = [
    {
      icon: Package,
      title: 'Kurban Yönetimi',
      description: 'Bağışları ve siparişleri kolayca yönetin'
    },
    {
      icon: Users,
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcı hesaplarını ve yetkilerini düzenleyin'
    },
    {
      icon: FileText,
      title: 'Sertifika Sistemi',
      description: 'Otomatik sertifika oluşturma ve yönetimi'
    },
    {
      icon: TrendingUp,
      title: 'Analitik Dashboard',
      description: 'Detaylı raporlar ve istatistikler'
    }
  ]

  return (
    <Layout>
      <div className="p-6 space-y-6">
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        animation: 'pulse 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-50%',
        left: '-20%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        animation: 'pulse 8s ease-in-out infinite reverse'
      }} />

      <div style={{
        maxWidth: '32rem',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Login Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              Admin Panel
            </h1>
            <p style={{ color: '#6b7280' }}>
              Kurban Cebimde Yönetim Paneli
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@kurbancebimde.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
                <User style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  width: '1.25rem',
                  height: '1.25rem'
                }} />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500'
              }}>
                Şifre
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
                <Shield style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  width: '1.25rem',
                  height: '1.25rem'
                }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>

            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}
          </form>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={handleReset}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline'
              }}
            >
              Formu Temizle
            </button>
          </div>
        </div>

        {/* Logo and header */}
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            margin: '0 auto',
            height: '5rem',
            width: '5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '1.5rem'
          }}>
            <Package style={{ height: '3rem', width: '3rem', color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '1rem',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
          }}>
            Kurban Cebimde
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '2rem',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            Admin Yönetim Paneli
          </p>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}
            >
              <feature.icon style={{
                height: '2.5rem',
                width: '2.5rem',
                color: 'white',
                margin: '0 auto 1rem',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }} />
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.5'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
        `}</style>
      </div>
    </Layout>
  )
}
