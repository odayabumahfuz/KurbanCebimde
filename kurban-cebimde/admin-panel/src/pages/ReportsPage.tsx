import { useState } from 'react'
import { BarChart3, Plus, Download, Eye, Edit, Trash2, Filter, Search, Calendar, FileText, TrendingUp, Users, DollarSign, MapPin } from 'lucide-react'

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock reports data
  const reports = [
    {
      id: 1,
      title: 'Somali Büyükbaş Dağıtım Raporu',
      type: 'distribution',
      region: 'Somali',
      date: '2024-01-15',
      status: 'completed',
      size: '3.2 MB',
      downloads: 45,
      author: 'Ahmed Hassan',
      priority: 'high',
      tags: ['Dağıtım', 'Somali', 'Büyükbaş'],
      summary: 'Somali bölgesinde 45 aileye 180 kg et dağıtımı yapıldı',
      beneficiaries: 45,
      meatDistributed: '180 kg',
      cost: '₺ 8,500'
    },
    {
      id: 2,
      title: 'Türkiye Koç Kesim Raporu',
      type: 'slaughter',
      region: 'Türkiye',
      date: '2024-01-10',
      status: 'completed',
      size: '2.8 MB',
      downloads: 32,
      author: 'Mehmet Usta',
      priority: 'medium',
      tags: ['Kesim', 'Türkiye', 'Koç'],
      summary: 'Profesyonel kesim, hijyenik koşullar sağlandı',
      slaughterDate: '2024-01-10',
      meatQuality: 'A+',
      weight: '45 kg',
      cost: '₺ 3,200'
    },
    {
      id: 3,
      title: 'Bangladeş Finansal Raporu',
      type: 'financial',
      region: 'Bangladeş',
      date: '2024-01-05',
      status: 'completed',
      size: '1.9 MB',
      downloads: 28,
      author: 'Fatima Khan',
      priority: 'high',
      tags: ['Finansal', 'Bangladeş', 'Koyun'],
      summary: 'Bütçe dahilinde tamamlandı, tüm masraflar detaylandırıldı',
      totalCost: '₺ 6,500',
      netAmount: '₺ 5,300',
      currency: 'TRY',
      exchangeRate: '1 USD = 28.5 TRY'
    },
    {
      id: 4,
      title: 'Pakistan Denetim Raporu',
      type: 'audit',
      region: 'Pakistan',
      date: '2024-01-20',
      status: 'completed',
      size: '4.1 MB',
      downloads: 19,
      author: 'Dr. Ali Raza',
      priority: 'high',
      tags: ['Denetim', 'Pakistan', 'Büyükbaş'],
      summary: '95% uyumluluk skoru, 2 minor issue tespit edildi',
      complianceScore: '95%',
      findings: '2 minor issues found',
      recommendations: 'Process improvement suggested'
    },
    {
      id: 5,
      title: 'Ağustos 2024 Aylık Özet',
      type: 'monthly',
      region: 'Genel',
      date: '2024-09-01',
      status: 'completed',
      size: '8.5 MB',
      downloads: 67,
      author: 'Sistem',
      priority: 'medium',
      tags: ['Aylık', 'Özet', 'Genel'],
      summary: 'Record breaking month for donations, 156 animals sacrificed',
      totalAnimals: 156,
      totalBeneficiaries: 1240,
      totalAmount: '₺ 89,500',
      regions: ['Türkiye', 'Somali', 'Pakistan', 'Bangladeş']
    }
  ]

  const getTypeConfig = (type: string) => {
    const configs = {
      distribution: { label: 'Dağıtım', color: '#10b981', bgColor: '#d1fae5', icon: Users },
      slaughter: { label: 'Kesim', color: '#ef4444', bgColor: '#fee2e2', icon: FileText },
      financial: { label: 'Finansal', color: '#f59e0b', bgColor: '#fef3c2', icon: DollarSign },
      audit: { label: 'Denetim', color: '#8b5cf6', bgColor: '#f3e8ff', icon: TrendingUp },
      monthly: { label: 'Aylık', color: '#3b82f6', bgColor: '#dbeafe', icon: Calendar },
    }
    return configs[type as keyof typeof configs] || configs.distribution
  }

  const getPriorityConfig = (priority: string) => {
    const configs = {
      high: { label: 'Yüksek', color: '#ef4444' },
      medium: { label: 'Orta', color: '#f59e0b' },
      low: { label: 'Düşük', color: '#10b981' },
    }
    return configs[priority as keyof typeof configs] || configs.medium
  }

  const filteredReports = reports.filter(report => {
    if (selectedType !== 'all' && report.type !== selectedType) return false
    if (selectedRegion !== 'all' && report.region !== selectedRegion) return false
    if (searchTerm && !report.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const handleCreateReport = () => {
    setShowCreateModal(true)
  }

  const handleEditReport = (reportId: number) => {
    console.log('Rapor düzenleniyor:', reportId)
    // Edit report logic
  }

  const handleDeleteReport = (reportId: number) => {
    if (confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      console.log('Rapor siliniyor:', reportId)
      // Delete report logic
    }
  }

  const handleDownloadReport = (reportId: number) => {
    console.log('Rapor indiriliyor:', reportId)
    // Download report logic
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>Raporlar</h1>
          <p style={{
            color: '#6b7280',
            margin: '0.5rem 0 0 0'
          }}>
            Tüm raporları görüntüleyin, yönetin ve analiz edin
          </p>
        </div>
        
        <button
          onClick={handleCreateReport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          <Plus size={20} />
          Yeni Rapor
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
            {reports.filter(r => r.type === 'distribution').length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Dağıtım Raporları</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
            {reports.filter(r => r.type === 'slaughter').length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Kesim Raporları</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
            {reports.filter(r => r.type === 'financial').length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Finansal Raporlar</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
            {reports.filter(r => r.type === 'audit').length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Denetim Raporları</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#9ca3af',
              width: '20px',
              height: '20px'
            }} />
            <input
              type="text"
              placeholder="Rapor ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: 'white',
            minWidth: '150px'
          }}
        >
          <option value="all">Tüm Türler</option>
          <option value="distribution">Dağıtım</option>
          <option value="slaughter">Kesim</option>
          <option value="financial">Finansal</option>
          <option value="audit">Denetim</option>
          <option value="monthly">Aylık</option>
        </select>
        
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: 'white',
            minWidth: '150px'
          }}
        >
          <option value="all">Tüm Bölgeler</option>
          <option value="Türkiye">Türkiye</option>
          <option value="Somali">Somali</option>
          <option value="Pakistan">Pakistan</option>
          <option value="Bangladeş">Bangladeş</option>
          <option value="Genel">Genel</option>
        </select>
      </div>

      {/* Reports Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredReports.map(report => {
          const typeConfig = getTypeConfig(report.type)
          const priorityConfig = getPriorityConfig(report.priority)
          
          return (
            <div key={report.id} style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              {/* Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: '1' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 0.5rem 0',
                      lineHeight: '1.4'
                    }}>
                      {report.title}
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {report.summary}
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    backgroundColor: typeConfig.bgColor,
                    color: typeConfig.color,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    <typeConfig.icon size={12} />
                    {typeConfig.label}
                  </span>
                  
                  <span style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {report.region}
                  </span>
                  
                  <span style={{
                    backgroundColor: priorityConfig.color + '20',
                    color: priorityConfig.color,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {priorityConfig.label}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      Tarih
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {report.date}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      Boyut
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {report.size}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      İndirilme
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {report.downloads} kez
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      Yazar
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {report.author}
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.5rem'
                }}>
                  {report.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    <Download size={14} />
                    İndir
                  </button>
                  
                  <button
                    onClick={() => handleEditReport(report.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={14} />
                    Düzenle
                  </button>
                  
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                Yeni Rapor Oluştur
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Rapor Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Rapor başlığını girin"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Rapor Türü
                </label>
                <select style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: 'white'
                }}>
                  <option value="distribution">Dağıtım</option>
                  <option value="slaughter">Kesim</option>
                  <option value="financial">Finansal</option>
                  <option value="audit">Denetim</option>
                  <option value="monthly">Aylık</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Bölge
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}>
                    <option value="Türkiye">Türkiye</option>
                    <option value="Somali">Somali</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Bangladeş">Bangladeş</option>
                    <option value="Genel">Genel</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Öncelik
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}>
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Özet
                </label>
                <textarea
                  placeholder="Rapor özetini girin"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Etiketler
                </label>
                <input
                  type="text"
                  placeholder="Etiketleri virgülle ayırarak girin"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Rapor Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
