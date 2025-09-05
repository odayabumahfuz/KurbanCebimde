import axios from 'axios';
import { Platform, NativeModules } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const scriptURL = NativeModules.SourceCode?.scriptURL || '';
const METRO_HOST = scriptURL.split('://')[1]?.split(':')[0];
const EXPO_HOST = (Constants?.expoConfig?.hostUri || Constants?.manifest?.debuggerHost || '').split(':')[0];
const EXPLICIT_BASE = process.env.EXPO_PUBLIC_API_BASE; // örn: http://192.168.1.107:8000

const DEV_BASE = (() => {
  if (EXPLICIT_BASE) return EXPLICIT_BASE;
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  const host = EXPO_HOST || METRO_HOST;
  if (!host) {
    console.warn('⚠️ METRO_HOST/EXPO_HOST yok, iOS için 127.0.0.1 kullanılıyor. İstersen EXPO_PUBLIC_API_BASE ile override et.');
  }
  return `http://${host || '127.0.0.1'}:8000`;
})();

const BASE = __DEV__ ? DEV_BASE : 'https://api.kurbancebimde.com';

console.log('🔗 API BASE =', `${BASE}/api/v1`);

export const api = axios.create({
  baseURL: `${BASE}/api/v1`,
  timeout: 60000 // 60 saniye timeout
});

// Request interceptor - her istekte token ekle
api.interceptors.request.use(
  async (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Token varsa header'a ekle (SecureStore kullan)
    try {
      const token = await SecureStore.getItemAsync('access');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token eklendi');
      }
    } catch (error) {
      console.error('Token alınamadı:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

function logAxiosError(err) {
  const e = err?.toJSON?.() ?? err;
  const dbg = {
    message: e?.message,
    code: e?.code,
    method: err?.config?.method,
    url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
    baseURL: err?.config?.baseURL,
    dataSent: err?.config?.data,
    status: err?.response?.status,
    statusText: err?.response?.statusText,
    respHeaders: err?.response?.headers,
    respData: err?.response?.data,
    raw: err?.request?._response,   // iOS RN'de raw gövde burada olur
    platform: Platform.OS,
  };
  // Tek satır ve çok satır — her ikisini de bas:
  console.log("❌ API Response Error:", JSON.stringify(dbg, null, 2));
}

// Response interceptor - 401 gelirse refresh token dene
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    // Detaylı error logging
    try { logAxiosError(error); } catch {}
    
    const status = error?.response?.status;
    if (status === 401) {
      try {
        const refresh = await SecureStore.getItemAsync('refresh');
        if (!refresh) throw error;
        
        // Refresh token ile yeni access token al
        const { data } = await api.post('/auth/refresh', { refresh_token: refresh });
        await SecureStore.setItemAsync('access', data.access_token);
        
        // Orijinal isteği tekrarla
        error.config.headers.Authorization = `Bearer ${data.access_token}`;
        return api.request(error.config);
      } catch (refreshError) {
        // Refresh başarısız, kullanıcıyı logout yap
        console.error('Refresh token hatası:', refreshError);
        await SecureStore.deleteItemAsync('access');
        await SecureStore.deleteItemAsync('refresh');
        // TODO: AuthContext'e logout event'i gönder
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: async (userData) => {
    try {
      const payload = { 
        name: userData.name, 
        surname: userData.surname, 
        phone: userData.phone, 
        email: userData.email || null, 
        password: userData.password 
      };
      const res = await api.post("/auth/register", payload, {
        headers: { "Content-Type": "application/json" },
      });

      // İstersen burada zorla kontrol et
      if (res.status >= 400) {
        console.log("⚠️ REGISTER_NON_2XX", res.status, res.data);
        throw new Error(`HTTP ${res.status}`);
      }

      console.log("✅ REGISTER_OK", res.status, res.data);
      return res.data;

    } catch (err) {
      // Artık interceptor detay bastı; burada sadece kullanıcıya mesaj ver
      throw new Error("Kayıt yapılamadı");
    }
  },
  
  login: async (credentials) => {
    try {
      // Backend JSON bekliyor
      let phone = credentials?.username || credentials?.phone || '';
      
      // Telefon numarasını temizle (boşlukları kaldır)
      if (phone) {
        phone = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
      }
      
      const payload = {
        phone: phone,
        password: credentials?.password || ''
      };

      const res = await api.post('/auth/login', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const raw = res?.data ?? {};
      const access = raw.access_token || raw.accessToken || raw.token || raw?.data?.access_token || raw?.data?.accessToken;
      const refresh = raw.refresh_token || raw.refreshToken || raw?.data?.refresh_token || raw?.data?.refreshToken || null;

      if (!access) {
        console.log('⚠️ LOGIN_UNEXPECTED_RESPONSE', res?.status, raw);
        throw new Error('Beklenmeyen yanıt');
      }

      // Token'ları SecureStore'a kaydet
      await SecureStore.setItemAsync('access', String(access));
      if (refresh) {
        await SecureStore.setItemAsync('refresh', String(refresh));
      }

      // Her durumda normalize edilmiş obje döndür
      return { access_token: String(access), refresh_token: refresh ? String(refresh) : null, raw };
    } catch (err) {
      throw new Error('Giriş yapılamadı');
    }
  },
  
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },
  
  refreshToken: async (refreshToken) => {
    return api.post('/auth/refresh', { refresh_token: refreshToken });
  },
  
  updateProfile: async (userData) => {
    return api.patch('/users/me', userData);
  },
  
  getUserDonations: async (limit = 20, cursor = null) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    return api.get('/users/me/donations', { params });
  },
  
  logout: async () => {
    // Token'ları SecureStore'dan sil
    await SecureStore.deleteItemAsync('access');
    await SecureStore.deleteItemAsync('refresh');
  }
};

// Users endpoints
export const usersAPI = {
  getUsers: async () => {
    return api.get('/users');
  },
  
  getUser: async (id) => {
    return api.get(`/users/${id}`);
  },
  
  updateUser: async (id, userData) => {
    return api.put(`/users/${id}`, userData);
  }
};

// Orders endpoints
export const ordersAPI = {
  getOrders: async () => {
    return api.get('/orders');
  },
  
  getOrder: async (id) => {
    return api.get(`/orders/${id}`);
  },
  
  createOrder: async (orderData) => {
    return api.post('/orders', orderData);
  }
};

// Admin endpoints - YENİ FORMAT
export const adminAPI = {
  // Eski endpoint (geriye uyumluluk)
  getDashboardStats: async () => {
    return api.get('/admin/dashboard');
  },
  
  // Yeni endpoint'ler
  getMetricsSummary: async () => {
    return api.get('/admin/metrics/summary');
  },
  
  getUsers: async (params = {}) => {
    return api.get('/admin/users', { params });
  },
  
  getUser: async (id) => {
    return api.get(`/admin/users/${id}`);
  },
  
  getDonations: async (params = {}) => {
    return api.get('/admin/donations', { params });
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${BASE}/health`, { timeout: 5000 });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status 
    };
  }
};

export default api;
