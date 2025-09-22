import { useAuthStore } from '../stores/authStore'
import { useState } from 'react'
import Layout from '../components/Layout'

export default function AdminProfilePage(){
  const { user } = useAuthStore()
  const [firstName, setFirst] = useState(user?.firstName || '')
  const [lastName, setLast] = useState(user?.lastName || '')
  const [phone, setPhone] = useState(user?.phoneNumber || '')
  const [email, setEmail] = useState(user?.email || '')

  return (
    <Layout>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-extrabold">Admin Profil</h1>
        <div className="grid grid-cols-2 gap-4 max-w-3xl">
          <div>
            <label className="text-sm font-medium">Ad</label>
            <input className="w-full border rounded px-3 py-2" value={firstName} onChange={e=>setFirst(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Soyad</label>
            <input className="w-full border rounded px-3 py-2" value={lastName} onChange={e=>setLast(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Telefon</label>
            <input className="w-full border rounded px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input className="w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
        </div>
        <div className="pt-2">
          <button className="bg-emerald-600 text-white rounded px-4 py-2">Kaydet</button>
        </div>
      </div>
    </Layout>
  )
}


