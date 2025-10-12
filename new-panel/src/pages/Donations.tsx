import React, { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'

type Donation = {
  id: string; donor: string; ref: string; amount: number; currency: string; status: 'pending'|'approved'|'cancelled';
  campaign: string; type: 'kurban'|'akika'|'genel'; channel: 'app'|'web'; createdAt: string
}

const seed: Donation[] = Array.from({ length: 73 }).map((_,i)=> ({
  id: `D${1000+i}`,
  donor: `Kullanıcı ${i+1}`,
  ref: `R${2000+i}`,
  amount: 100 + Math.round(Math.random()*1500),
  currency: 'TRY',
  status: (['pending','approved','cancelled'] as const)[i%3],
  campaign: i%2===0? 'Kurban 2025':'Genel Bağış',
  type: i%2===0? 'kurban':'genel',
  channel: i%3===0? 'app':'web',
  createdAt: '2025-10-08'
}))

const Donations: React.FC = () => {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all'|'pending'|'approved'|'cancelled'>('all')
  const [campaign, setCampaign] = useState<'all'|'Kurban 2025'|'Genel Bağış'>('all')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [channel, setChannel] = useState<'all'|'app'|'web'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(()=>{
    let list = seed
    if (query) list = list.filter(d=> (d.donor+d.ref).toLowerCase().includes(query.toLowerCase()))
    if (status!=='all') list = list.filter(d=> d.status===status)
    if (campaign!=='all') list = list.filter(d=> d.campaign===campaign)
    if (channel!=='all') list = list.filter(d=> d.channel===channel)
    if (minAmount) list = list.filter(d=> d.amount >= Number(minAmount)||0)
    if (maxAmount) list = list.filter(d=> d.amount <= Number(maxAmount)||Number.MAX_SAFE_INTEGER)
    return list
  }, [query, status, campaign, channel, minAmount, maxAmount])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page-1)*pageSize, page*pageSize)

  const totals = useMemo(()=>{
    const f = filtered
    const sum = f.reduce((acc, d)=> acc + d.amount, 0)
    const avg = f.length? Math.round(sum / f.length) : 0
    const byChannel = { app: f.filter(d=> d.channel==='app').length, web: f.filter(d=> d.channel==='web').length }
    return { count: f.length, sum, avg, byChannel }
  }, [filtered])

  return (
    <>
      <PageHeader title="Bağışlar" breadcrumbs={[{ label: 'New Panel' }, { label: 'Bağışlar' }]} />

      {/* Filters */}
      <div className="card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <input className="form-control" placeholder="Ara (donör/ref no)" style={{ maxWidth: 220 }} value={query} onChange={e=>{ setPage(1); setQuery(e.target.value) }} />
          <select className="form-select" style={{ maxWidth: 180 }} value={status} onChange={e=>{ setPage(1); setStatus(e.target.value as any) }}>
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Bekliyor</option>
            <option value="approved">Onaylandı</option>
            <option value="cancelled">İptal</option>
          </select>
          <select className="form-select" style={{ maxWidth: 180 }} value={campaign} onChange={e=>{ setPage(1); setCampaign(e.target.value as any) }}>
            <option value="all">Tüm Kampanyalar</option>
            <option value="Kurban 2025">Kurban 2025</option>
            <option value="Genel Bağış">Genel Bağış</option>
          </select>
          <select className="form-select" style={{ maxWidth: 160 }} value={channel} onChange={e=>{ setPage(1); setChannel(e.target.value as any) }}>
            <option value="all">Kanal</option>
            <option value="app">App</option>
            <option value="web">Web</option>
          </select>
          <input className="form-control" placeholder="Min ₺" style={{ width: 100 }} value={minAmount} onChange={e=>{ setPage(1); setMinAmount(e.target.value) }} />
          <input className="form-control" placeholder="Max ₺" style={{ width: 100 }} value={maxAmount} onChange={e=>{ setPage(1); setMaxAmount(e.target.value) }} />
          <div className="ms-auto d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary btn-sm">CSV</button>
            <button className="btn btn-outline-secondary btn-sm">PDF</button>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="row g-3 mb-2">
        <div className="col-6 col-lg-3"><div className="stat-card"><div><div className="stat-title">Toplam Adet</div><div className="stat-value">{totals.count}</div></div></div></div>
        <div className="col-6 col-lg-3"><div className="stat-card"><div><div className="stat-title">Toplam Tutar</div><div className="stat-value">{totals.sum.toLocaleString('tr-TR')} ₺</div></div></div></div>
        <div className="col-6 col-lg-3"><div className="stat-card"><div><div className="stat-title">Ortalama</div><div className="stat-value">{totals.avg.toLocaleString('tr-TR')} ₺</div></div></div></div>
        <div className="col-6 col-lg-3"><div className="stat-card"><div><div className="stat-title">Kanal (App/Web)</div><div className="stat-value">{totals.byChannel.app}/{totals.byChannel.web}</div></div></div></div>
      </div>

      {/* List */}
      <div className="card p-0">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>ID</th><th>Donör</th><th>Ref</th><th>Tutar</th><th>Durum</th><th>Kampanya/Tür</th><th>Kanal</th><th>Oluşturulma</th><th></th>
              </tr>
            </thead>
            <tbody>
              {paged.map(d => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.donor}</td>
                  <td>{d.ref}</td>
                  <td>{d.amount.toLocaleString('tr-TR')} {d.currency}</td>
                  <td>
                    {d.status==='approved' && <span className="badge bg-success">Onaylandı</span>}
                    {d.status==='pending' && <span className="badge bg-warning text-dark">Bekliyor</span>}
                    {d.status==='cancelled' && <span className="badge bg-danger">İptal</span>}
                  </td>
                  <td>{d.campaign} / {d.type}</td>
                  <td>{d.channel.toUpperCase()}</td>
                  <td>{d.createdAt}</td>
                  <td>
                    <div className="segmented">
                      <button className="seg-btn">Detay</button>
                      <button className="seg-btn">Makbuz PDF</button>
                      {d.status!=='approved' ? (
                        <button className="seg-btn success">Onayla</button>
                      ) : (
                        <button className="seg-btn danger">İptal</button>
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

export default Donations


