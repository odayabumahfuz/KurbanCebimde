import React from 'react'

export function SkeletonRow(){
  return (
    <div className="animate-pulse flex items-center justify-between py-3">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
    </div>
  )
}

export function TableSkeleton({ rows = 8 }: { rows?: number }){
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      {Array.from({ length: rows }).map((_,i)=> (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}


