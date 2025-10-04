import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { rolesAPI, type PermissionMatrixEntry, type RoleKey } from '../lib/adminApi'
import { Save } from 'lucide-react'
import { RequireRoles } from '../components/RBAC'

const ALL_ROLES: RoleKey[] = ['owner','admin','publisher','viewer']

export default function RolesPage(){
  const [matrix, setMatrix] = useState<PermissionMatrixEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    (async()=>{
      try{
        setLoading(true)
        const res = await rolesAPI.getRoleMatrix()
        setMatrix(res.matrix || [])
      }catch(e:any){
        setError(e?.message || 'Yetki matrisi yüklenemedi')
      }finally{
        setLoading(false)
      }
    })()
  },[])

  function toggle(role: RoleKey, pageIdx: number, key: keyof PermissionMatrixEntry['permissions']){
    setMatrix(prev => prev.map((row, i)=>{
      if(i!==pageIdx) return row
      const set = new Set(row.permissions[key] || [])
      if(set.has(role)) set.delete(role); else set.add(role)
      return { ...row, permissions: { ...row.permissions, [key]: Array.from(set) as RoleKey[] } }
    }))
  }

  async function save(){
    try{
      setSaving(true)
      await rolesAPI.updateRoleMatrix({ matrix })
      alert('Yetki matrisi kaydedildi')
    }catch(e:any){
      alert(e?.message || 'Kaydedilemedi')
    }finally{
      setSaving(false)
    }
  }

  return (
    <Layout>
      <RequireRoles roles={['owner','admin']}>
        <div className="p-6 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roller & Yetkiler</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Sayfa × rol matrisi ile görünüm/oluşturma/güncelleme/silme yetkilerini yönet.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-4">{error}</div>
          )}

          {loading ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">Yükleniyor...</div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Sayfa</th>
                      {['view','create','update','delete'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {matrix.map((row, idx)=> (
                      <tr key={row.page} className="bg-white dark:bg-slate-800">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{row.page}</td>
                        {(['view','create','update','delete'] as const).map((k)=> (
                          <td key={k} className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              {ALL_ROLES.map(role => {
                                const active = (row.permissions[k]||[]).includes(role)
                                return (
                                  <button key={role} onClick={()=>toggle(role, idx, k)} className={`px-2 py-1 rounded-lg text-xs border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-slate-500 dark:text-slate-300 border-slate-300 dark:border-slate-700'}`}>
                                    {role}
                                  </button>
                                )
                              })}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                  <Save className="w-4 h-4" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          )}
        </div>
      </RequireRoles>
    </Layout>
  )
}


