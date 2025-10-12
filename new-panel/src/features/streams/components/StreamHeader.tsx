import React from 'react'
import type { Stream, LiveMetricsSnapshot } from '../api'

type Props = {
  stream: Stream & { metrics?: LiveMetricsSnapshot }
  onPreview?: () => void
  onUpdatePlan?: () => void
  onEmergency?: () => void
  onRecordingToggle?: () => void
  onSendMessage?: () => void
  onEnd?: () => void
  onOpenRecords?: () => void
  onMoveToHistory?: () => void
  onShare?: () => void
}

export default function StreamHeader({ stream, onPreview, onUpdatePlan, onEmergency, onRecordingToggle, onSendMessage, onEnd, onOpenRecords, onMoveToHistory, onShare }: Props){
  const badge = (
    stream.status === 'live' ? <span className="badge bg-success">live</span>
    : stream.status === 'prelive' ? <span className="badge bg-warning text-dark">prelive</span>
    : stream.status === 'scheduled' ? <span className="badge bg-secondary">scheduled</span>
    : stream.status === 'ended' ? <span className="badge bg-dark">ended</span>
    : <span className="badge bg-danger">error</span>
  )

  return (
    <div className="card p-3 mb-3">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="min-w-0">
          <div className="fw-semibold text-truncate">{stream.title} {badge}</div>
          <div className="text-muted small">{stream.roomName} • Planlanan: {stream.scheduledAt || '-'} • Başladı: {stream.startedAt || '-'} • Bitti: {stream.endedAt || '-'}</div>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {stream.status==='scheduled' || stream.status==='prelive' ? (
            <>
              <button className="btn btn-outline-secondary btn-sm" onClick={onPreview}>Ön İzleme</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={onUpdatePlan}>Planı Güncelle</button>
            </>
          ) : null}
          {stream.status==='live' ? (
            <>
              <button className="btn btn-danger btn-sm" onClick={onEmergency}>Acil Müdahale</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={onRecordingToggle}>Kayıt Başlat/Durdur</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={onSendMessage}>Mesaj Gönder</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={onEnd}>Yayını Bitir</button>
            </>
          ) : null}
          {stream.status==='ended' ? (
            <>
              <button className="btn btn-outline-secondary btn-sm" onClick={onOpenRecords}>Kayıtları Aç</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={onMoveToHistory}>Geçmişe Taşı</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={onShare}>Paylaşılabilir Link</button>
            </>
          ) : null}
        </div>
      </div>
      <div className="d-flex align-items-center gap-3 mt-2 small text-muted">
        <div>RTT: <strong>{stream.metrics?.publisher?.rttMs ?? '--'} ms</strong></div>
        <div>Loss: <strong>{stream.metrics?.publisher?.packetLoss ?? '--'}%</strong></div>
        <div>Bitrate: <strong>{stream.metrics?.publisher?.bitrateKbps ?? '--'} kbps</strong></div>
      </div>
    </div>
  )
}


