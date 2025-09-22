import { useState } from 'react'
import Layout from '../components/Layout'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#111827'
          }}>Katalog Yönetimi</h1>
          <p style={{
            color: '#6b7280',
            marginTop: '0.25rem'
          }}>
            Kurban türleri, fiyatlar ve bölge bilgilerini yönetin
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="cattle">Sığır</option>
            <option value="sheep">Koyun</option>
            <option value="goat">Keçi</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={16} />
            Yeni Ürün
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Ürün {item}</h3>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Kategori: Sığır</p>
              <p className="text-sm text-gray-600 mb-4">Fiyat: ₺2,500</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">Stokta</span>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200">
                  Düzenle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}