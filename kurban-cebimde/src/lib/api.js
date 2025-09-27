import axios from 'axios';
import { Platform, NativeModules } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const scriptURL = NativeModules.SourceCode?.scriptURL || '';
const METRO_HOST = scriptURL.split('://')[1]?.split(':')[0];
const EXPO_HOST = (Constants?.expoConfig?.hostUri || Constants?.manifest?.debuggerHost || '').split(':')[0];
const CONFIG_BASE = Constants?.expoConfig?.extra?.apiBase || Constants?.manifest?.extra?.apiBase || '';
const EXPLICIT_BASE = process.env.EXPO_PUBLIC_API_BASE || CONFIG_BASE; // örn: http://192.168.1.107:8000

const DEV_BASE = (() => {
  if (EXPLICIT_BASE) return EXPLICIT_BASE;
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  const host = EXPO_HOST || METRO_HOST;
  if (!host) {
    console.warn('⚠️ METRO_HOST/EXPO_HOST yok, iOS için 127.0.0.1 kullanılıyor. İstersen EXPO_PUBLIC_API_BASE ile override et.');
  }
  return `http://${host || '127.0.0.1'}:8000`;
})();

// Force development API for now
const API_BASE = 'http://185.149.103.247:8000/api/v1';
const ENV = 'development';

console.log('🌐 API_BASE=', API_BASE, 'ENV=', ENV);
console.log('🔍 Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
console.log('🔍 Constants.expoConfig:', Constants.expoConfig);

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000 // 60 saniye timeout
});

// Admin API için ayrı instance
export const adminApi = axios.create({
  baseURL: API_BASE.replace('/api/v1', '/api/admin/v1'),
  timeout: 60000
});

// Admin API metodları
export const adminAPI = {
  setToken: (token) => {
    adminApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  getStreams: async (params = {}) => {
    return adminApi.get('/streams', { params });
  },
  getDonations: async (params = {}) => {
    return adminApi.get('/donations', { params });
  }
};

// LiveKit API için ayrı instance - Backend'deki admin endpoint'ini kullan
export const livekitAPI = axios.create({
  baseURL: `${BASE}/api/admin/v1`,
  timeout: 60000
});

// LiveKit API için request interceptor
livekitAPI.interceptors.request.use(
  async (config) => {
    console.log(`🚀 LiveKit API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Token varsa header'a ekle
    try {
      const token = await SecureStore.getItemAsync('access');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 LiveKit Token eklendi');
      }
    } catch (error) {
      console.error('LiveKit Token alınamadı:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ LiveKit API Request Error:', error);
    return Promise.reject(error);
  }
);

// LiveKit API için response interceptor
livekitAPI.interceptors.response.use(
  (response) => {
    console.log(`✅ LiveKit API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('❌ LiveKit API Response Error:', error);
    return Promise.reject(error);
  }
);

// Admin API için request interceptor - KALDIRILDI (adminAPI.setToken() kullanılıyor)
// adminApi.interceptors.request.use(
//   async (config) => {
//     console.log(`🚀 Admin API Request: ${config.method?.toUpperCase()} ${config.url}`);
//     
//     // Token varsa header'a ekle
//     try {
//       const token = await SecureStore.getItemAsync('access');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//         console.log('🔑 Admin Token eklendi');
//       }
//     } catch (error) {
//       console.error('Admin Token alınamadı:', error);
//     }
//     
//     return config;
//   },
//   (error) => {
//     console.error('❌ Admin API Request Error:', error);
//     return Promise.reject(error);
//   }
// );

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
      // Sonsuz döngüyü önle - sadece bir kez refresh dene
      if (error.config._retry) {
        console.log('❌ Refresh token zaten denenmiş, sonsuz döngü önlendi');
        await SecureStore.deleteItemAsync('access');
        await SecureStore.deleteItemAsync('refresh');
        return Promise.reject(error);
      }
      
      try {
        const refresh = await SecureStore.getItemAsync('refresh');
        if (!refresh) throw error;
        
        // Refresh token ile yeni access token al
        const { data } = await api.post('/auth/refresh', { refresh_token: refresh });
        await SecureStore.setItemAsync('access', data.access_token);
        
        // Orijinal isteği tekrarla (retry flag'i ekle)
        error.config._retry = true;
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
      console.log('🔍 REGISTER REQUEST:', payload);
      console.log('🔍 API BASE URL:', api.defaults.baseURL);
      console.log('🔍 FULL URL:', `${api.defaults.baseURL}/auth/register`);
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
      console.log("❌ REGISTER_ERROR:", err);
      // Artık interceptor detay bastı; burada sadece kullanıcıya mesaj ver
      throw err; // Orijinal hatayı fırlat
    }
  },
  
  login: async (credentials) => {
    try {
      // Backend JSON bekliyor
      let phone = credentials?.phone || '';
      
      // Telefon numarasını temizle (boşlukları kaldır)
      if (phone) {
        phone = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
      }
      
      const payload = {
        phoneOrEmail: phone, // Backend'de phoneOrEmail field'ı bekliyor
        password: credentials?.password || ''
      };
      console.log('🔍 LOGIN REQUEST:', payload);

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

// Donations endpoints
export const donationsAPI = {
  createDonation: async (amount, currency = 'TRY') => {
    return api.post('/donations', { amount, currency });
  },
  
  getMyDonations: async (status = null) => {
    const params = status ? { status } : {};
    return api.get('/donations/me', { params });
  },
  
  getDonation: async (donationId) => {
    return api.get(`/donations/${donationId}`);
  },
  
  processPayment: async (donationId) => {
    return api.post(`/donations/${donationId}/pay`);
  }
};


// Live streaming endpoints
export const streamsAPI = {
  // Get all active streams (admin endpoint)
  getStreams: async () => {
    return adminApi.get('/streams');
  },
  
  // Get Agora token for stream
  getStreamToken: async (streamId, role = 'audience') => {
    return api.post(`/streams/${streamId}/token`, { role });
  }
};

// Admin streams endpoints
export const adminStreamsAPI = {
  // Get all streams (admin)
  getStreams: async (params = {}) => {
    return api.get('/admin/streams', { params });
  },
  
  // Get specific stream (admin)
  getStream: async (streamId) => {
    return api.get(`/admin/streams/${streamId}`);
  },
  
  // Create stream (admin)
  createStream: async (streamData) => {
    return api.post('/admin/streams', streamData);
  },
  
  // Start stream (admin)
  startStream: async (streamId) => {
    return api.post(`/admin/streams/${streamId}/start`);
  },
  
  // Stop stream (admin)
  stopStream: async (streamId) => {
    return api.post(`/admin/streams/${streamId}/stop`);
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
