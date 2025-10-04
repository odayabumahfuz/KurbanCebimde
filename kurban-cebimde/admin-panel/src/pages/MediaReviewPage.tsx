import React, { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../lib/adminApi';

export default function MediaReviewPage() {
  const [status, setStatus] = useState<'uploaded' | 'review' | 'approved' | 'rejected' | 'all'>('uploaded');
  const [donationId, setDonationId] = useState<string>('');
  const [mime, setMime] = useState<'all'|'image'|'video'>('all');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  async function load() {
    setLoading(true);
    try {
      const params: any = {};
      if (status && status !== 'all') params.status = status;
      if (donationId) params.donationId = donationId;
      if (mime !== 'all') params.mime = mime === 'image' ? 'image' : 'video';
      const res = await adminApi.listMedia(params);
      setItems(res.items || []);
      setSelected({});
      setSelectAll(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status, donationId, mime]);

  async function handleReview(assetId: string, action: 'approve' | 'reject') {
    await adminApi.reviewMedia(assetId, action);
    await load();
  }

  const selectedIds = useMemo(()=> Object.entries(selected).filter(([,v])=>v).map(([k])=>k), [selected]);

  async function handleBulk(action: 'approve'|'reject'){
    if (selectedIds.length === 0) return;
    if (!confirm(action === 'approve' ? `${selectedIds.length} öğeyi onayla?` : `${selectedIds.length} öğeyi reddet?`)) return;
    try{
      setBulkLoading(true)
      // Sıralı basit istekler
      for (const id of selectedIds){
        await adminApi.reviewMedia(id, action, action==='reject'?rejectNote:undefined)
      }
      setRejectNote('')
      await load()
      alert('İşlem tamam')
    }catch(e:any){
      alert(e?.message || 'İşlem başarısız')
    }finally{
      setBulkLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Medya İnceleme</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="border p-2 rounded">
          <option value="all">Tümü</option>
          <option value="uploaded">Yüklendi</option>
          <option value="review">İncelemede</option>
          <option value="approved">Onaylı</option>
          <option value="rejected">Reddedildi</option>
        </select>
        <select value={mime} onChange={(e)=>setMime(e.target.value as any)} className="border p-2 rounded">
          <option value="all">Tüm MIME</option>
          <option value="image">Görsel</option>
          <option value="video">Video</option>
        </select>
        <input placeholder="donationId" className="border p-2 rounded" value={donationId} onChange={(e)=>setDonationId(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={load} disabled={loading}>Yenile</button>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={selectAll} onChange={(e)=>{
            const v = e.target.checked; setSelectAll(v); const next: Record<string,boolean> = {}; (items||[]).forEach(it=> next[it.id]=v); setSelected(next)
          }}/>
          Tümünü seç ({selectedIds.length})
        </label>
        <button disabled={bulkLoading || selectedIds.length===0} onClick={()=>handleBulk('approve')} className="px-3 py-1.5 rounded bg-green-600 text-white disabled:opacity-50">Seçili Onayla</button>
        <button disabled={bulkLoading || selectedIds.length===0} onClick={()=>handleBulk('reject')} className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-50">Seçili Reddet</button>
        {selectedIds.length>0 && (
          <input placeholder="Red notu (opsiyonel)" value={rejectNote} onChange={(e)=>setRejectNote(e.target.value)} className="border p-2 rounded flex-1 min-w-[200px]" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it)=> (
          <div key={it.id} className="border rounded p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>{it.mime || it.mime_type}</div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!selected[it.id]} onChange={(e)=> setSelected(prev=> ({ ...prev, [it.id]: e.target.checked }))} />
                Seç
              </label>
            </div>
            <div className="font-semibold break-all cursor-pointer" onClick={()=>setDetail(it)} title="Detay">
              {it.storage_key || it.preview_url || it.id}
            </div>
            <div className="mt-2 flex gap-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={()=>handleReview(it.id, 'approve')}>Onayla</button>
              <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={()=>handleReview(it.id, 'reject')}>Reddet</button>
              <button className="bg-zinc-700 text-white px-3 py-1 rounded" onClick={()=>setDetail(it)}>Detay</button>
            </div>
          </div>
        ))}
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={()=>setDetail(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-2xl border border-zinc-200 dark:border-zinc-800" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Medya Detayı</h2>
              <button className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800" onClick={()=>setDetail(null)}>Kapat</button>
            </div>
            <div className="space-y-3">
              {String(detail.mime||detail.mime_type).startsWith('image/') && detail.preview_url ? (
                <img src={detail.preview_url} alt="preview" className="w-full rounded-lg" />
              ) : (
                <div className="p-4 rounded bg-zinc-100 dark:bg-zinc-800 text-sm">Önizleme yok</div>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-zinc-500">ID:</span> {detail.id}</div>
                <div><span className="text-zinc-500">Donation:</span> {detail.donationId || detail.donation_id || '-'}</div>
                <div><span className="text-zinc-500">MIME:</span> {detail.mime || detail.mime_type}</div>
                <div><span className="text-zinc-500">Durum:</span> {detail.status}</div>
                <div><span className="text-zinc-500">Oluşturma:</span> {detail.createdAt || detail.created_at}</div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={()=>handleReview(detail.id, 'approve')}>Onayla</button>
                <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={()=>handleReview(detail.id, 'reject')}>Reddet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


