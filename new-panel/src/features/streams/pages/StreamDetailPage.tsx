import React, { useEffect, useState } from 'react'
import PageHeader from '../../../components/PageHeader'
import StreamHeader from '../components/StreamHeader'
import PlayerWithFallback from '../components/PlayerWithFallback'
import { getStream, getParticipants, subscribeStreamRealtime, type Stream, type Participant, type LiveMetricsSnapshot } from '../api'

export default function StreamDetailPage({ id = 'S1000' }: { id?: string }){
  const [stream, setStream] = useState<Stream | null>(null)
  const [metrics, setMetrics] = useState<LiveMetricsSnapshot | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [tab, setTab] = useState<'overview'|'participants'|'media'|'analytics'|'emergency'>('overview')

  useEffect(()=> { (async()=>{ setStream(await getStream(id)); setParticipants(await getParticipants(id)) })() }, [id])
  useEffect(()=> {
    const unsub = subscribeStreamRealtime(id, (ev)=>{
      if (ev.type === 'stream.metrics.tick') setMetrics(ev.metrics)
    })
    return unsub
  }, [id])

  return (
    <>
      <PageHeader title="Yayın Detayı" breadcrumbs={[{ label: 'New Panel', href: '/' }, { label: 'Yayınlar', href: '/streams' }, { label: id }]} />
      {stream && (
        <StreamHeader
          stream={{ ...stream, metrics }}
          onPreview={()=> alert('Ön izleme (mock)')}
          onUpdatePlan={()=> alert('Plan güncelle (mock)')}
          onEmergency={()=> setTab('emergency')}
          onRecordingToggle={()=> alert('Kayıt toggle (mock)')}
          onSendMessage={()=> alert('Mesaj gönderildi (mock)')}
          onEnd={()=> alert('Yayın bitir (mock)')}
          onOpenRecords={()=> alert('Kayıtlar açıldı (mock)')}
          onMoveToHistory={()=> alert('Geçmişe taşındı (mock)')}
          onShare={()=> navigator.clipboard?.writeText('https://example.com/share').then(()=> alert('Link kopyalandı'))}
        />
      )}

      <div className="card p-3 mb-3">
        <div className="btn-group">
          <button className={`btn btn-sm ${tab==='overview'?'btn-primary':'btn-light'}`} onClick={()=> setTab('overview')}>Genel</button>
          <button className={`btn btn-sm ${tab==='participants'?'btn-primary':'btn-light'}`} onClick={()=> setTab('participants')}>Katılımcılar</button>
          <button className={`btn btn-sm ${tab==='media'?'btn-primary':'btn-light'}`} onClick={()=> setTab('media')}>Medya</button>
          <button className={`btn btn-sm ${tab==='analytics'?'btn-primary':'btn-light'}`} onClick={()=> setTab('analytics')}>Analitik</button>
          <button className={`btn btn-sm ${tab==='emergency'?'btn-primary':'btn-light'}`} onClick={()=> setTab('emergency')}>Acil Müdahale</button>
        </div>
      </div>

      {tab==='overview' && (
        <div className="row g-3">
          <div className="col-12"><PlayerWithFallback stream={stream as any} /></div>
          <div className="col-12 col-lg-3"><div className="stat-card"><div><div className="stat-title">Ağ Sağlığı</div><div className="stat-value">{healthTag(metrics)}</div></div></div></div>
          <div className="col-12 col-lg-3"><div className="stat-card"><div><div className="stat-title">RTT</div><div className="stat-value">{metrics?.publisher?.rttMs ?? '--'} ms</div></div></div></div>
          <div className="col-12 col-lg-3"><div className="stat-card"><div><div className="stat-title">Loss</div><div className="stat-value">{metrics?.publisher?.packetLoss ?? '--'}%</div></div></div></div>
          <div className="col-12 col-lg-3"><div className="stat-card"><div><div className="stat-title">Bitrate</div><div className="stat-value">{metrics?.publisher?.bitrateKbps ?? '--'} kbps</div></div></div></div>
          <div className="col-12"><div className="card p-3"><div className="fw-semibold mb-2">Zaman Çizgisi</div><div className="text-muted small">Planlanan: {stream?.scheduledAt} • Başlangıç: {stream?.startedAt || '-'} • Bitiş: {stream?.endedAt || '-'}</div></div></div>
          <div className="col-12"><div className="card p-3"><div className="fw-semibold mb-2">Son Uyarılar</div><div className="text-muted small">(placeholder) Packet loss yüksek vb.</div></div></div>
          {stream?.status!=='live' && (
            <div className="col-12"><div className="card p-3"><div className="fw-semibold mb-2">Pre-live Kontrol</div><ul className="small m-0"><li>Mikrofon/Kamera izinleri</li><li>Ağ testi</li><li>Başlık/thumbnail kontrol</li><li>Bildirimler gönderildi</li></ul></div></div>
          )}
        </div>
      )}

      {tab==='participants' && (
        <div className="card p-3">
          <div className="fw-semibold mb-2">Katılımcılar</div>
          <div className="table-responsive">
            <table className="table mb-0"><thead><tr><th>ID</th><th>Rol</th><th>Giriş</th><th>Audio</th><th>Video</th><th>Bitrate</th><th>RTT</th><th>Loss</th></tr></thead>
            <tbody>
              {participants.map(p=> (
                <tr key={p.identity}><td>{p.identity}</td><td>{p.role}</td><td>{new Date(p.joinedAt).toLocaleTimeString('tr-TR')}</td><td>{p.tracks.audio?'✓':'-'}</td><td>{p.tracks.video?'✓':'-'}</td><td>{p.metrics?.bitrateKbps ?? '-'} kbps</td><td>{p.metrics?.rttMs ?? '-'} ms</td><td>{p.metrics?.packetLoss ?? '-'}%</td></tr>
              ))}
            </tbody></table>
          </div>
        </div>
      )}

      {tab==='media' && (
        <div className="card p-3">
          <div className="text-muted">Player & medya ilişkilendirme burada olacak.</div>
        </div>
      )}

      {tab==='analytics' && (
        <div className="card p-3">
          <div className="text-muted">İzleyici grafikleri ve metrikler burada olacak.</div>
        </div>
      )}

      {tab==='emergency' && (
        <div className="card p-3">
          <div className="grid gap-2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))' }}>
            <button className="btn btn-danger">Yayını Bitir</button>
            <button className="btn btn-outline-danger">Odayı Yeniden Başlat</button>
            <button className="btn btn-outline-secondary">Publisher Token Yenile</button>
            <button className="btn btn-outline-secondary">Yedek Yayına Geç</button>
            <button className="btn btn-outline-secondary">Kayıt Başlat</button>
            <button className="btn btn-outline-secondary">Kayıt Durdur</button>
            <button className="btn btn-outline-secondary">Banner Mesaj Gönder</button>
          </div>
        </div>
      )}
    </>
  )
}

function healthTag(m?: LiveMetricsSnapshot | null){
  const rtt = m?.publisher?.rttMs ?? 0
  const loss = m?.publisher?.packetLoss ?? 0
  if (!rtt && !loss) return '--'
  if (rtt < 200 && loss < 5) return 'İyi'
  if (rtt < 400 && loss < 10) return 'Orta'
  return 'Kötü'
}


