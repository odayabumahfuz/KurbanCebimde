// Stream types and lightweight mock API for the admin panel

export type StreamStatus = 'scheduled'|'prelive'|'live'|'paused'|'ended'|'error'

export type LiveMetricsSnapshot = {
  ts: string
  publisher?: { rttMs:number; packetLoss:number; bitrateKbps:number; fps?:number }
  viewersOnline: number
  cpuLoad?: number
}

export type Stream = {
  id: string
  title: string
  roomName: string
  status: StreamStatus
  scheduledAt?: string
  startedAt?: string
  endedAt?: string
  publisherId?: string
  metrics?: LiveMetricsSnapshot
  playback?: { hlsUrl?: string; mp4Url?: string; thumbUrl?: string }
  relations?: { donationIds?: string[]; mediaIds?: string[] }
  lastAlert?: { level:'info'|'warn'|'crit'; message:string; at:string }
}

export type Participant = {
  identity: string
  role: 'publisher'|'viewer'|'moderator'
  joinedAt: string
  tracks: { audio:boolean; video:boolean; screenshare?:boolean }
  metrics?: { rttMs:number; packetLoss:number; bitrateKbps:number }
}

// --------- Mock data ---------
const mock: Record<string, Stream> = Object.fromEntries(
  Array.from({ length: 6 }).map((_,i) => {
    const id = `S${1000+i}`
    const status: StreamStatus = (['scheduled','live','ended','scheduled','live','ended'] as StreamStatus[])[i]
    return [id, {
      id,
      title: `Yayın ${i+1}`,
      roomName: `oda_${i+1}`,
      status,
      scheduledAt: new Date(Date.now() + (i-2)*3600_000).toISOString(),
      startedAt: status!=='scheduled' ? new Date(Date.now()-3600_000).toISOString() : undefined,
      endedAt: status==='ended' ? new Date(Date.now()-600_000).toISOString() : undefined,
      metrics: { ts: new Date().toISOString(), viewersOnline: 12+i, publisher: { rttMs: 120+i*10, packetLoss: 1+i, bitrateKbps: 1800+i*50, fps: 30 } },
      playback: { hlsUrl: 'https://example.com/stream.m3u8', thumbUrl: '' },
      relations: { donationIds: [], mediaIds: [] },
    } as Stream]
  })
)

export async function getStream(id: string): Promise<Stream> {
  await delay(150)
  return structuredClone(mock[id] || Object.values(mock)[0])
}

export async function getParticipants(id: string): Promise<Participant[]> {
  await delay(150)
  const base = Date.now()-1800_000
  return [
    { identity: 'publisher_1', role:'publisher', joinedAt: new Date(base).toISOString(), tracks:{ audio:true, video:true }, metrics:{ rttMs:110, packetLoss:1.2, bitrateKbps:2000 } },
    { identity: 'viewer_a', role:'viewer', joinedAt: new Date(base+60_000).toISOString(), tracks:{ audio:true, video:true }, metrics:{ rttMs:160, packetLoss:2.1, bitrateKbps:1200 } },
    { identity: 'viewer_b', role:'viewer', joinedAt: new Date(base+120_000).toISOString(), tracks:{ audio:true, video:false }, metrics:{ rttMs:190, packetLoss:3.5, bitrateKbps:600 } },
  ]
}

export async function getMetrics(id: string): Promise<LiveMetricsSnapshot> {
  await delay(120)
  return { ts: new Date().toISOString(), viewersOnline: 20+Math.round(Math.random()*10), publisher:{ rttMs: 130+Math.round(Math.random()*70), packetLoss: Math.round(Math.random()*10), bitrateKbps: 1500+Math.round(Math.random()*800), fps: 30 } }
}

export function subscribeStreamRealtime(id: string, onEvent: (ev:any)=>void) {
  const t = setInterval(async ()=> {
    const m = await getMetrics(id)
    onEvent({ type:'stream.metrics.tick', metrics: m })
  }, 3000)
  return ()=> clearInterval(t)
}

// moderate / recording actions - mocked
export async function moderate(id: string, action: string, extra?: any) {
  await delay(150)
  return { ok: true, action, extra }
}
export async function recording(id: string, action: 'start'|'stop') {
  await delay(150)
  return { ok: true, action }
}

function delay(ms:number){ return new Promise(r=> setTimeout(r, ms)) }


