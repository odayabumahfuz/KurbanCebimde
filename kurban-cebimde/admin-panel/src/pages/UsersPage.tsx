import { useEffect, useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { adminApi, type UsersResponse } from '../lib/adminApi'
import Layout from '../components/Layout'
import { DataTable, type Column } from '../components/shared/DataTable'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [open, setOpen] = useState(false)
  const [list, setList] = useState<UsersResponse | null>(null)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<string>('kullanıcı')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(){
    setSubmitError(null)
    if(!name.trim() || !surname.trim() || !phone.trim() || !password.trim()){
      setSubmitError('Ad, soyad, telefon ve şifre zorunlu')
      return
    }
    try{
      setSubmitLoading(true)
      await adminApi.createUser({ name, surname, email, phone, password, role })
      alert('Kullanıcı başarıyla oluşturuldu')
      setOpen(false)
      setName(''); setSurname(''); setEmail(''); setPhone(''); setPassword(''); setRole('kullanıcı')
      await fetchList(page)
    }catch(err:any){ setSubmitError(err?.message || 'Kullanıcı oluşturulamadı') } finally{ setSubmitLoading(false) }
  }

  async function fetchList(nextPage = 1){
    try{ setLoading(true); const data = await adminApi.getUsers({ page: nextPage, size, search: searchTerm || undefined }); setList(data); setPage(nextPage) }catch(error:any){ console.error('Kullanıcı listesi alınamadı:', error); alert('Kullanıcı listesi alınamadı: ' + (error?.message || 'Bilinmeyen hata')) } finally{ setLoading(false) }
  }

  useEffect(() => { fetchList(1) }, [])

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="page-header">
          <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-zinc-500 mt-1">Sistem kullanıcılarını görüntüleyin ve yönetin</p>
        </div>

        {/* Toolbar */}
        <div className="toolbar flex items-center gap-3 flex-wrap">
          <button 
            className="btn-primary"
            onClick={() => setOpen(true)}
          >
            <Plus size={18} className="mr-2"/>
            Yeni Kullanıcı
          </button>

          <div className="relative flex-1 min-w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Kullanıcılarda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button 
            onClick={() => fetchList(1)}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select-field"
          >
            <option value="all">Tüm Kullanıcılar</option>
            <option value="verified">Doğrulanmış</option>
            <option value="unverified">Doğrulanmamış</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>

        {/* Users list (DataTable) */}
        <div className="space-y-3">
          <div className="text-sm text-zinc-400">Beta tablo görünümü — Excel export aktif</div>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-zinc-600">Kullanıcılar yükleniyor...</p>
            </div>
          ) : (list?.items ?? []).length === 0 ? (
            <div className="text-center py-8">
              <p className="mt-2 text-zinc-600">Kullanıcı bulunamadı</p>
            </div>
          ) : (
            <DataTable
              rows={(list?.items || []).map((u:any)=> ({
                id: String(u.id),
                ad: `${u.name || ''} ${u.surname || ''}`.trim(),
                tel: u.phone || '-',
                mail: u.email || '-',
                durum: u.is_online ? 'Aktif (Online)' : (u.is_enabled ? 'Etkin' : 'Devre Dışı'),
                dogrulama: u.is_verified ? 'Doğrulanmış' : 'Doğrulanmamış',
                kayit: u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '-',
                last_seen: u.last_seen ? new Date(u.last_seen).toLocaleString('tr-TR') : '-',
                _raw: u,
              }))}
              columns={[
                { id: 'ad', header: 'Ad Soyad', accessor: (r:any)=> r.ad },
                { id: 'tel', header: 'Telefon', accessor: (r:any)=> r.tel },
                { id: 'mail', header: 'E-posta', accessor: (r:any)=> r.mail },
                { id: 'durum', header: 'Durum', accessor: (r:any)=> (
                  r._raw?.is_online ? <span className="badge badge-success">Online</span>
                  : (r._raw?.is_enabled ? <span className="badge badge-neutral">Etkin</span>
                  : <span className="badge badge-danger">Devre Dışı</span>)
                ) },
                { id: 'dogrulama', header: 'Doğrulama', accessor: (r:any)=> r.dogrulama },
                { id: 'last_seen', header: 'Son Görülme', accessor: (r:any)=> r.last_seen },
                { id: 'kayit', header: 'Kayıt Tarihi', accessor: (r:any)=> r.kayit },
              ] as Column<any>[]}
              csvName="kullanicilar"
            />
          )}
        </div>
      </div>
    </Layout>
  )
}