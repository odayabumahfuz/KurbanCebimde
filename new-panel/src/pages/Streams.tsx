import React, { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'

type Stream = { id: string; title: string; room: string; status: 'scheduled'|'active'|'completed'; scheduledAt: string; views: number }

const initialStreams: Stream[] = Array.from({ length: 24 }).map((_,i)=> ({
  id: `S${1000+i}`,
  title: `Yayın ${i+1}`,
  room: `oda_${i+1}`,
  status: (['scheduled','active','completed'] as const)[i%3],
  scheduledAt: `2025-10-${(10 + (i%15)).toString().padStart(2,'0')} 1${i%10}:00`,
  views: Math.round(Math.random()*1200)
}))

const Streams: React.FC = () => {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all'|'scheduled'|'active'|'completed'>('all')
  const [page, setPage] = useState(1)
  const [streams, setStreams] = useState<Stream[]>(initialStreams)
  const [selected, setSelected] = useState<Stream | null>(null)
  const pageSize = 10

  const filtered = useMemo(()=>{
    let list = streams
    if (query) list = list.filter(s=> (s.title+s.room).toLowerCase().includes(query.toLowerCase()))
    if (status!=='all') list = list.filter(s=> s.status===status)
    return list
  }, [query, status, streams])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page-1)*pageSize, page*pageSize)

  const stopStream = (id: string) => {
    if (!confirm('Yayını durdurmak istiyor musunuz?')) return
    setStreams(prev => prev.map(s => s.id===id ? { ...s, status: 'completed' } : s))
  }
  const moveToHistory = (id: string) => {
    if (!confirm('Yayını geçmişe taşımak istiyor musunuz?')) return
    setStreams(prev => prev.map(s => s.id===id ? { ...s, status: 'completed' } : s))
  }
  const openViewer = (room: string) => {
    alert(`İzleme sadece admin panelde görüntüleme amaçlıdır. Oda: ${room}`)
  }

  return (
    <>
      <PageHeader title="Yayınlar" breadcrumbs={[{ label: 'New Panel' }, { label: 'Yayınlar' }]} subtitle="Admin panelde sadece izleme ve müdahale (durdur/taşı) yapılır" />

      <div className="card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <input className="form-control" placeholder="Ara (başlık/oda)" style={{ maxWidth: 240 }} value={query} onChange={e=>{ setPage(1); setQuery(e.target.value) }} />
          <select className="form-select" style={{ maxWidth: 180 }} value={status} onChange={e=>{ setPage(1); setStatus(e.target.value as any) }}>
            <option value="all">Tüm Durumlar</option>
            <option value="scheduled">Planlı</option>
            <option value="active">Aktif</option>
            <option value="completed">Tamamlandı</option>
          </select>
        </div>
      </div>

      <div className="card p-0">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>ID</th><th>Başlık</th><th>Oda</th><th>Durum</th><th>Planlanan</th><th>İzlenme</th><th></th>
              </tr>
            </thead>
            <tbody>
              {paged.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.title}</td>
                  <td>{s.room}</td>
                  <td>{s.status==='active' ? <span className="badge bg-success">Aktif</span> : s.status==='scheduled' ? <span className="badge bg-warning text-dark">Planlı</span> : <span className="badge bg-secondary">Tamamlandı</span>}</td>
                  <td>{s.scheduledAt}</td>
                  <td>{s.views}</td>
                  <td>
                    <div className="segmented">
                      <button className="seg-btn" onClick={()=> setSelected(s)}>Detay</button>
                      <button className="seg-btn" onClick={()=> openViewer(s.room)}>İzle</button>
                      {s.status==='active' && (
                        <button className="seg-btn danger" onClick={()=> stopStream(s.id)}>Durdur</button>
                      )}
                      {s.status!=='completed' && (
                        <button className="seg-btn" onClick={()=> moveToHistory(s.id)}>Geçmişe</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex align-items-center justify-content-between p-3">
          <div className="text-muted small">Toplam {filtered.length} yayın</div>
          <div className="btn-group">
            <button className="btn btn-sm btn-light" disabled={page===1} onClick={()=> setPage(p=> Math.max(1, p-1))}>Önceki</button>
            <span className="btn btn-sm btn-ghost disabled">{page}/{totalPages}</span>
            <button className="btn btn-sm btn-light" disabled={page===totalPages} onClick={()=> setPage(p=> Math.min(totalPages, p+1))}>Sonraki</button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="modal fade show" style={{ display:'block', background:'rgba(0,0,0,.5)' }} onClick={()=> setSelected(null)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e=> e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selected.title} • {selected.room}</h5>
                <button className="btn-close" onClick={()=> setSelected(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="stat-card"><div><div className="stat-title">Durum</div><div className="stat-value">{selected.status}</div></div></div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="stat-card"><div><div className="stat-title">İzlenme</div><div className="stat-value">{selected.views}</div></div></div>
                  </div>
                  <div className="col-12">
                    <div className="card p-3">
                      <div className="fw-semibold mb-2">Yayın Detayları</div>
                      <ul className="small m-0">
                        <li>Planlanan: {selected.scheduledAt}</li>
                        <li>Oda: {selected.room}</li>
                        <li>İlişkili medya/bağışlar: (placeholder)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={()=> setSelected(null)}>Kapat</button>
                <button className="btn btn-outline-secondary" onClick={()=> openViewer(selected.room)}>İzle</button>
                {selected.status==='active' && (<button className="btn btn-danger" onClick={()=> { stopStream(selected.id); setSelected(null) }}>Durdur</button>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Streams


