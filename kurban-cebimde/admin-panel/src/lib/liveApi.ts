const API_BASE = window.location.origin + '/api/v1';

export const liveAPI = {
  async create(kurban_id: string) {
    const res = await fetch(`${API_BASE}/live/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kurban_id })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Stream oluşturulamadı');
    }
    return res.json();
  },
  
  async getToken(role: string, channel: string) {
    const res = await fetch(`${API_BASE}/live/token?role=${role}&channel=${channel}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Token alınamadı');
    }
    return res.json();
  },
  
  async start(stream_id: string) {
    const res = await fetch(`${API_BASE}/live/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stream_id })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Stream başlatılamadı');
    }
    return res.json();
  },
  
  async stop(stream_id: string) {
    const res = await fetch(`${API_BASE}/live/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stream_id })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Stream durdurulamadı');
    }
    return res.json();
  }
};

export default liveAPI;


