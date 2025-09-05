// Admin API client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const ADMIN_API_PREFIX = '/api/admin/v1';

export interface AdminLoginRequest {
  username: string;
  password: string;
  otp_code?: string;
}

export interface AdminLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    roles: Array<{
      id: string;
      name: string;
      description?: string;
      permissions: string[];
    }>;
    permissions: string[];
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

  constructor() {
    // Local storage'dan token'ları yükle
    this.accessToken = localStorage.getItem('admin_access_token');
    this.refreshToken = localStorage.getItem('admin_refresh_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${ADMIN_API_PREFIX}${endpoint}`;
    console.log('API request yapılıyor:', url, options);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      console.log('Fetch çağrısı yapılıyor...');
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      console.log('Response status:', response.status);

      if (response.status === 401) {
        // Token expired, refresh deneyelim
        if (this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry with new token
            headers['Authorization'] = `Bearer ${this.accessToken}`;
            const retryResponse = await fetch(url, {
              ...options,
              headers,
            });
            
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
        }
        
        // Refresh failed, logout
        this.logout();
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    console.log('API login çağrısı yapılıyor...', credentials);
    
    try {
      const response = await this.request<AdminLoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      console.log('API response alındı:', response);

      // Token'ları kaydet
      this.accessToken = response.access_token;
      this.refreshToken = response.refresh_token;
      localStorage.setItem('admin_access_token', response.access_token);
      localStorage.setItem('admin_refresh_token', response.refresh_token);

      console.log('Token\'lar kaydedildi');
      return response;
    } catch (error) {
      console.error('API login hatası:', error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}${ADMIN_API_PREFIX}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        localStorage.setItem('admin_access_token', data.access_token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await this.request('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Token'ları temizle
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
    }
  }

  // YENİ: Metrics Summary endpoint
  async getMetricsSummary(): Promise<MetricsSummary> {
    return this.request<MetricsSummary>('/metrics/summary');
  }

  // YENİ: Users endpoint (yeni format)
  async getUsers(params: {
    search?: string;
    page?: number;
    size?: number;
  } = {}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return this.request<UsersResponse>(endpoint);
  }

  // YENİ: Donations endpoint (yeni format)
  async getDonations(params: {
    from?: string;
    to?: string;
    status?: string;
    page?: number;
    size?: number;
  } = {}): Promise<DonationsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/donations?${queryString}` : '/donations';
    
    return this.request<DonationsResponse>(endpoint);
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
    roles: string[];
  }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
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
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/carts?${queryString}` : '/carts';
    
    return this.request(endpoint);
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
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/streams?${queryString}` : '/streams';
    
    return this.request(endpoint);
  }

  async startStream(orderId: string, notes?: string) {
    return this.request('/streams/start', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, notes }),
    });
  }

  async stopStream(streamId: string, notes?: string) {
    return this.request('/streams/stop', {
      method: 'POST',
      body: JSON.stringify({ stream_id: streamId, notes }),
    });
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

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
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

// Export types
export type { 
  AdminLoginRequest, 
  AdminLoginResponse, 
  DashboardData,
  MetricsSummary,
  UserSummary,
  UsersResponse,
  DonationSummary,
  DonationsResponse
};
