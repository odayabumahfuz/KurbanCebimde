import { useEffect, useState } from 'react'
import { Search, Filter, Download, Eye, CheckCircle, Clock, AlertCircle, TrendingUp, DollarSign, Users, Activity, Gift } from 'lucide-react'
import { adminApi } from '../lib/adminApi'
import Layout, { useTheme } from '../components/Layout'

export default function DonationsPage() {
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchDonations()
  }, [page, size, searchTerm, selectedStatus])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      const params: any = { page, size }
      if (searchTerm) params.search = searchTerm
      if (selectedStatus !== 'all') params.status = selectedStatus
      
      const response = await adminApi.getDonations(params)
      setDonations(response.items || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Donations fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'PAID': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'ASSIGNED': return <AlertCircle className="w-4 h-4 text-blue-500" />
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-purple-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Bekliyor'
      case 'PAID': return 'Ödendi'
      case 'ASSIGNED': return 'Atandı'
      case 'COMPLETED': return 'Tamamlandı'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount)
    if (num % 1 === 0) {
      // Tam sayı ise .00 kısmını gösterme
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(num)
    } else {
      // Ondalıklı sayı ise normal format
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(num)
    }
  }

  // Stats'ı donations array'inden hesapla
  console.log('🔍 Donations array:', donations);
  console.log('🔍 Donations length:', donations?.length);
  console.log('🔍 First donation:', donations?.[0]);
  
  const calculatedStats = donations ? {
    total_donations: donations.length,
    total_amount: donations.reduce((sum, donation) => {
      const amount = parseFloat(donation.amount || '0');
      console.log('💰 Processing amount:', donation.amount, '->', amount);
      return sum + amount;
    }, 0),
    status_counts: {
      pending: donations.filter(d => d.status === 'pending' || d.status === 'bekliyor').length,
      completed: donations.filter(d => d.status === 'completed' || d.status === 'tamamlandi').length
    }
  } : null

  // Debug: Console'a yazdır
  console.log('📊 Final calculated stats:', calculatedStats);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Donations</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track all donation records</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Donations</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{calculatedStats?.total_donations || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Amount</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{formatAmount((calculatedStats?.total_amount || 0).toString())}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{calculatedStats?.status_counts?.pending || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{calculatedStats?.status_counts?.completed || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Kullanıcı adı, telefon veya email ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            
            <div className="md:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="PENDING">Bekliyor</option>
                <option value="PAID">Ödendi</option>
                <option value="ASSIGNED">Atandı</option>
                <option value="COMPLETED">Tamamlandı</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-lg font-medium text-zinc-100">Bağış Listesi</h3>
            <p className="text-sm text-zinc-400">Toplam {total} bağış</p>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-zinc-400">Yükleniyor...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-zinc-400">Bağış bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-700">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-900 divide-y divide-zinc-700">
                  {donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-zinc-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-zinc-100">
                            {donation.name} {donation.surname}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {donation.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-zinc-100">
                          {formatAmount(donation.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                          {getStatusIcon(donation.status)}
                          <span className="ml-1">{getStatusText(donation.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(donation.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          {donation.video_url && (
                            <button className="text-green-600 hover:text-green-900">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > size && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Sayfa {page} / {Math.ceil(total / size)}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              <button
                onClick={() => setPage(Math.min(Math.ceil(total / size), page + 1))}
                disabled={page >= Math.ceil(total / size)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
