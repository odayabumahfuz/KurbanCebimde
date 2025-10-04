import { useState } from 'react'
import Layout from '../components/Layout'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <Layout>
      <div className="page-container space-y-6">
        {/* Page header */}
        <div className="page-header">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Katalog Yönetimi</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Kurban türleri, fiyatlar ve bölge bilgilerini yönetin</p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select-field"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="cattle">Sığır</option>
            <option value="sheep">Koyun</option>
            <option value="goat">Keçi</option>
          </select>
          <button className="btn-primary flex items-center gap-2">
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