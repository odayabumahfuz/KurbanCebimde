// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API Client
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(username: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.token = data.access_token;
    localStorage.setItem('auth_token', data.access_token);
    return data;
  }

  async register(userData: {
    email?: string;
    phone: string;
    first_name: string;
    last_name: string;
    password: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: number) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: number, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id: number) {
    return this.request(`/orders/${id}`);
  }

  async updateOrder(id: number, orderData: any) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  // Certificates
  async getCertificates() {
    return this.request('/certificates');
  }

  async getCertificate(id: number) {
    return this.request(`/certificates/${id}`);
  }

  async generateCertificate(orderId: number) {
    return this.request(`/certificates/generate`, {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  }

  // File Upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/upload/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  // WebSocket Connection
  createWebSocketConnection(userId?: number) {
    const wsUrl = userId 
      ? `ws://localhost:8000/api/v1/ws/${userId}`
      : 'ws://localhost:8000/api/v1/ws/admin';
    
    return new WebSocket(wsUrl);
  }

  // Logout
  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL);

// API Endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
  users: {
    list: '/users',
    detail: (id: number) => `/users/${id}`,
    create: '/users',
    update: (id: number) => `/users/${id}`,
    delete: (id: number) => `/users/${id}`,
  },
  orders: {
    list: '/orders',
    detail: (id: number) => `/orders/${id}`,
    create: '/orders',
    update: (id: number) => `/orders/${id}`,
    delete: (id: number) => `/orders/${id}`,
  },
  certificates: {
    list: '/certificates',
    detail: (id: number) => `/certificates/${id}`,
    generate: '/certificates/generate',
  },
  upload: {
    upload: '/upload/upload',
    files: '/upload/files',
    file: (filename: string) => `/upload/files/${filename}`,
  },
  websocket: {
    user: (userId: number) => `/ws/${userId}`,
    admin: '/ws/admin',
    status: '/ws/connections/status',
  },
};
