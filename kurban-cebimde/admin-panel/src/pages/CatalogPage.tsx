import { useState } from 'react'
import { Package, Plus, Edit, Trash2, Eye } from 'lucide-react'

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          Yeni Ürün Ekle
        </button>

        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Katalog ürünlerinde ara..."
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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Tüm Kategoriler</option>
          <option value="koc">Koç</option>
          <option value="koyun">Koyun</option>
          <option value="buyukbas">Büyükbaş</option>
        </select>
      </div>

      {/* Catalog grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Sample catalog items */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '200px',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package style={{ height: '3rem', width: '3rem', color: '#9ca3af' }} />
          </div>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>Koç - Türkiye</h3>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>Yüksek kalite koç, taze ve sağlıklı</p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#10b981'
              }}>₺850</span>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>Stok: 15</span>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
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
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '200px',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package style={{ height: '3rem', width: '3rem', color: '#9ca3af' }} />
          </div>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>Koyun - Afrika</h3>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>Afrika bölgesi özel koyun türü</p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#10b981'
              }}>₺650</span>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>Stok: 8</span>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
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
        </div>
      </div>
    </div>
  )
}
