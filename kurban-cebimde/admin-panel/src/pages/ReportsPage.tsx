import { useState, useEffect } from 'react'
import { Plus, Download, Edit, Trash2, Search, Calendar, FileText, TrendingUp, Users, DollarSign } from 'lucide-react'
import Layout from '../components/Layout'

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      // Gerçek API'den rapor verilerini çek
      // TODO: Reports endpoint'i eklendiğinde buraya gerçek API çağrısı yapılacak
      setReports([])
    } catch (error) {
      console.error('Rapor verileri yüklenemedi:', error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const reportsData = [
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

  const filteredReports = reportsData.filter(report => {
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
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Raporlar
              </h1>
              <p className="text-zinc-400">
                Tüm raporları görüntüleyin, yönetin ve analiz edin
              </p>
            </div>
            
            <button
              onClick={handleCreateReport}
              className="btn-success flex items-center gap-2"
            >
              <Plus size={16} />
              Yeni Rapor
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {reportsData.filter(r => r.type === 'distribution').length}
            </div>
            <div className="text-sm text-zinc-600">Dağıtım Raporları</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">
              {reportsData.filter(r => r.type === 'slaughter').length}
            </div>
            <div className="text-sm text-zinc-600">Kesim Raporları</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-amber-500 mb-2">
              {reportsData.filter(r => r.type === 'financial').length}
            </div>
            <div className="text-sm text-zinc-600">Finansal Raporlar</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              {reportsData.filter(r => r.type === 'audit').length}
            </div>
            <div className="text-sm text-zinc-600">Denetim Raporları</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rapor ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
          
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field min-w-[150px]"
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
              className="input-field min-w-[150px]"
            >
              <option value="all">Tüm Bölgeler</option>
              <option value="Türkiye">Türkiye</option>
              <option value="Somali">Somali</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Bangladeş">Bangladeş</option>
              <option value="Genel">Genel</option>
            </select>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.map(report => {
          const typeConfig = getTypeConfig(report.type)
          const priorityConfig = getPriorityConfig(report.priority)
          
          return (
            <div 
              key={report.id} 
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {report.summary}
                  </p>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                    style={{
                      backgroundColor: typeConfig.bgColor,
                      color: typeConfig.color
                    }}
                  >
                    <typeConfig.icon size={12} />
                    {typeConfig.label}
                  </span>
                  
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                    {report.region}
                  </span>
                  
                  <span 
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                    style={{
                      backgroundColor: priorityConfig.color + '20',
                      color: priorityConfig.color
                    }}
                  >
                    {priorityConfig.label}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Tarih
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.date}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Boyut
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.size}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      İndirilme
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.downloads} kez
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Yazar
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.author}
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex gap-2 flex-wrap mb-6">
                  {report.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex-1 justify-center"
                  >
                    <Download size={14} />
                    İndir
                  </button>
                  
                  <button
                    onClick={() => handleEditReport(report.id)}
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors"
                  >
                    <Edit size={14} />
                    Düzenle
                  </button>
                  
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Yeni Rapor Oluştur
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <form className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rapor Başlığı
                  </label>
                  <input
                    type="text"
                    placeholder="Rapor başlığını girin"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
    </Layout>
  )
}
