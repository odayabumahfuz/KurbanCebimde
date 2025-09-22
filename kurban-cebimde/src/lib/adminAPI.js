// Mobile Admin API client
import Constants from 'expo-constants';

// Force local server IP for development
const API_BASE_URL = 'http://185.149.103.247:8000';

class AdminAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Admin endpoint'leri için token ekle
    if (this.token && (endpoint.includes('/admin/') || endpoint.includes('/live/'))) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Donations
  async getDonations(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      
      const queryString = searchParams.toString();
      const endpoint = queryString ? `/api/admin/v1/donations?${queryString}` : '/api/admin/v1/donations';
      
      return await this.request(endpoint);
    } catch (error) {
      console.error('Donations alınamadı:', error);
      throw error;
    }
  }

  // Stats
  async getStats() {
    try {
      // Backend'de stats endpoint'i yok, gerçek verilerden hesapla
      const donations = await this.getDonations();
      const streams = await this.getStreams();
      
      return {
        data: {
          totalDonations: donations?.items?.length || 0,
          activeStreams: donations?.items?.length || 0,
          totalStreams: streams?.items?.length || 0,
          totalUsers: 0 // Users endpoint'i ayrı gerekli
        }
      };
    } catch (error) {
      console.error('Stats alınamadı:', error);
      throw error;
    }
  }

  // Stream management
  async createStream(donationId, durationSeconds = 90) {
    try {
      return await this.request('/api/admin/v1/streams/create', {
        method: 'POST',
        body: JSON.stringify({
          title: `Kurban Kesimi - ${donationId}`,
          description: 'Kurban kesimi canlı yayını',
          donation_id: donationId,
          duration_seconds: durationSeconds
        }),
      });
    } catch (error) {
      console.error('Stream oluşturulamadı:', error);
      throw error;
    }
  }

  // Yeni fonksiyon: Kullanıcı için stream oluştur
  async createStreamForUser(userId, streamData) {
    try {
      return await this.request('/api/admin/v1/streams/create-for-user', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          title: streamData.title,
          description: streamData.description,
          duration_seconds: 120
        }),
      });
    } catch (error) {
      console.error('Kullanıcı için stream oluşturulamadı:', error);
      throw error;
    }
  }

  async startStream(streamId) {
    try {
      return await this.request(`/api/admin/v1/streams/${streamId}/start`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Stream başlatılamadı:', error);
      throw error;
    }
  }

  async stopStream(streamId) {
    try {
      return await this.request(`/api/admin/v1/streams/${streamId}/stop`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Stream durdurulamadı:', error);
      throw error;
    }
  }

  async endStream(streamId) {
    try {
      return await this.request(`/api/admin/v1/streams/${streamId}/end`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Stream sonlandırılamadı:', error);
      throw error;
    }
  }

  async getStreams() {
    try {
      return await this.request('/api/admin/v1/streams');
    } catch (error) {
      console.error('Streams alınamadı:', error);
      // Fallback data
      return {
        items: []
      };
    }
  }

  async deleteStream(streamId) {
    try {
      return await this.request(`/api/admin/v1/streams/${streamId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Stream silinemedi:', error);
      throw error;
    }
  }
}

export default new AdminAPI();
