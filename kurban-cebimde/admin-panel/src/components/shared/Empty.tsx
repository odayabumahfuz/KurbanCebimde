import React from 'react'

export function Empty({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }){
  return (
    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{title}</p>
      {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}


