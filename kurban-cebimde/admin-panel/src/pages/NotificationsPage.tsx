import { useState } from 'react'
import { Bell, Plus, Edit, Trash2, Send } from 'lucide-react'

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page header */}
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#111827'
        }}>Bildirim Yönetimi</h1>
        <p style={{
          color: '#6b7280',
          marginTop: '0.25rem'
        }}>
          Kullanıcılara SMS, email ve push bildirimleri gönderin
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
          Yeni Bildirim
        </button>

        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          <Send style={{ height: '1rem', width: '1rem' }} />
          Toplu Gönderim
        </button>

        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Bildirimlerde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Tüm Bildirimler</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
          <option value="push">Push</option>
        </select>
      </div>

      {/* Notifications list */}
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
          }}>Son Bildirimler</h3>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {/* Sample notification */}
          <div style={{
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
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bell style={{ height: '1rem', width: '1rem', color: 'white' }} />
              </div>
              <div>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.25rem'
                }}>Kurban Bağışı Hatırlatması</h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>Kurban Bayramı yaklaşıyor, bağışlarınızı unutmayın!</p>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af'
                }}>2 saat önce gönderildi</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
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

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: '#6b7280'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Bell style={{
                height: '2rem',
                width: '2rem',
                margin: '0 auto 0.5rem',
                color: '#d1d5db'
              }} />
              <p style={{ fontSize: '0.875rem' }}>Henüz başka bildirim bulunmuyor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
