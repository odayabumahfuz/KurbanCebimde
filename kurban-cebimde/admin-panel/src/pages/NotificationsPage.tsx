import { useEffect, useState } from 'react'
import { Bell, Plus, Edit, Trash2, Send } from 'lucide-react'
import { adminApi } from '../lib/adminApi'

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [template, setTemplate] = useState('Medya paketiniz hazır')
  const [variables, setVariables] = useState<Record<string,string>>({ name: '', packageTitle: '', broadcastTime: '' })
  const [targets, setTargets] = useState('')
  const [channel, setChannel] = useState<'push'|'sms'|'email'>('push')
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function loadLogs(){
    try{
      const res = await adminApi.getNotifications({ page: 1, size: 20 })
      setLogs(res?.items || [])
    }catch(e){
      // noop
    }
  }
  useEffect(()=>{ loadLogs() },[])

  async function sendTest(){
    try{
      setLoading(true)
      await adminApi.sendNotification({
        template,
        variables,
        targets: targets.split(',').map(s=>s.trim()).filter(Boolean),
        channel,
      })
      alert('Test bildirimi gönderildi')
      await loadLogs()
    }catch(e:any){
      alert(e?.message || 'Gönderilemedi')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page header */}
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#111827'
        }}>Bildirim Yönetimi</h1>
        <p style={{
          color: '#6b7280',
          marginTop: '0.25rem'
        }}>
          Kullanıcılara SMS, email ve push bildirimleri gönderin
        </p>
      </div>

      {/* Actions bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          <Plus style={{ height: '1rem', width: '1rem' }} />
          Yeni Bildirim
        </button>

        <button onClick={sendTest} disabled={loading} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          opacity: loading ? 0.6 : 1
        }}>
          <Send style={{ height: '1rem', width: '1rem' }} />
          Test Gönder
        </button>

        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Bildirimlerde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Tüm Bildirimler</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
          <option value="push">Push</option>
        </select>
      </div>

      {/* Template form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '.75rem' }}>Şablon</div>
          <select value={template} onChange={e=>setTemplate(e.target.value)} style={{ width:'100%', padding: '.5rem', border:'1px solid #d1d5db', borderRadius:'.5rem' }}>
            <option>Medya paketiniz hazır</option>
            <option>Yayınız başlıyor</option>
            <option>İade tamamlandı</option>
          </select>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem', marginTop:'.75rem' }}>
            <input placeholder="{name}" value={variables.name} onChange={e=>setVariables(v=>({ ...v, name: e.target.value }))} style={{ padding: '.5rem', border:'1px solid #d1d5db', borderRadius:'.5rem' }}/>
            <input placeholder="{packageTitle}" value={variables.packageTitle} onChange={e=>setVariables(v=>({ ...v, packageTitle: e.target.value }))} style={{ padding: '.5rem', border:'1px solid #d1d5db', borderRadius:'.5rem' }}/>
            <input placeholder="{broadcastTime}" value={variables.broadcastTime} onChange={e=>setVariables(v=>({ ...v, broadcastTime: e.target.value }))} style={{ padding: '.5rem', border:'1px solid #d1d5db', borderRadius:'.5rem' }}/>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '.75rem' }}>Hedefler ve Kanal</div>
          <input placeholder="userId1,userId2" value={targets} onChange={e=>setTargets(e.target.value)} style={{ width:'100%', padding: '.5rem', border:'1px solid #d1d5db', borderRadius:'.5rem' }} />
          <div style={{ display:'flex', gap:'.5rem', marginTop:'.75rem' }}>
            <label><input type="radio" checked={channel==='push'} onChange={()=>setChannel('push')} /> Push</label>
            <label><input type="radio" checked={channel==='sms'} onChange={()=>setChannel('sms')} /> SMS</label>
            <label><input type="radio" checked={channel==='email'} onChange={()=>setChannel('email')} /> Email</label>
          </div>
        </div>
      </div>

      {/* Notifications list */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151'
          }}>Son Bildirimler</h3>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {/* Render logs */}
          {(logs||[]).length === 0 ? (
            <div style={{ textAlign:'center', color:'#6b7280' }}>Henüz bildirim kaydı yok</div>
          ) : (
            (logs||[]).map((n:any)=> (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                  <div style={{ background:'#3b82f6', borderRadius:'50%', padding:'.5rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Bell style={{ height:'1rem', width:'1rem', color:'#fff' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize:'1rem', fontWeight:600, color:'#111827', marginBottom:'.25rem' }}>{n.template}</h4>
                    <p style={{ fontSize:'.875rem', color:'#6b7280', marginBottom:'.25rem' }}>{n.status || 'queued'}</p>
                    <span style={{ fontSize:'.75rem', color:'#9ca3af' }}>{new Date(n.createdAt||n.created_at||Date.now()).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                  <div style={{ fontSize:'.75rem', color:'#6b7280' }}>{Array.isArray(n.targets) ? n.targets.length : 0} hedef</div>
                  <button onClick={async()=>{ try{ await adminApi.sendNotification({ template: n.template, variables: n.variables||{}, targets: n.targets||[], channel: n.channel||'push' }); alert('Yeniden gönderildi'); await loadLogs() }catch(e:any){ alert(e?.message||'Gönderilemedi') } }} style={{ padding:'.5rem .75rem', background:'#0ea5e9', color:'#fff', border:'none', borderRadius:'.375rem', fontSize:'.75rem' }}>Yeniden Gönder</button>
                </div>
              </div>
            ))
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: '#6b7280'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Bell style={{
                height: '2rem',
                width: '2rem',
                margin: '0 auto 0.5rem',
                color: '#d1d5db'
              }} />
              <p style={{ fontSize: '0.875rem' }}>Henüz başka bildirim bulunmuyor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
