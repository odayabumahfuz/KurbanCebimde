import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye, UserCheck, UserX, Phone, Mail } from 'lucide-react'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Mock users data
  const users = [
    {
      id: 1,
      name: 'Ahmet',
      surname: 'Yılmaz',
      phone: '+90 555 123 4567',
      email: 'ahmet@example.com',
      is_verified: true,
      is_active: true,
      roles: ['donor'],
      created_at: '2024-01-15',
      order_count: 3
    },
    {
      id: 2,
      name: 'Fatma',
      surname: 'Demir',
      phone: '+90 555 987 6543',
      email: 'fatma@example.com',
      is_verified: true,
      is_active: true,
      roles: ['donor'],
      created_at: '2024-01-20',
      order_count: 1
    },
    {
      id: 3,
      name: 'Mehmet',
      surname: 'Kaya',
      phone: '+90 555 456 7890',
      email: null,
      is_verified: false,
      is_active: true,
      roles: ['donor'],
      created_at: '2024-02-01',
      order_count: 0
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page header */}
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#111827'
        }}>Kullanıcı Yönetimi</h1>
        <p style={{
          color: '#6b7280',
          marginTop: '0.25rem'
        }}>
          Sistem kullanıcılarını görüntüleyin ve yönetin
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
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          <Plus style={{ height: '1rem', width: '1rem' }} />
          Yeni Kullanıcı
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
            placeholder="Kullanıcılarda ara..."
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
          <option value="all">Tüm Kullanıcılar</option>
          <option value="verified">Doğrulanmış</option>
          <option value="unverified">Doğrulanmamış</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
        </select>
      </div>

      {/* Users table */}
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
          }}>Kullanıcı Listesi ({users.length})</h3>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {users.map((user) => (
            <div key={user.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#1e40af'
                  }}>
                    {user.name.charAt(0)}{user.surname.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '0.25rem'
                  }}>
                    {user.name} {user.surname}
                  </h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <span>ID: {user.id}</span>
                    <span>•</span>
                    <span>{user.order_count} sipariş</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  <Phone style={{ height: '1rem', width: '1rem' }} />
                  {user.phone}
                </div>
                {user.email && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <Mail style={{ height: '1rem', width: '1rem' }} />
                    {user.email}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: user.is_verified ? '#dcfce7' : '#fef3c2',
                  color: user.is_verified ? '#166534' : '#92400e'
                }}>
                  {user.is_verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                </span>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2',
                  color: user.is_active ? '#166534' : '#991b1b'
                }}>
                  {user.is_active ? 'Aktif' : 'Pasif'}
                </span>
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
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}>
                  <Trash2 style={{ height: '0.875rem', width: '0.875rem' }} />
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
