import React, { useState } from 'react'
import Layout from '../components/Layout'
import { adminApi } from '../lib/adminApi'

export default function MediaUploadPage(){
  const [file, setFile] = useState<File|null>(null)
  const [donationId, setDonationId] = useState('')
  const [status, setStatus] = useState<string>('')

  async function handleUpload(){
    if(!file || !donationId){ setStatus('Dosya ve bağış ID gerekli'); return }
    try{
      setStatus('Upload URL alınıyor...')
      const mimeType = file.type || 'application/octet-stream'
      const presign = await (adminApi as any).request('/media/upload-url', { method:'POST', body: JSON.stringify({ donationId, mimeType, sizeBytes: file.size }) })
      const putUrl = presign.uploadUrl as string
      setStatus('Yükleniyor...')
      const put = await fetch(putUrl, { method:'PUT', headers: { 'Content-Type': mimeType }, body: file })
      if(!put.ok) throw new Error('Upload PUT başarısız')
      setStatus('Commit ediliyor...')
      await (adminApi as any).request('/media/commit', { method:'POST', body: JSON.stringify({ storageKey: presign.storageKey, donationId, mimeType, sizeBytes: file.size }) })
      setStatus('Tamamlandı')
      alert('Medya yüklendi')
    }catch(e:any){ setStatus(e?.message||'Hata') }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Medya Yükleme</h1>
        <div className="flex gap-3 items-center">
          <input className="border px-3 py-2 rounded" placeholder="Bağış ID" value={donationId} onChange={e=>setDonationId(e.target.value)} />
          <input className="border px-3 py-2 rounded" type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
          <button onClick={handleUpload} className="px-4 py-2 rounded bg-blue-600 text-white">Yükle</button>
        </div>
        <div className="text-sm text-slate-400">{status}</div>
      </div>
    </Layout>
  )
}
