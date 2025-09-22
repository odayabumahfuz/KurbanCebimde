import { useState } from 'react'
import Layout from '../components/Layout'
import { Download, Eye, Search, Filter } from 'lucide-react'

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Beklemede' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Onaylandı' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Reddedildi' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Tamamlandı' }
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#111827'
          }}>Sertifika Yönetimi</h1>
          <p style={{
            color: '#6b7280',
            marginTop: '0.25rem'
          }}>
            Kurban bağış sertifikalarını yönetin ve görüntüleyin
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Sertifika ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="approved">Onaylandı</option>
            <option value="rejected">Reddedildi</option>
            <option value="completed">Tamamlandı</option>
          </select>
        </div>

        {/* Certificates List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Sertifika #{item}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig('approved').color}`}>
                  {getStatusConfig('approved').text}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">Kullanıcı: Ahmet Yılmaz</p>
                <p className="text-sm text-gray-600">Tutar: ₺2,500</p>
                <p className="text-sm text-gray-600">Tarih: 15.01.2024</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 flex items-center justify-center gap-2">
                  <Eye size={14} />
                  Görüntüle
                </button>
                <button className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 flex items-center justify-center gap-2">
                  <Download size={14} />
                  İndir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}