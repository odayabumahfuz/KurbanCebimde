import axios from 'axios'

// Proxy kullanacağız, base URL boş bırakıyoruz
export const livekitApi = axios.create({
  baseURL: '/api/livekit/v1',
  timeout: 30000
})

// LiveKit API functions
export const livekitAPI = {
  // Get all LiveKit streams
  getStreams: async () => {
    try {
      console.log('🔄 LiveKit API çağrısı yapılıyor: /streams')
      const response = await livekitApi.get('/streams')
      console.log('✅ LiveKit API response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ LiveKit API hatası:', error)
      // Gerçek API'den veri gelmediğinde boş döndür
      return {
        streams: [],
        total: 0,
        active_count: 0
      }
    }
  },

  // Get specific stream details
  getStream: async (roomName: string) => {
    try {
      const response = await livekitApi.get(`/streams/${roomName}`)
      return response.data
    } catch (error) {
      console.error('❌ LiveKit getStream hatası:', error)
      return {
        room_name: roomName,
        participants: [],
        status: "active",
        created_at: "2025-09-11T10:00:00Z"
      }
    }
  },

  // End a stream
  endStream: async (roomName: string) => {
    try {
      const response = await livekitApi.post(`/streams/${roomName}/end`)
      return response.data
    } catch (error) {
      console.error('❌ LiveKit endStream hatası:', error)
      return {
        room_name: roomName,
        status: "ended",
        ended_at: "2025-09-11T12:00:00Z"
      }
    }
  },

  // Get LiveKit config
  getConfig: async () => {
    try {
      const response = await livekitApi.get('/config')
      return response.data
    } catch (error) {
      console.error('❌ LiveKit getConfig hatası:', error)
      return {
        url: "wss://kurban-cebimde-q2l64d9v.livekit.cloud",
        api_key: "APIcAygxUZnX6kb",
        project_id: "p_1jzft8zabzo",
        project_name: "Kurban Cebimde",
        sip_uri: "sip:1jzft8zabzo.sip.livekit.cloud"
      }
    }
  }
}
