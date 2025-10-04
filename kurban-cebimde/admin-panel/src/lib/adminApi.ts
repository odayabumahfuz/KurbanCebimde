// Admin API client
// API Base URL: .env üzerinden gelmezse domain'e göre fallback
const RAW_ENV_BASE = (import.meta as any).env?.VITE_API_BASE || (import.meta as any).env?.VITE_API_BASE_URL;
const USE_PROXY = ((import.meta as any).env?.VITE_PROXY ?? '0') === '1';
const ADMIN_API_PREFIX = '/admin/v1';

// Ortam algılama: local geliştirmede origin'i kullan
const ORIGIN = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : undefined;
const isLocalOrigin = (() => {
  try { if (!ORIGIN) return false; const h = new URL(ORIGIN).hostname; return h === 'localhost' || h === '127.0.0.1'; } catch { return false }
})();

function buildApiBaseFrom(raw?: string): string | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  try {
    let base = raw.trim();
    if (!/\/api(\/|$)/.test(base)) {
      base = base.replace(/\/?$/, '') + '/api';
    }
    if (!base.endsWith(ADMIN_API_PREFIX)) {
      base = base.replace(/\/?$/, '') + ADMIN_API_PREFIX;
    }
    return base;
  } catch {
    return undefined;
  }
}

// API base seçimi: local + proxy açık ise origin üzerinden /api proxy, değilse env veya localhost backend
const API_BASE_URL = (isLocalOrigin && ORIGIN && USE_PROXY)
  ? `${ORIGIN}/api${ADMIN_API_PREFIX}`
  : (buildApiBaseFrom(RAW_ENV_BASE) || `http://localhost:8000/api${ADMIN_API_PREFIX}`);

console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 VITE_PROXY:', import.meta.env.VITE_PROXY);

export interface AdminLoginRequest {
  phoneOrEmail: string;
  password: string;
  otp_code?: string;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  user?: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    role: string;
  };
}

// YENİ: Metrics Summary interface
export interface MetricsSummary {
  total_users: number;
  active_users: number;
  donations_sum_7d: number;
  active_broadcasts: number;
}

// YENİ: User Summary interface
export interface UserSummary {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email?: string;
  is_verified: boolean;
  created_at: string;
}

// YENİ: Users Response interface
export interface UsersResponse {
  items: UserSummary[];
  total: number;
  page: number;
  size: number;
}

// YENİ: Donation Summary interface
export interface DonationSummary {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
}

// YENİ: Donations Response interface
export interface DonationsResponse {
  items: DonationSummary[];
  total: number;
  page: number;
  size: number;
}

export interface DashboardData {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  total_streams: number;
  active_streams: number;
  recent_orders: Array<{
    id: string;
    user_name: string;
    user_surname: string;
    user_phone: string;
    total_amount: number;
    status: string;
    created_at: string;
    payment_status: string;
  }>;
  recent_users: Array<{
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    is_verified: boolean;
    total_donations: number;
    last_donation_at?: string;
    created_at: string;
  }>;
  updated_at: string;
}

class AdminApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private adminPanelActive: boolean | null = null;

  constructor() {
    // Local storage'dan token'ları yükle
    this.accessToken = localStorage.getItem('admin_access_token');
    this.refreshToken = localStorage.getItem('admin_refresh_token');
    
    // Admin panel durumunu kontrol et
    this.checkAdminPanelStatus();
    
    // GEÇİCİ ÇÖZÜM: Token yoksa otomatik olarak ekle
    if (!this.accessToken) {
      console.log('🔧 Token yok, otomatik olarak ekleniyor...');
      // Hardcoded token kaldırıldı - gerçek login gerekli
      console.log('⚠️ Token yok! Lütfen login yapın.');
    }
    
    console.log('🔧 AdminApi constructor:');
    console.log('  - accessToken yüklendi:', !!this.accessToken);
    console.log('  - refreshToken yüklendi:', !!this.refreshToken);
    console.log('  - localStorage admin_access_token:', localStorage.getItem('admin_access_token') ? 'var' : 'yok');
  }

  private async checkAdminPanelStatus(): Promise<void> {
    try {
      console.log('🔍 Admin panel durumu kontrol ediliyor...');
      const response = await fetch('/admin/', { 
        method: 'HEAD',
        timeout: 3000 // 3 saniye timeout
      } as any);
      
      this.adminPanelActive = response.ok;
      console.log('📊 Admin panel durumu:', this.adminPanelActive ? '✅ Aktif' : '❌ Pasif');
    } catch (error) {
      console.log('⚠️ Admin panel kontrolü başarısız, backend kullanılacak:', error);
      this.adminPanelActive = false;
    }
  }

  private getApiBaseUrl(): string {
    // Eğer localStorage'da sabit bir API varsa onu kullan (debug için)
    const override = localStorage.getItem('ADMIN_API_BASE');
    const base = (override && /^https?:\/\//.test(override)) ? override : API_BASE_URL;
    console.log('🎯 API Base URL kullanılıyor:', base);
    return base;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Login endpoint'i için token kontrolü yapma
    if (endpoint === '/auth/login' || endpoint === '/auth/refresh') {
      console.log('🔐 Login/Refresh endpoint, token kontrolü atlanıyor');
    } else if (!this.accessToken) {
      console.log('🚫 Token yok! API çağrısı engellendi:', endpoint);
      throw new Error('No authentication token available');
    }

    const baseUrl = this.getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    console.log('🚀 API request yapılıyor:', url);
    console.log('  - Method:', options.method || 'GET');
    console.log('  - Headers:', options.headers);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      console.log('  - Authorization header eklendi');
    } else {
      console.log('  - ⚠️ Authorization header yok!');
    }

    try {
      console.log('📡 Fetch çağrısı yapılıyor...');
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      console.log('📥 Response status:', response.status);
      console.log('  - Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 401) {
        console.log('🔐 401 Unauthorized - token refresh deneniyor...');
        // Token expired, refresh deneyelim
        if (this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            console.log('✅ Token refresh başarılı, request tekrarlanıyor...');
            // Retry with new token
            headers['Authorization'] = `Bearer ${this.accessToken}`;
            const retryResponse = await fetch(url, {
              ...options,
              headers,
            });
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
            if (retryResponse.status === 401) {
              console.log('❌ Retry da 401 döndü. Zorunlu logout.');
              // Zorunlu logout: tokenları temizle ve login'e yönlendir
              this.accessToken = null;
              this.refreshToken = null;
              localStorage.removeItem('admin_access_token');
              localStorage.removeItem('admin_refresh_token');
              if (typeof window !== 'undefined') {
                window.location.replace('/admin/login');
              }
              throw new Error('Authentication failed');
            }
          }
        }
        // Refresh başarısızsa: tokenları temizle ve login'e yönlendir
        console.log('❌ Token refresh başarısız. Çıkış yapılıyor.');
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        if (typeof window !== 'undefined') {
          window.location.replace('/admin/login');
        }
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ HTTP error:', response.status, errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      // 204 No Content
      if (response.status === 204) {
        console.log('✅ No content (204)');
        return undefined as unknown as T;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        console.log('✅ JSON data alındı');
        return data as T;
      }

      // JSON değilse metni oku ve daha anlamlı hata ver
      const text = await response.text();
      const snippet = (text || '').slice(0, 200);
      if (/<!doctype/i.test(text) || /<html/i.test(text)) {
        throw new Error(`Expected JSON, received HTML from ${url}. Muhtemel neden: dev proxy kapalı veya API_BASE yanlış. Lokal için: 'npm run dev:local' ile VITE_PROXY=1 çalıştır ya da VITE_API_BASE'i backend'e ayarla (örn: http://localhost:8000/api${ADMIN_API_PREFIX}). Body: ${snippet}...`);
      }
      try {
        return JSON.parse(text) as T;
      } catch {
        throw new Error(`Unexpected response (content-type: ${contentType || 'unknown'}). Body: ${snippet}...`);
      }
    } catch (error: any) {
      console.error('❌ API request failed:', error);
      // Ağ hatasıysa ve proxy aktifse bir kere origin'e fallback yap
      if (USE_PROXY && typeof window !== 'undefined' && ORIGIN) {
        try {
          const altBase = `${ORIGIN}/api${ADMIN_API_PREFIX}`;
          if (!url.startsWith(altBase)) {
            console.log('🌐 Ağ hatası - origin fallback deneniyor:', altBase);
            const altResp = await fetch(`${altBase}${endpoint}`, { ...options, headers });
            if (altResp.ok) {
              return await altResp.json();
            }
          }
        } catch (e) {
          console.log('🌐 Origin fallback da başarısız:', e);
        }
      }
      throw error;
    }
  }

  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    console.log('🔐 API login çağrısı yapılıyor...', credentials);
    
    try {
      const response = await this.request<AdminLoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      console.log('✅ API response alındı:', response);

      // Token'ları kaydet
      this.accessToken = response.access_token;
      // DÜZELTME: refresh token'ı doğru kaydet
      this.refreshToken = (response as any).refresh_token || null;
      localStorage.setItem('admin_access_token', response.access_token);
      if ((response as any).refresh_token) {
        localStorage.setItem('admin_refresh_token', (response as any).refresh_token);
      }

      console.log('✅ Token\'lar kaydedildi');
      console.log('  - accessToken:', this.accessToken ? this.accessToken.substring(0, 20) + '...' : 'null');
      console.log('  - refreshToken:', this.refreshToken ? this.refreshToken.substring(0, 20) + '...' : 'null');
      return response;
    } catch (error) {
      console.error('❌ API login hatası:', error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      console.log('❌ Refresh token yok!');
      return false;
    }

    try {
      console.log('🔄 Token refresh deneniyor...');
      const baseUrl = this.getApiBaseUrl();
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        if (data.refresh_token) {
          this.refreshToken = data.refresh_token;
          localStorage.setItem('admin_refresh_token', data.refresh_token);
        }
        localStorage.setItem('admin_access_token', data.access_token);
        console.log('✅ Token refresh başarılı');
        return true;
      } else {
        console.log('❌ Token refresh başarısız:', response.status);
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
    }

    return false;
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        console.log('🚪 Logout API çağrısı yapılıyor...');
        await this.request('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('❌ Logout failed:', error);
    } finally {
      // Token'ları temizle
      console.log('🧹 Token\'lar temizleniyor...');
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      console.log('✅ Logout tamamlandı');
    }
  }

  // YENİ: Metrics Summary endpoint
  async getMetricsSummary(): Promise<MetricsSummary> {
    console.log('📊 Metrics summary alınıyor...');
    return this.request<MetricsSummary>('/metrics/summary');
  }

  // YENİ: Users endpoint (yeni format)
  async getUsers(params: {
    search?: string;
    page?: number;
    size?: number;
  } = {}): Promise<UsersResponse> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      const endpoint = queryString ? `/users?${queryString}` : '/users';
      
      return this.request<UsersResponse>(endpoint);
    } catch (error) {
      throw error;
    }
  }

  // YENİ: Donations endpoint (yeni format)
  async getDonations(params: {
    from?: string;
    to?: string;
    status?: string;
    page?: number;
    size?: number;
  } = {}): Promise<any> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      const endpoint = queryString ? `/donations?${queryString}` : '/donations';
      
      return this.request<DonationsResponse>(endpoint);
    } catch (error) {
      throw error;
    }
  }

  async getDonation(id: string){
    return this.request(`/donations/${id}`)
  }
  async refundDonation(id: string, note?: string){
    return this.request(`/donations/${id}/refund`, { method:'POST', body: JSON.stringify({ note }) })
  }
  async linkDonationToBroadcast(id: string, broadcastId: string){
    return this.request(`/donations/${id}/broadcast`, { method:'PATCH', body: JSON.stringify({ broadcastId }) })
  }

  // Dashboard endpoints (eski format - geriye uyumluluk)
  async getDashboard(): Promise<DashboardData> {
    return this.request<DashboardData>('/dashboard');
  }

  async getUserStats() {
    return this.request('/dashboard/users/stats');
  }

  async getOrderStats() {
    return this.request('/dashboard/orders/stats');
  }

  // User management endpoints (eski format - geriye uyumluluk)
  async getUsersOld(params: {
    page?: number;
    page_size?: number;
    query?: string;
    role?: string;
    verified?: boolean;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return this.request(endpoint);
  }

  async createUser(userData: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }) {
    try {
      return this.request('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<{
    name: string;
    surname: string;
    email: string;
    phone: string;
    roles: string[];
  }>) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async toggleUserStatus(userId: string) {
    return this.request(`/users/${userId}/toggle-status`, {
      method: 'POST',
    });
  }

  // Order management endpoints
  async getOrders(params: {
    page?: number;
    page_size?: number;
    status?: string;
    region?: string;
    date_from?: string;
    date_to?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    
    return this.request(endpoint);
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Cart management endpoints
  async getCarts(params: {
    page?: number;
    size?: number;
    status?: string;
    user_id?: string;
  } = {}) {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      const endpoint = queryString ? `/carts?${queryString}` : '/carts';
      
      return this.request(endpoint);
    } catch (error) {
      throw error;
    }
  }

  async getCart(cartId: string) {
    return this.request(`/carts/${cartId}`);
  }

  async updateCartStatus(cartId: string, status: string) {
    return this.request(`/carts/${cartId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // Stream management endpoints
  async getStreams(params: {
    page?: number;
    page_size?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  } = {}) {
    // Backend'den stream listesi al
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/streams?${queryString}` : '/streams';
    
    try {
      return this.request(endpoint, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Stream listesi alınamadı:', error);
      throw error;
    }
  }

  async startStream(streamId: string) {
    return this.request(`/streams/${streamId}/start`, {
      method: 'POST',
    });
  }

  async stopStream(streamId: string) {
    return this.request(`/streams/${streamId}/stop`, {
      method: 'POST',
    });
  }

  // YENİ: Stats endpoint
  async getStats(): Promise<any> {
    try {
      return await this.request('/stats');
    } catch (error) {
      console.error('Stats alınamadı:', error);
      // Fallback data
      return {
        data: {
          totalDonations: 0,
          activeStreams: 0,
          totalUsers: 0
        }
      };
    }
  }

  // Donation stats endpoint (alias for getStats)
  async getDonationStats(): Promise<any> {
    return this.getStats();
  }

  // --- New Live admin endpoints (aligned with spec) ---
  async createLive(payload: { kurban_id: string; scheduled_at?: string; quality_profile?: 'low'|'standard'|'high'; auto_record?: boolean; channel?: string }) {
    return this.request(`${ADMIN_API_PREFIX.replace('/api/admin/v1','')}/admin/live`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async startLive(id: string) {
    return this.request(`${ADMIN_API_PREFIX.replace('/api/admin/v1','')}/admin/live/${id}/start`, { method: 'POST' });
  }

  async stopLive(id: string) {
    return this.request(`${ADMIN_API_PREFIX.replace('/api/admin/v1','')}/admin/live/${id}/stop`, { method: 'POST' });
  }

  async recordingLive(id: string, action: 'start'|'stop') {
    return this.request(`${ADMIN_API_PREFIX.replace('/api/admin/v1','')}/admin/live/${id}/recording/${action}`, { method: 'POST' });
  }

  async notifyLive(id: string, payload?: { template_id?: string; targets?: string[] }) {
    return this.request(`${ADMIN_API_PREFIX.replace('/api/admin/v1','')}/admin/live/${id}/notify`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  async getLiveList(params: { status?: string; kurban_id?: string; admin_id?: string; q?: string; page?: number } = {}) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v])=>{ if(v!==undefined) sp.append(k, String(v)) });
    const qs = sp.toString();
    return this.request(`${ADMIN_API_PREFIX.replace('/api/admin/v1','')}/admin/live${qs?`?${qs}`:''}`);
  }

  async getLiveDetail(id: string) {
    return this.request(`${ADMIN_API_PREFIX.replace('/api/admin/v1','')}/admin/live/${id}`);
  }

  // Certificate endpoints
  async generateCertificate(orderId: string, template: string = 'default') {
    return this.request(`/certificates/${orderId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ template }),
    });
  }

  async getCertificate(orderId: string) {
    return this.request(`/certificates/${orderId}`);
  }

  // Audit logs
  async getAuditLogs(params: {
    page?: number;
    page_size?: number;
    actor?: string;
    entity?: string;
    action?: string;
    date_from?: string;
    date_to?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/audit?${queryString}` : '/audit';
    
    return this.request(endpoint);
  }

  // --- Media endpoints (review, package, publish) ---
  async listMedia(params: { status?: string; donationId?: string } = {}): Promise<{ items: any[] }> {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) sp.append(k, String(v)); });
    const qs = sp.toString();
    return this.request(`/media${qs ? `?${qs}` : ''}`);
  }

  async reviewMedia(assetId: string, action: 'approve' | 'reject', note?: string): Promise<any> {
    return this.request(`/media/${assetId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, note }),
    });
  }

  async createMediaPackage(donationId: string, title: string, note?: string): Promise<{ packageId: string; status: string }> {
    return this.request(`/media-packages`, {
      method: 'POST',
      body: JSON.stringify({ donationId, title, note }),
    });
  }

  async addMediaPackageItems(packageId: string, mediaAssetIds: string[], positions?: number[]): Promise<any> {
    return this.request(`/media-packages/${packageId}/items`, {
      method: 'POST',
      body: JSON.stringify({ mediaAssetIds, positions }),
    });
  }

  async updateMediaPackage(packageId: string, status: 'published' | 'draft'): Promise<any> {
    return this.request(`/media-packages/${packageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Notifications
  async sendNotification(payload: { template: string; variables?: Record<string,string>; targets?: string[]; channel?: 'push'|'sms'|'email' }){
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }
  async getNotifications(params: { page?: number; size?: number } = {}){
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k,v])=>{ if(v!==undefined) sp.append(k, String(v)) })
    const qs = sp.toString()
    return this.request(`/notifications${qs?`?${qs}`:''}`)
  }

  // Utility methods
  isAuthenticated(): boolean {
    console.log('🔍 Admin authentication kontrolü:');
    console.log('  - accessToken var mı:', !!this.accessToken);
    console.log('  - accessToken değeri:', this.accessToken ? this.accessToken.substring(0, 20) + '...' : 'null');
    console.log('  - localStorage token:', localStorage.getItem('admin_access_token') ? 'var' : 'yok');
    
    // Token varsa ama localStorage'da yoksa, localStorage'dan yükle
    if (!this.accessToken) {
      const storedToken = localStorage.getItem('admin_access_token');
      if (storedToken) {
        console.log('🔄 Token localStorage\'dan yükleniyor...');
        this.accessToken = storedToken;
        return true;
      }
    }
    
    // GEÇİCİ ÇÖZÜM: Token yoksa streams sayfasına git ama API çağrılarını engelle
    if (!this.accessToken) {
      console.log('⚠️ Token yok! Login sayfasına yönlendirilecek...');
      return false; // Login sayfasına yönlendir
    }
    
    const isAuth = !!this.accessToken;
    console.log('  - Sonuç:', isAuth ? '✅ Authenticated' : '❌ Not authenticated');
    return isAuth;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUserPermissions(): string[] {
    // Token'dan permissions'ları parse et
    // Bu basit implementasyon, gerçek uygulamada JWT decode yapılmalı
    return [];
  }

  hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }
}

// Singleton instance
export const adminApi = new AdminApiClient();

// Types are already exported above

// Streams management endpoints - using public methods
export const streamsAPI = {
  // Get all streams (admin)
  getStreams: async (params = {}) => {
    return adminApi.getStreams(params);
  },
  
  // Get specific stream (admin)
  getStream: async (streamId: string) => {
    return adminApi.getStreams({ streamId });
  },
  
  // Create stream (admin)
  createStream: async (streamData: { title: string; description?: string; donation_id?: string; duration_seconds?: number }) => {
    return adminApi.request('/streams/create', {
      method: 'POST',
      body: JSON.stringify(streamData),
    });
  },
  
  // Start stream (admin)
  startStream: async (streamId: string) => {
    return adminApi.startStream(streamId);
  },
  
  // Stop stream (admin)
  stopStream: async (streamId: string) => {
    return adminApi.stopStream(streamId);
  }
};

// --- Roles & Permissions (RBAC) ---
export type RoleKey = 'owner' | 'admin' | 'publisher' | 'viewer'
export interface PermissionMatrixEntry {
  page: string
  permissions: {
    view: RoleKey[]
    create?: RoleKey[]
    update?: RoleKey[]
    delete?: RoleKey[]
  }
}

export const rolesAPI = {
  async getRoles(): Promise<{ roles: RoleKey[] }> {
    return (adminApi as any).request('/roles', { method: 'GET' })
  },
  async getRoleMatrix(): Promise<{ matrix: PermissionMatrixEntry[] }> {
    return (adminApi as any).request('/roles/matrix', { method: 'GET' })
  },
  async updateRoleMatrix(payload: { matrix: PermissionMatrixEntry[] }): Promise<{ success: boolean }>{
    return (adminApi as any).request('/roles/matrix', { method: 'POST', body: JSON.stringify(payload) })
  },
  async assignUserRole(userId: string, role: RoleKey){
    return (adminApi as any).request(`/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) })
  }
}
