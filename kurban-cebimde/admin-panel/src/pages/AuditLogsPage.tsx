import { useState } from 'react'
import { Search, Filter, Download, Eye } from 'lucide-react'

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page header */}
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#111827'
        }}>Denetim Logları</h1>
        <p style={{
          color: '#6b7280',
          marginTop: '0.25rem'
        }}>
          Sistem aktivitelerini ve kullanıcı işlemlerini takip edin
        </p>
      </div>

      {/* Search and filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
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
            placeholder="Log kayıtlarında ara..."
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
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Tüm Loglar</option>
          <option value="login">Giriş İşlemleri</option>
          <option value="order">Sipariş İşlemleri</option>
          <option value="admin">Admin İşlemleri</option>
          <option value="error">Hata Logları</option>
        </select>

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
          Dışa Aktar
        </button>
      </div>

      {/* Logs table */}
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
          }}>Son Log Kayıtları</h3>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          color: '#6b7280'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Eye style={{
              height: '3rem',
              width: '3rem',
              margin: '0 auto 1rem',
              color: '#d1d5db'
            }} />
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Henüz log kaydı bulunmuyor</p>
            <p style={{ fontSize: '0.875rem' }}>Sistem aktiviteleri burada görünecek</p>
          </div>
        </div>
      </div>
    </div>
  )
}
