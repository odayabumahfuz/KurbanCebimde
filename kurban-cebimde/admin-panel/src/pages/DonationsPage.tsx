import { useEffect, useState } from 'react'
import { Search, Filter, Download, Eye, CheckCircle, Clock, AlertCircle, TrendingUp, DollarSign, Users, Activity, Gift, Link2, Package, RotateCcw } from 'lucide-react'
import { adminApi } from '../lib/adminApi'
import Layout, { useTheme } from '../components/Layout'
import { DataTable, type Column } from '../components/shared/DataTable'

export default function DonationsPage() {
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [drawerData, setDrawerData] = useState<any | null>(null)
  const [refundOpen, setRefundOpen] = useState<{id:string|null, note:string}>({id:null, note:''})
  const [actionLoading, setActionLoading] = useState(false)

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

  async function openDrawer(id: string){
    setDrawerId(id)
    try{ const data = await adminApi.getDonation(id); setDrawerData(data) }catch(e){ setDrawerData(null) }
  }
  function closeDrawer(){ setDrawerId(null); setDrawerData(null) }

  async function doRefund(){
    if(!refundOpen.id) return
    try{ setActionLoading(true); await adminApi.refundDonation(refundOpen.id, refundOpen.note); alert('İade talebi alındı'); setRefundOpen({id:null, note:''}); fetchDonations(); }catch(e:any){ alert(e?.message||'İade başarısız') } finally{ setActionLoading(false) }
  }

  async function createPackageShortcut(id: string){
    // basit yönlendirme: medya paketleri sayfasına
    window.location.href = '/admin/media/package'
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
      <div className="page-container space-y-6">
        {/* Header */}
        <div className="card">
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

        {/* Donations Table - DataTable */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-zinc-400">Yükleniyor...</p>
          </div>
        ) : (
          <DataTable
            rows={donations.map((d:any)=> ({
              id: String(d.id),
              ad: `${d.name||''} ${d.surname||''}`.trim(),
              tel: d.phone || '-',
              tutar: formatAmount(d.amount),
              hayvan: d.animal_type || '-',
              adet: d.animal_count != null ? String(d.animal_count) : '-',
              niyet: d.slaughter_intent || '-',
              durum: getStatusText(d.status),
              tarih: formatDate(d.created_at),
              _raw: d,
            }))}
            columns={[
              { id:'ad', header:'Bağışçı', accessor:(r:any)=> r.ad },
              { id:'tel', header:'Telefon', accessor:(r:any)=> r.tel },
              { id:'tutar', header:'Tutar', accessor:(r:any)=> r.tutar },
              { id:'hayvan', header:'Hayvan Türü', accessor:(r:any)=> r.hayvan },
              { id:'adet', header:'Adet', accessor:(r:any)=> r.adet },
              { id:'niyet', header:'Kesim Niyeti', accessor:(r:any)=> r.niyet },
              { id:'durum', header:'Durum', accessor:(r:any)=> r.durum },
              { id:'tarih', header:'Tarih', accessor:(r:any)=> r.tarih },
              { id:'ops', header:'İşlemler', accessor:(r:any)=> (
                <div className="flex items-center gap-2">
                  <button title="Detay" onClick={()=>openDrawer(r.id)} className="text-blue-500"><Eye className="w-4 h-4"/></button>
                  <button title="Yayına bağla" onClick={()=>alert('Yayına bağlama akışı yakında')} className="text-amber-500"><Link2 className="w-4 h-4"/></button>
                  <button title="İade" onClick={()=>setRefundOpen({id:r.id, note:''})} className="text-red-500"><RotateCcw className="w-4 h-4"/></button>
                  <button title="Paket oluştur" onClick={()=>createPackageShortcut(r.id)} className="text-green-500"><Package className="w-4 h-4"/></button>
                </div>
              ) },
            ] as Column<any>[]}
            csvName="bagislar"
          />
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">Sayfa {page} / {Math.max(1, Math.ceil(total / size))}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Önceki</button>
            <select value={size} onChange={(e)=>{ setPage(1); setSize(parseInt(e.target.value)) }} className="px-2 py-2 text-sm bg-white border border-gray-300 rounded-md">
              {[10,20,50,100].map(s=> <option key={s} value={s}>{s}/sayfa</option>)}
            </select>
            <button onClick={() => setPage(Math.min(Math.ceil(total / size), page + 1))} disabled={page >= Math.ceil(total / size)} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Sonraki</button>
          </div>
        </div>

        {/* Drawer */}
        {drawerId && (
          <div className="fixed inset-0 bg-black/60 z-50" onClick={closeDrawer}>
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 p-4 overflow-auto" onClick={(e)=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Bağış Detayı</h2>
                <button className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800" onClick={closeDrawer}>Kapat</button>
              </div>
              {drawerData ? (
                <div className="space-y-3 text-sm">
                  <div><span className="text-slate-500">ID:</span> {drawerData.id}</div>
                  <div><span className="text-slate-500">Kullanıcı:</span> {drawerData.name} {drawerData.surname}</div>
                  <div><span className="text-slate-500">Tutar:</span> {formatAmount(drawerData.amount)}</div>
                  <div><span className="text-slate-500">Durum:</span> {getStatusText(drawerData.status)}</div>
                  <div><span className="text-slate-500">Oluşturma:</span> {formatDate(drawerData.created_at)}</div>
                  <div><span className="text-slate-500">Yayın:</span> {drawerData.broadcast_id || '-'}</div>
                  <div><span className="text-slate-500">Medya Paketleri:</span> {(drawerData.packages||[]).length}</div>
                </div>
              ) : (
                <div className="text-slate-500">Yükleniyor...</div>
              )}
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {refundOpen.id && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={()=>setRefundOpen({id:null, note:''})}>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700" onClick={(e)=>e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-3">İade Et</h3>
              <p className="text-sm text-slate-500 mb-2">Bu bağış için iade başlatılacak. Not (opsiyonel):</p>
              <textarea value={refundOpen.note} onChange={(e)=>setRefundOpen(prev=>({ ...prev, note: e.target.value }))} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 h-24 bg-transparent" />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={()=>setRefundOpen({id:null, note:''})} className="px-3 py-2 rounded bg-slate-200 dark:bg-slate-800">İptal</button>
                <button disabled={actionLoading} onClick={doRefund} className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50">İadeyi Başlat</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
