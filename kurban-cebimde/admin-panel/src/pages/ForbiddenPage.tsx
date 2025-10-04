import React from 'react'
import { ShieldAlert } from 'lucide-react'
import Layout from '../components/Layout'

export default function ForbiddenPage(){
  return (
    <Layout>
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">403 - Yetkin yok</h1>
          <p className="text-zinc-400 mb-6">Bu sayfayı görüntülemek için gerekli role sahip değilsin.</p>
          <a href="/admin/dashboard" className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700">Dashboard'a dön</a>
        </div>
      </div>
    </Layout>
  )
}


