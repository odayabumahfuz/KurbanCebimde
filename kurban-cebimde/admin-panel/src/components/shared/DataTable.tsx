import React, { useEffect, useMemo, useRef, useState } from 'react'

export interface Column<T> {
  id: string
  header: string
  accessor: (row: T) => React.ReactNode
  width?: string
  hidden?: boolean
}

import * as XLSX from 'xlsx'

export function DataTable<T extends { id: string }>({ rows, columns, csvName }: { rows: T[]; columns: Column<T>[]; csvName?: string }){
  const [hiddenCols, setHiddenCols] = useState<string[]>([])
  const visibleCols = useMemo(()=> columns.filter(c=> !hiddenCols.includes(c.id)), [columns, hiddenCols])
  const [isColsOpen, setIsColsOpen] = useState(false)
  const colsRef = useRef<HTMLDivElement | null>(null)

  function toggleCol(id: string){
    setHiddenCols(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  }

  function exportXLSX(){
    const headers = visibleCols.map(c=> c.header)
    const data = rows.map(r => visibleCols.map(c => {
      const val = c.accessor(r)
      return typeof val === 'string' || typeof val === 'number' ? val : ''
    }))
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, `${csvName || 'export'}-${Date.now()}.xlsx`)
  }

  // Close on click outside & ESC
  useEffect(() => {
    function onDocClick(e: MouseEvent | TouchEvent){
      if (!colsRef.current) return
      if (e.target && colsRef.current && !colsRef.current.contains(e.target as Node)){
        setIsColsOpen(false)
      }
    }
    function onKey(e: KeyboardEvent){
      if (e.key === 'Escape') setIsColsOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('touchstart', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('touchstart', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur">
        <div className="text-sm text-slate-500">{rows.length} kayıt</div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={colsRef}>
            <button onClick={()=>setIsColsOpen(o=>!o)} className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">Kolonlar</button>
            {isColsOpen && (
              <div className="absolute right-0 mt-2 w-56 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2 space-y-1">
                {columns.map(col => (
                  <label key={col.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                    <input type="checkbox" checked={!hiddenCols.includes(col.id)} onChange={()=>toggleCol(col.id)} />
                    <span className="text-sm">{col.header}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <button onClick={exportXLSX} className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90">Excel</button>
        </div>
      </div>
      <div className="overflow-auto max-h-[70vh]">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
            <tr className="text-left text-xs uppercase text-slate-500">
              {visibleCols.map(col => (
                <th key={col.id} className="px-4 py-3 font-medium border-b border-slate-200 dark:border-slate-800" style={{ width: col.width }}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((row, idx) => (
              <tr key={row.id} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800'}>
                {visibleCols.map(col => (
                  <td key={col.id} className="px-4 py-3 align-middle">{col.accessor(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


