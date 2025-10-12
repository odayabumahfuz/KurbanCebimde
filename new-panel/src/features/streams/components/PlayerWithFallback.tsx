import React from 'react'
import type { Stream } from '../api'

export default function PlayerWithFallback({ stream }: { stream: Stream }){
  return (
    <div className="ratio ratio-16x9 bg-dark rounded" style={{ minHeight: 220 }}>
      <div className="d-flex w-100 h-100 align-items-center justify-content-center text-muted">
        <div>
          <div className="text-center small">Player placeholder</div>
          <div className="text-center text-muted small">WebRTC/HLS fallback otomatik bağlanacak</div>
        </div>
      </div>
    </div>
  )
}


