import { useState } from 'react'
import { Search, Download, Eye, Edit, Clock, CheckCircle, XCircle, MapPin, Package } from 'lucide-react'

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Mock orders data
  const orders = [
    {
      id: 1,
      user_name: 'Ahmet Yılmaz',
      user_phone: '+90 555 123 4567',
      status: 'PAID',
      amount: 850,
      currency: 'TRY',
      niyet_confirmed: true,
      created_at: '2024-01-15',
      item_count: 1,
      location: 'Türkiye'
    },
    {
      id: 2,
      user_name: 'Fatma Demir',
      user_phone: '+90 555 987 6543',
      status: 'PENDING',
      amount: 650,
      currency: 'TRY',
      niyet_confirmed: false,
      created_at: '2024-01-20',
      item_count: 1,
      location: 'Afrika'
    },
    {
      id: 3,
      user_name: 'Mehmet Kaya',
      user_phone: '+90 555 456 7890',
      status: 'COMPLETED',
      amount: 1200,
      currency: 'TRY',
      niyet_confirmed: true,
      created_at: '2024-02-01',
      item_count: 2,
      location: 'Türkiye'
    }
  ]

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { label: 'Bekliyor', color: '#f59e0b', bgColor: '#fef3c2', icon: Clock },
      PAID: { label: 'Ödendi', color: '#10b981', bgColor: '#dcfce7', icon: CheckCircle },
      COMPLETED: { label: 'Tamamlandı', color: '#10b981', bgColor: '#dcfce7', icon: CheckCircle },
      FAILED: { label: 'Başarısız', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
      CANCELLED: { label: 'İptal', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
    }
    return configs[status as keyof typeof configs] || configs.PENDING
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page header */}
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#111827'
        }}>Bağış Yönetimi</h1>
        <p style={{
          color: '#6b7280',
          marginTop: '0.25rem'
        }}>
          Kurban bağışlarını ve siparişleri yönetin
        </p>
      </div>

      {/* Actions bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#0284c7',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          <Download style={{ height: '1rem', width: '1rem' }} />
          Rapor İndir
        </button>

        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <Search style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '1.25rem',
            width: '1.25rem',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            placeholder="Bağışlarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="PENDING">Bekliyor</option>
          <option value="PAID">Ödendi</option>
          <option value="COMPLETED">Tamamlandı</option>
          <option value="FAILED">Başarısız</option>
          <option value="CANCELLED">İptal</option>
        </select>
      </div>

      {/* Orders list */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151'
          }}>Bağış Listesi ({orders.length})</h3>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status)
            const Icon = statusConfig.icon
            
            return (
              <div key={order.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Package style={{ height: '1.5rem', width: '1.5rem', color: '#6b7280' }} />
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.5rem'
                    }}>
                      Bağış #{order.id}
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <span>{order.user_name}</span>
                      <span>•</span>
                      <span>{order.user_phone}</span>
                      <span>•</span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <MapPin style={{ height: '0.875rem', width: '0.875rem' }} />
                        {order.location}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#10b981'
                    }}>
                      ₺{order.amount.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {order.currency}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color
                    }}>
                      <Icon style={{ height: '0.75rem', width: '0.75rem' }} />
                      {statusConfig.label}
                    </span>
                    
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: order.niyet_confirmed ? '#dcfce7' : '#fef3c2',
                      color: order.niyet_confirmed ? '#166534' : '#92400e'
                    }}>
                      {order.niyet_confirmed ? 'Niyet Onaylandı' : 'Niyet Bekliyor'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    <Eye style={{ height: '0.875rem', width: '0.875rem' }} />
                    Görüntüle
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    <Edit style={{ height: '0.875rem', width: '0.875rem' }} />
                    Düzenle
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
