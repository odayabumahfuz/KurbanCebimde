import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'
import PageHeader from '../components/PageHeader'

type Kpis = { totalUsers: number; activeUsers: number; donationsCount: number; donationsAmount: number; upcomingStreams: number }
type Point = { date: string; value: number }

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<Kpis>({ totalUsers: 0, activeUsers: 0, donationsCount: 0, donationsAmount: 0, upcomingStreams: 0 })
  const [usersTrend7, setUsersTrend7] = useState<Point[]>([])
  const [donationsTrend7, setDonationsTrend7] = useState<Point[]>([])
  const [successTrend7, setSuccessTrend7] = useState<Point[]>([])

  useEffect(() => {
    // mock doldurma
    setKpis({ totalUsers: 12450, activeUsers: 312, donationsCount: 842, donationsAmount: 1823400, upcomingStreams: 5 })
    const gen = (n:number, max=100)=> Array.from({length:n}).map((_,i)=>({ date: String(i+1), value: Math.round(Math.random()*max) }))
    setUsersTrend7(gen(7, 120)) // günlük yeni kullanıcı
    setDonationsTrend7(gen(7, 1500)) // günlük bağış tutarı
    setSuccessTrend7(Array.from({length:7}).map((_,i)=>({ date: String(i+1), value: 60 + Math.round(Math.random()*35) }))) // %
  }, [])

  return (
    <>
      <PageHeader title="Genel Bakış" breadcrumbs={[{ label: 'New Panel' }, { label: 'Dashboard' }]} />

      {/* KPI Cards */}
      <div className="row g-3">
        <div className="col-6 col-xl-2">
          <div className="stat-card">
            <div>
              <div className="stat-title">Toplam Kullanıcı</div>
              <div className="stat-value">{kpis.totalUsers.toLocaleString('tr-TR')}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-2">
          <div className="stat-card">
            <div>
              <div className="stat-title">Aktif Kullanıcı</div>
              <div className="stat-value">{kpis.activeUsers.toLocaleString('tr-TR')}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-2">
          <div className="stat-card">
            <div>
              <div className="stat-title">Bağış (Adet)</div>
              <div className="stat-value">{kpis.donationsCount.toLocaleString('tr-TR')}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-2">
          <div className="stat-card">
            <div>
              <div className="stat-title">Bağış (Tutar)</div>
              <div className="stat-value">{(kpis.donationsAmount/100).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-2">
          <div className="stat-card">
            <div>
              <div className="stat-title">Beklenen Yayın</div>
              <div className="stat-value">{kpis.upcomingStreams}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3 mt-1">
        {/* Kullanıcı grafiği */}
        <div className="col-12 col-xl-6">
          <div className="card p-3">
            <div className="fw-semibold mb-2">Kullanıcı (7 gün)</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usersTrend7} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8"/>
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8"/>
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Bağış grafiği */}
        <div className="col-12 col-xl-6">
          <div className="card p-3">
            <div className="fw-semibold mb-2">Bağış (Tutar, 7 gün)</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={donationsTrend7} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="c_don" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8"/>
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8"/>
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#22c55e" fillOpacity={1} fill="url(#c_don)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Yayın başarı oranı */}
        <div className="col-12">
          <div className="card p-3">
            <div className="fw-semibold mb-2">Yayın Başarı Oranı (%, 7 gün)</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={successTrend7} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8"/>
                  <YAxis domain={[0,100]} tickFormatter={(v)=>`${v}%`} tick={{ fontSize: 12 }} stroke="#94a3b8"/>
                  <Tooltip formatter={(v)=>`${v}%`} />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Activity + Quick actions */}
      <div className="row g-3 mt-1">
        <div className="col-12 col-xl-8">
          <div className="card p-3">
            <div className="fw-semibold mb-2">Son Aktiviteler</div>
            <ul className="list-unstyled m-0 small">
              <li className="py-2 border-bottom">📷 Yeni medya yüklendi</li>
              <li className="py-2 border-bottom">💳 250₺ bağış işlendi</li>
              <li className="py-2">🔐 Admin giriş yaptı</li>
            </ul>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="card p-3 d-grid gap-2">
            <button className="btn btn-primary">Yeni Yayın Oluştur</button>
            <button className="btn btn-secondary">Kesim Görseli Yükle</button>
            <button className="btn btn-outline-secondary">Rapor İndir</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard


