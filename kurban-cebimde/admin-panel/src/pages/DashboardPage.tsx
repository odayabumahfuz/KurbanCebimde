import { useQuery } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import {
  Users,
  ShoppingCart,
  Video,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface AnalyticsData {
  total_users: number
  total_orders: number
  total_revenue: number
  active_streams: number
  completed_certificates: number
  daily_stats: Array<{
    date: string
    orders: number
    revenue: number
  }>
  top_regions: Array<{
    name: string
    order_count: number
    total_shares: number
  }>
}

// Gerçek API'den veri çek
const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.request('/analytics'),
    staleTime: 5 * 60 * 1000, // 5 dakika
  })
}

const recentActivities = [
  {
    id: 1,
    type: 'order',
    title: 'Yeni kurban bağışı',
    description: 'Ahmet Yılmaz tarafından 850₺ değerinde bağış yapıldı',
    time: '2 dakika önce',
    status: 'success',
    icon: ShoppingCart
  },
  {
    id: 2,
    type: 'user',
    title: 'Yeni kullanıcı kaydı',
    description: 'Fatma Demir sisteme kayıt oldu',
    time: '15 dakika önce',
    status: 'info',
    icon: Users
  },
  {
    id: 3,
    type: 'stream',
    title: 'Canlı yayın başladı',
    description: 'Kurban kesimi canlı yayını başlatıldı',
    time: '1 saat önce',
    status: 'warning',
    icon: Video
  },
  {
    id: 4,
    type: 'certificate',
    title: 'Sertifika oluşturuldu',
    description: 'Mehmet Kaya için sertifika oluşturuldu',
    time: '2 saat önce',
    status: 'success',
    icon: FileText
  }
]

export default function DashboardPage() {
  const { user } = useAuthStore()

  // Gerçek API'den veri çek
  const { data: analytics, isLoading, error } = useAnalytics()
  
  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <div style={{ width: '3rem', height: '3rem', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#6b7280' }}>Veriler yükleniyor...</p>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <AlertCircle style={{ width: '3rem', height: '3rem', color: '#ef4444' }} />
        <p style={{ color: '#ef4444' }}>Veri yüklenirken hata oluştu</p>
      </div>
    )
  }
  
  // API'den gelen veriyi kullan, yoksa varsayılan değerler
  const data: AnalyticsData = (analytics as AnalyticsData) || {
    total_users: 0,
    total_orders: 0,
    total_revenue: 0,
    active_streams: 0,
    completed_certificates: 0,
    daily_stats: [],
    top_regions: []
  }

  const stats = [
    {
      name: 'Toplam Kullanıcı',
      value: data.total_users.toLocaleString(),
      icon: Users,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      change: '+12%',
      changeType: 'positive',
      description: 'Kayıtlı kullanıcı sayısı'
    },
    {
      name: 'Toplam Bağış',
      value: data.total_orders.toLocaleString(),
      icon: ShoppingCart,
      color: '#10b981',
      bgColor: '#f0fdf4',
      change: '+8%',
      changeType: 'positive',
      description: 'Tamamlanan bağış sayısı'
    },
    {
      name: 'Toplam Gelir',
      value: `₺${data.total_revenue.toLocaleString()}`,
      icon: DollarSign,
      color: '#8b5cf6',
      bgColor: '#faf5ff',
      change: '+15%',
      changeType: 'positive',
      description: 'Toplam bağış tutarı'
    },
    {
      name: 'Aktif Yayınlar',
      value: data.active_streams,
      icon: Video,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      change: '+3',
      changeType: 'positive',
      description: 'Şu anda yayında'
    },
    {
      name: 'Sertifikalar',
      value: data.completed_certificates.toLocaleString(),
      icon: FileText,
      color: '#6366f1',
      bgColor: '#f0f9ff',
      change: '+5',
      changeType: 'positive',
      description: 'Oluşturulan sertifika'
    },
    {
      name: 'Günlük Ortalama',
      value: Math.round(data.total_orders / 7),
      icon: Activity,
      color: '#ec4899',
      bgColor: '#fdf2f8',
      change: '+2',
      changeType: 'positive',
      description: 'Günlük bağış ortalaması'
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981'
      case 'warning': return '#f59e0b'
      case 'info': return '#3b82f6'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'success': return '#f0fdf4'
      case 'warning': return '#fffbeb'
      case 'info': return '#eff6ff'
      case 'error': return '#fef2f2'
      default: return '#f8fafc'
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '1rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: '800',
            color: 'white',
            margin: 0,
            marginBottom: '0.5rem'
          }}>Hoş Geldiniz! 👋</h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            fontSize: '1.125rem'
          }}>
            Kurban Cebimde operasyonunun genel durumu ve istatistikleri
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              backdropFilter: 'blur(10px)'
            }}>
              <Calendar style={{ height: '1rem', width: '1rem' }} />
              <span style={{ fontSize: '0.875rem' }}>
                {format(new Date(), 'EEEE, d MMMM yyyy', { locale: tr })}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              backdropFilter: 'blur(10px)'
            }}>
              <Clock style={{ height: '1rem', width: '1rem' }} />
              <span style={{ fontSize: '0.875rem' }}>
                {format(new Date(), 'HH:mm')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '3rem',
          height: '3rem'
        }}>
          <User style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            {user?.firstName} {user?.lastName}
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            <span>📱 {user?.phoneNumber}</span>
            <span>📧 {user?.email}</span>
            <span style={{
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {user?.roles?.includes('admin') ? 'Sistem Yöneticisi' : 'Kullanıcı'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {stats.map((stat) => (
          <div key={stat.name} style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: `linear-gradient(135deg, ${stat.color}20 0%, transparent 70%)`,
              borderRadius: '50%',
              transform: 'translate(30px, -30px)'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  {stat.name}
                </p>
                <p style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '0.25rem'
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  {stat.description}
                </p>
              </div>
              <div style={{
                backgroundColor: stat.bgColor,
                borderRadius: '1rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${stat.color}30`
              }}>
                <stat.icon style={{ height: '1.5rem', width: '1.5rem', color: stat.color }} />
              </div>
            </div>
            <div style={{ 
              marginTop: '1rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: stat.bgColor,
              borderRadius: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <TrendingUp style={{ height: '0.875rem', width: '0.875rem', color: stat.color }} />
              <span style={{
                fontSize: '0.75rem',
                color: stat.color,
                fontWeight: '600'
              }}>
                {stat.change} geçen aya göre
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem'
      }}>
        {/* Recent activity */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0
            }}>
              Son Aktiviteler
            </h3>
            <button style={{
              backgroundColor: '#f8fafc',
              color: '#64748b',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9'
              e.currentTarget.style.borderColor = '#cbd5e1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
            >
              Tümünü Gör
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivities.map((activity) => (
              <div key={activity.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: getStatusBgColor(activity.status),
                borderRadius: '0.75rem',
                border: `1px solid ${getStatusColor(activity.status)}20`
              }}>
                <div style={{
                  backgroundColor: getStatusColor(activity.status),
                  borderRadius: '50%',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <activity.icon style={{ height: '1rem', width: '1rem', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    {activity.title}
                  </h4>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    margin: 0,
                    marginBottom: '0.5rem'
                  }}>
                    {activity.description}
                  </p>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    fontWeight: '500'
                  }}>
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top regions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0,
            marginBottom: '1.5rem'
          }}>
            En Aktif Bölgeler
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.top_regions.map((region, index) => (
              <div key={region.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                backgroundColor: index === 0 ? '#fef3c2' : '#f8fafc',
                borderRadius: '0.5rem',
                border: index === 0 ? '1px solid #fcd34d' : '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    backgroundColor: index === 0 ? '#f59e0b' : '#64748b',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {region.name}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b'
                    }}>
                      {region.order_count} bağış
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: index === 0 ? '#92400e' : '#64748b'
                }}>
                  {region.total_shares}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#1e293b',
          margin: 0,
          marginBottom: '1.5rem'
        }}>
          Hızlı İşlemler
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(59, 130, 246, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
          }}
          >
            <Users style={{ height: '1.25rem', width: '1.25rem' }} />
            Yeni Kullanıcı
          </button>
          <button style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#059669'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(16, 185, 129, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
          }}
          >
            <Video style={{ height: '1.25rem', width: '1.25rem' }} />
            Yayın Başlat
          </button>
          <button style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#7c3aed'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(139, 92, 246, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#8b5cf6'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(139, 92, 246, 0.3)'
          }}
          >
            <FileText style={{ height: '1.25rem', width: '1.25rem' }} />
            Sertifika Oluştur
          </button>
          <button style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d97706'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(245, 158, 11, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f59e0b'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(245, 158, 11, 0.3)'
          }}
          >
            <ShoppingCart style={{ height: '1.25rem', width: '1.25rem' }} />
            Bağış Yönet
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}
