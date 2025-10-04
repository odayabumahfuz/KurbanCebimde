import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../lib/adminApi';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function MediaPackagePage() {
  const q = useQuery();
  const navigate = useNavigate();
  const [donationId, setDonationId] = useState<string>(q.get('donationId') || '');
  const [title, setTitle] = useState<string>('Kurban Kesim Medya Paketi');
  const [note, setNote] = useState<string>('Allah kabul etsin.');
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const selectedCount = useMemo(()=> Object.values(selected).filter(Boolean).length, [selected]);

  async function load() {
    if (!donationId) return;
    setLoading(true);
    try {
      const res = await adminApi.listMedia({ status: 'approved', donationId });
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); }, [donationId]);

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function move(id: string, dir: -1 | 1) {
    setItems((arr) => {
      const idx = arr.findIndex((x) => x.id === id);
      if (idx < 0) return arr;
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return arr;
      const copy = arr.slice();
      const tmp = copy[idx];
      copy[idx] = copy[to];
      copy[to] = tmp;
      return copy;
    });
  }

  async function handlePublish() {
    if (!donationId) return alert('donationId gerekli');
    const chosen = items.filter((x) => selected[x.id]);
    if (chosen.length === 0) return alert('En az 1 medya seç');
    setPublishing(true);
    try {
      const created = await adminApi.createMediaPackage(donationId, title, note);
      const packageId = created.packageId;
      const mediaIds = chosen.map((x) => x.id);
      const positions = chosen.map((_, i) => i);
      await adminApi.addMediaPackageItems(packageId, mediaIds, positions);
      await adminApi.updateMediaPackage(packageId, 'published');
      alert('Paket yayınlandı');
      navigate('/admin/dashboard');
    } catch (e: any) {
      alert(e?.message || 'Paket yayınlanamadı');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Medya Paketleme</h1>
        <button className="text-sm underline" onClick={()=>navigate('/admin/media')}>İnceleme sayfası</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm mb-1">Donation ID</label>
          <input value={donationId} onChange={(e)=>setDonationId(e.target.value)} className="border p-2 rounded w-full" placeholder="donation uuid" />
        </div>
        <div>
          <label className="block text-sm mb-1">Başlık</label>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block text-sm mb-1">Not</label>
          <input value={note} onChange={(e)=>setNote(e.target.value)} className="border p-2 rounded w-full" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button className="bg-gray-100 px-3 py-2 rounded border" onClick={load} disabled={loading}>{loading ? 'Yükleniyor...' : 'Onaylı Medyaları Yükle'}</button>
        <button className="bg-zinc-200 px-3 py-2 rounded border" onClick={()=>{
          const next: Record<string, boolean> = {}; (items||[]).forEach(it=> next[it.id] = true); setSelected(next);
        }} disabled={items.length===0}>Hepsini Seç</button>
        <button className="bg-zinc-200 px-3 py-2 rounded border" onClick={()=> setSelected({})} disabled={selectedCount===0}>Temizle</button>
        <span className="text-sm text-zinc-500">Seçili: {selectedCount}</span>
        <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={handlePublish} disabled={publishing || loading}>Paketle ve Yayınla</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} className={`border rounded p-3 ${selected[it.id] ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!selected[it.id]} onChange={()=>toggle(it.id)} />
                <span className="text-sm text-gray-700 truncate max-w-[200px]" title={it.storage_key}>{it.mime_type}</span>
              </label>
              <div className="flex items-center gap-2">
                <button className="text-sm px-2 py-1 border rounded" onClick={()=>move(it.id, -1)}>Yukarı</button>
                <button className="text-sm px-2 py-1 border rounded" onClick={()=>move(it.id, +1)}>Aşağı</button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 break-all">{it.storage_key}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


