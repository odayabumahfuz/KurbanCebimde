import { useEffect, useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye, UserCheck, UserX, Phone, Mail, Users } from 'lucide-react'
import { adminApi, type UsersResponse } from '../lib/adminApi'
import Layout from '../components/Layout'

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
      // Liste yenile - mevcut sayfa ve arama terimi ile
      await fetchList(page)
    }catch(err:any){
      setSubmitError(err?.message || 'Kullanıcı oluşturulamadı')
    }finally{
      setSubmitLoading(false)
    }
  }

  function handleRoleChange(newRole: string){
    setRole(newRole)
  }

  async function fetchList(nextPage = 1){
    try {
      setLoading(true)
      const data = await adminApi.getUsers({ page: nextPage, size, search: searchTerm || undefined })
      setList(data)
      setPage(nextPage)
    } catch (error: any) {
      console.error('Kullanıcı listesi alınamadı:', error)
      alert('Kullanıcı listesi alınamadı: ' + (error?.message || 'Bilinmeyen hata'))
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      return
    }
    
    try {
      await adminApi.deleteUser(userId)
      alert('Kullanıcı başarıyla silindi')
      fetchList(page)
    } catch (err: any) {
      alert(err?.message || 'Kullanıcı silinemedi')
    }
  }

  async function handleToggleStatus(userId: string, userName: string, currentStatus: boolean) {
    try {
      await adminApi.toggleUserStatus(userId)
      const newStatus = !currentStatus
      alert(`${userName} kullanıcısı ${newStatus ? 'aktif' : 'pasif'} duruma getirildi`)
      fetchList(page)
    } catch (err: any) {
      alert(err?.message || 'Kullanıcı durumu değiştirilemedi')
    }
  }

  async function handleEditUser(user: any) {
    // Basit edit modal - gerçek uygulamada daha gelişmiş olabilir
    const newName = prompt('Yeni ad:', user.name)
    if (newName === null) return
    
    const newSurname = prompt('Yeni soyad:', user.surname)
    if (newSurname === null) return
    
    const newRole = prompt('Yeni rol (kullanıcı/admin/super_admin):', user.role)
    if (newRole === null) return
    
    if (!['kullanıcı', 'admin', 'super_admin'].includes(newRole)) {
      alert('Geçersiz rol. Lütfen kullanıcı, admin veya super_admin girin.')
      return
    }
    
    try {
      await adminApi.updateUser(user.id, {
        name: newName,
        surname: newSurname,
        role: newRole
      })
      alert('Kullanıcı başarıyla güncellendi')
      fetchList(page)
    } catch (err: any) {
      alert(err?.message || 'Kullanıcı güncellenemedi')
    }
  }

  useEffect(() => { fetchList(1) }, [])

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
          <p className="text-zinc-400 mt-1">
            Sistem kullanıcılarını görüntüleyin ve yönetin
          </p>
        </div>

        {/* Actions bar */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700 shadow-xl">
          <div className="flex gap-4 items-center flex-wrap">
            <button 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              onClick={() => setOpen(true)}
            >
              <Plus size={18} />
              Yeni Kullanıcı
            </button>

            <div className="relative flex-1 min-w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Kullanıcılarda ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-4 pl-12 bg-zinc-800 border border-zinc-600 rounded-xl text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-lg"
              />
            </div>
            
            <button 
              onClick={() => fetchList(1)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              disabled={loading}
            >
              {loading ? 'Aranıyor...' : 'Ara'}
            </button>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Kullanıcılar</option>
              <option value="verified">Doğrulanmış</option>
              <option value="unverified">Doğrulanmamış</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>

        {/* Add User Modal */}
        {open && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-xl">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 border border-zinc-700 w-full max-w-lg shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                  <Plus className="text-white" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white">Yeni Kullanıcı Ekle</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-zinc-300">Ad</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ad"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-zinc-300">Soyad</label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Soyad"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-zinc-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email (opsiyonel)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-zinc-300">Telefon</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Telefon"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-zinc-300">Şifre</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Şifre"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-zinc-300">Rol</label>
                  <select 
                    value={role} 
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="kullanıcı">Kullanıcı (Normal kullanıcı)</option>
                    <option value="admin">Admin (Uygulamada admin erişimi)</option>
                    <option value="super_admin">Super Admin (Hem uygulama hem panelde admin)</option>
                  </select>
                </div>
              </div>

              {submitError && (
                <div className="mt-3 text-sm text-red-600">{submitError}</div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors" 
                  onClick={() => setOpen(false)}
                >
                  İptal
                </button>
                <button 
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-colors" 
                  disabled={submitLoading} 
                  onClick={submit}
                >
                  {submitLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users list */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
          <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-100">
              Kullanıcı Listesi ({list?.total ?? 0})
            </h3>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-zinc-600">Kullanıcılar yükleniyor...</p>
              </div>
            ) : (list?.items ?? []).length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-zinc-400" />
                <p className="mt-2 text-zinc-600">Kullanıcı bulunamadı</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(list?.items ?? []).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-zinc-700 rounded-xl hover:bg-zinc-800 transition-all duration-200 bg-zinc-800/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-sm font-medium text-white">
                          {user.name?.charAt(0)}{user.surname?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-zinc-100">
                          {user.name} {user.surname}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span>ID: {user.id}</span>
                          <span>•</span>
                          <span>{user.order_count ?? 0} sipariş</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-300">{user.phone}</span>
                      </div>
                      {user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm text-zinc-300">{user.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`status-badge ${user.is_verified ? 'status-verified' : 'status-unverified'}`}>
                        {user.is_verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                      </span>
                      <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                        {user.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                      <span className={`status-badge ${user.role === 'super_admin' ? 'status-completed' : user.role === 'admin' ? 'status-paid' : 'status-pending'}`}>
                        {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, `${user.name} ${user.surname}`, user.is_active)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${user.is_active ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                      >
                        {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        {user.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        <Edit size={14} />
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, `${user.name} ${user.surname}`)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        <Trash2 size={14} />
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {list && list.total > size && (
          <div className="flex justify-center items-center gap-4">
            <button 
              onClick={() => fetchList(page - 1)}
              disabled={page <= 1}
              className="bg-zinc-600 hover:bg-zinc-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Önceki
            </button>
            <span className="text-zinc-600">Sayfa {page}</span>
            <button 
              onClick={() => fetchList(page + 1)}
              disabled={page * size >= list.total}
              className="bg-zinc-600 hover:bg-zinc-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}