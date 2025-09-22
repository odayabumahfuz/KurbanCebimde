import { useState } from 'react'
import Layout from '../components/Layout'

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  return (
    <Layout>
      <div className="p-6 space-y-6">
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

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Log ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tümü</option>
            <option value="login">Giriş</option>
            <option value="logout">Çıkış</option>
            <option value="create">Oluşturma</option>
            <option value="update">Güncelleme</option>
            <option value="delete">Silme</option>
          </select>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 text-center">
            <div style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem',
              color: '#9ca3af'
            }}>📋</div>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Henüz log kaydı bulunmuyor</p>
            <p style={{ fontSize: '0.875rem' }}>Sistem aktiviteleri burada görünecek</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}