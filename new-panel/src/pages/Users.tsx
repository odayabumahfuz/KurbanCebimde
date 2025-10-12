import React, { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'

type User = { id: string; name: string; email?: string; phone?: string; role: 'user'|'admin'|'super_admin'; status: 'active'|'suspended'; createdAt: string; donations: number; streams: number }

const seed: User[] = Array.from({ length: 57 }).map((_,i)=> ({
  id: `U${1000+i}`,
  name: `Kullanıcı ${i+1}`,
  email: `user${i+1}@mail.com`,
  phone: `+9055${(100000+i).toString().slice(-6)}`,
  role: i%23===0? 'super_admin' : (i%10===0? 'admin':'user'),
  status: i%7===0? 'suspended':'active',
  createdAt: '2025-01-01',
  donations: Math.round(Math.random()*20),
  streams: Math.round(Math.random()*15)
}))

const Users: React.FC = () => {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<'all'|'user'|'admin'|'super_admin'>('all')
  const [status, setStatus] = useState<'all'|'active'|'suspended'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(()=>{
    let list = seed
    if (query) list = list.filter(u=> (u.name+u.email+u.phone).toLowerCase().includes(query.toLowerCase()))
    if (role!=='all') list = list.filter(u=> u.role===role)
    if (status!=='all') list = list.filter(u=> u.status===status)
    return list
  }, [query, role, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page-1)*pageSize, page*pageSize)

  return (
    <>
      <PageHeader title="Kullanıcı Yönetimi" breadcrumbs={[{ label: 'New Panel' }, { label: 'Kullanıcılar' }]} actionsRight={<button className="btn btn-primary">Yeni Kullanıcı</button>} />

      <div className="card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="input-icon" style={{ maxWidth: 260 }}>
            <span className="icon">🔎</span>
            <input className="form-control" placeholder="Ara (ad/telefon/email)" value={query} onChange={e=>{ setPage(1); setQuery(e.target.value) }} />
          </div>
          <select className="form-select" style={{ maxWidth: 220 }} value={role} onChange={e=>{ setPage(1); setRole(e.target.value as any) }}>
            <option value="all">Tüm Roller</option>
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin (Uygulama)</option>
            <option value="super_admin">Süper Admin</option>
          </select>
          <select className="form-select" style={{ maxWidth: 180 }} value={status} onChange={e=>{ setPage(1); setStatus(e.target.value as any) }}>
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="suspended">Askıda</option>
          </select>
          <div className="ms-auto d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary btn-sm">CSV</button>
            <button className="btn btn-outline-secondary btn-sm">PDF</button>
          </div>
        </div>
      </div>

      <div className="card p-0">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>ID</th><th>Ad Soyad</th><th>E-posta</th><th>Telefon</th><th>Rol</th><th>Durum</th><th>Bağış</th><th>Yayın</th><th>Oluşturulma</th><th></th>
              </tr>
            </thead>
            <tbody>
              {paged.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.role==='user' ? 'Kullanıcı' : (u.role==='admin' ? 'Admin (Uygulama)' : 'Süper Admin')}</td>
                  <td>{u.status==='active'? <span className="badge bg-success">Aktif</span> : <span className="badge bg-warning text-dark">Askıda</span>}</td>
                  <td>{u.donations}</td>
                  <td>{u.streams}</td>
                  <td>{u.createdAt}</td>
                  <td>
                    <div className="segmented">
                      <button className="seg-btn">Detay</button>
                      <button className="seg-btn">Rol</button>
                      <button className="seg-btn">Şifre</button>
                      {u.status==='active' ? (
                        <button className="seg-btn danger">Askıya Al</button>
                      ) : (
                        <button className="seg-btn success">Aktif Et</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex align-items-center justify-content-between p-3">
          <div className="text-muted small">Toplam {filtered.length} kayıt</div>
          <div className="btn-group">
            <button className="btn btn-sm btn-light" disabled={page===1} onClick={()=> setPage(p=> Math.max(1, p-1))}>Önceki</button>
            <span className="btn btn-sm btn-ghost disabled">{page}/{totalPages}</span>
            <button className="btn btn-sm btn-light" disabled={page===totalPages} onClick={()=> setPage(p=> Math.min(totalPages, p+1))}>Sonraki</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Users


