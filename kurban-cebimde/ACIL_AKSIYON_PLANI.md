# 🚨 Kurban Cebimde - Acil Aksiyon Planı

> **Tarih:** Aralık 2024  
> **Hedef:** Bu hafta tamamlanacak kritik görevler  
> **Öncelik:** Backend API'leri ve veritabanı düzeltmeleri

---

## 🎯 Bu Hafta Hedefleri

### 📊 Hedef Durum (Hafta Sonu)
- **Backend API:** %30 → %70 ✅
- **Veritabanı:** %40 → %80 ✅
- **Entegrasyon:** %10 → %40 ✅
- **Genel İlerleme:** %45 → %65 ✅

---

## 🔥 Gün 1-2: Backend Foundation

### 1. User Model ve API'leri
```python
# backend/app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, UUID
from sqlalchemy.sql import func
from app.db.base_class import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(20))
    role = Column(String(20), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### 2. Authentication Endpoints
```python
# backend/app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.auth import AuthService

router = APIRouter()

@router.post("/login")
async def login(request: LoginRequest):
    return await AuthService.login(request.email, request.password)

@router.post("/register")
async def register(request: RegisterRequest):
    return await AuthService.register(request)

@router.post("/refresh")
async def refresh_token(token: str):
    return await AuthService.refresh_token(token)
```

### 3. User CRUD API'leri
```python
# backend/app/api/v1/endpoints/users.py
from fastapi import APIRouter, Depends
from app.schemas.user import UserResponse, UserUpdate
from app.services.user import UserService
from app.core.auth import get_current_user

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user = Depends(get_current_user)):
    return await UserService.get_profile(current_user.id)

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_data: UserUpdate,
    current_user = Depends(get_current_user)
):
    return await UserService.update_profile(current_user.id, user_data)
```

---

## 🔥 Gün 3-4: Veritabanı Migration'ları

### 1. Alembic Migration Oluşturma
```bash
# backend/ dizininde
cd backend

# Virtual environment aktifleştir
venv\Scripts\activate.bat  # Windows
source venv/bin/activate   # macOS/Linux

# Migration oluştur
alembic revision --autogenerate -m "Add user and order models"

# Migration'ı çalıştır
alembic upgrade head
```

### 2. Test Verileri Ekleme
```python
# backend/scripts/create_test_data.py
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_test_users():
    db = SessionLocal()
    
    # Admin kullanıcısı
    admin_user = User(
        email="admin@kurbancebimde.com",
        password_hash=get_password_hash("Admin123!"),
        first_name="Admin",
        last_name="User",
        role="admin",
        is_active=True
    )
    
    # Test kullanıcısı
    test_user = User(
        email="test@example.com",
        password_hash=get_password_hash("Test123!"),
        first_name="Test",
        last_name="User",
        role="user",
        is_active=True
    )
    
    db.add(admin_user)
    db.add(test_user)
    db.commit()
    db.close()

if __name__ == "__main__":
    create_test_users()
```

### 3. Veritabanı Bağlantı Testleri
```python
# backend/test_db_connection.py
import asyncio
from app.db.session import engine
from sqlalchemy import text

async def test_connection():
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("✅ Veritabanı bağlantısı başarılı!")
            
            # Tabloları kontrol et
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = result.fetchall()
            print(f"📋 Mevcut tablolar: {[t[0] for t in tables]}")
            
    except Exception as e:
        print(f"❌ Veritabanı bağlantı hatası: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
```

---

## 🔥 Gün 5-6: API Client'ları

### 1. Mobil API Client
```javascript
// src/lib/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekle
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          await AsyncStorage.setItem('access_token', response.data.access_token);
          return apiClient.request(error.config);
        } catch (refreshError) {
          // Refresh token da geçersiz, login sayfasına yönlendir
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
          // Navigation to login
        }
      }
    }
    return Promise.reject(error);
  }
);

// API fonksiyonları
export const authAPI = {
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password }),
  
  register: (userData) => 
    apiClient.post('/auth/register', userData),
  
  refresh: (refreshToken) => 
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
};

export const userAPI = {
  getProfile: () => 
    apiClient.get('/users/profile'),
  
  updateProfile: (userData) => 
    apiClient.put('/users/profile', userData),
};

export const orderAPI = {
  getOrders: () => 
    apiClient.get('/orders'),
  
  createOrder: (orderData) => 
    apiClient.post('/orders', orderData),
  
  getOrder: (id) => 
    apiClient.get(`/orders/${id}`),
};

export default apiClient;
```

### 2. Admin API Client
```typescript
// admin-panel/src/lib/adminApi.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const ADMIN_API_BASE_URL = 'http://localhost:8000/api/admin/v1';

interface AdminApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

class AdminApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ADMIN_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = localStorage.getItem('admin_access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('admin_refresh_token');
          if (refreshToken) {
            try {
              const response = await axios.post(`${ADMIN_API_BASE_URL}/auth/refresh`, {
                refresh_token: refreshToken,
              });
              localStorage.setItem('admin_access_token', response.data.access_token);
              return this.client.request(error.config);
            } catch (refreshError) {
              localStorage.removeItem('admin_access_token');
              localStorage.removeItem('admin_refresh_token');
              window.location.href = '/admin/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth API
  auth = {
    login: async (email: string, password: string) => {
      const response = await this.client.post('/auth/login', { email, password });
      return response.data;
    },

    logout: async () => {
      const response = await this.client.post('/auth/logout');
      return response.data;
    },
  };

  // Users API
  users = {
    list: async (params?: any) => {
      const response = await this.client.get('/users', { params });
      return response.data;
    },

    create: async (userData: any) => {
      const response = await this.client.post('/users', userData);
      return response.data;
    },

    update: async (id: string, userData: any) => {
      const response = await this.client.put(`/users/${id}`, userData);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await this.client.delete(`/users/${id}`);
      return response.data;
    },
  };

  // Orders API
  orders = {
    list: async (params?: any) => {
      const response = await this.client.get('/orders', { params });
      return response.data;
    },

    update: async (id: string, orderData: any) => {
      const response = await this.client.put(`/orders/${id}`, orderData);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await this.client.delete(`/orders/${id}`);
      return response.data;
    },
  };

  // Reports API
  reports = {
    generate: async (reportType: string, params?: any) => {
      const response = await this.client.post('/reports/generate', {
        type: reportType,
        params,
      });
      return response.data;
    },

    export: async (reportId: string, format: string) => {
      const response = await this.client.get(`/reports/${reportId}/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    },
  };
}

export const adminApi = new AdminApiClient();
export default adminApi;
```

---

## 🔥 Gün 7: Entegrasyon Testleri

### 1. Backend API Testleri
```python
# backend/test_api_endpoints.py
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_auth_endpoints():
    print("🧪 Auth endpoint'leri test ediliyor...")
    
    # Register test
    register_data = {
        "email": "test@example.com",
        "password": "Test123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print(f"Register: {response.status_code} - {response.json()}")
    
    # Login test
    login_data = {
        "email": "test@example.com",
        "password": "Test123!"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Login: {response.status_code} - {response.json()}")
    
    if response.status_code == 200:
        token = response.json().get("access_token")
        return token
    return None

def test_user_endpoints(token):
    print("🧪 User endpoint'leri test ediliyor...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get profile
    response = requests.get(f"{BASE_URL}/users/profile", headers=headers)
    print(f"Get Profile: {response.status_code} - {response.json()}")
    
    # Update profile
    update_data = {
        "first_name": "Updated",
        "last_name": "User"
    }
    
    response = requests.put(f"{BASE_URL}/users/profile", 
                          json=update_data, headers=headers)
    print(f"Update Profile: {response.status_code} - {response.json()}")

if __name__ == "__main__":
    token = test_auth_endpoints()
    if token:
        test_user_endpoints(token)
```

### 2. Mobil Entegrasyon Testi
```javascript
// src/test/apiIntegration.js
import { authAPI, userAPI } from './lib/api';

export const testApiIntegration = async () => {
  console.log('🧪 API entegrasyonu test ediliyor...');
  
  try {
    // Login test
    const loginResponse = await authAPI.login('test@example.com', 'Test123!');
    console.log('✅ Login başarılı:', loginResponse.data);
    
    // Profile test
    const profileResponse = await userAPI.getProfile();
    console.log('✅ Profile başarılı:', profileResponse.data);
    
    return true;
  } catch (error) {
    console.error('❌ API entegrasyon hatası:', error);
    return false;
  }
};
```

---

## 📋 Günlük Kontrol Listesi

### Gün 1 ✅
- [ ] User model oluşturuldu
- [ ] Authentication endpoints yazıldı
- [ ] User CRUD API'leri tamamlandı
- [ ] Backend server çalışıyor

### Gün 2 ✅
- [ ] Alembic migration oluşturuldu
- [ ] Migration çalıştırıldı
- [ ] Test verileri eklendi
- [ ] Veritabanı bağlantısı test edildi

### Gün 3 ✅
- [ ] Mobil API client yazıldı
- [ ] Token refresh sistemi eklendi
- [ ] Error handling eklendi
- [ ] Auth API fonksiyonları tamamlandı

### Gün 4 ✅
- [ ] Admin API client yazıldı
- [ ] Admin auth sistemi eklendi
- [ ] CRUD fonksiyonları tamamlandı
- [ ] TypeScript types eklendi

### Gün 5 ✅
- [ ] Backend API testleri yazıldı
- [ ] Endpoint'ler test edildi
- [ ] Hatalar düzeltildi
- [ ] Dokümantasyon güncellendi

### Gün 6 ✅
- [ ] Mobil entegrasyon testi
- [ ] Admin entegrasyon testi
- [ ] Cross-platform testler
- [ ] Performance testleri

### Gün 7 ✅
- [ ] Tüm testler geçti
- [ ] Entegrasyon tamamlandı
- [ ] Dokümantasyon güncellendi
- [ ] Hafta sonu raporu hazırlandı

---

## 🎯 Hafta Sonu Hedefleri

### ✅ Tamamlanacak
- [ ] Backend API'leri %70 tamamlandı
- [ ] Veritabanı migration'ları çalışıyor
- [ ] Mobil ↔ Backend bağlantısı aktif
- [ ] Admin ↔ Backend bağlantısı aktif
- [ ] Test coverage %50'ye ulaştı

### 📊 Metrikler
- **API Response Time:** <500ms
- **Error Rate:** <5%
- **Test Coverage:** >50%
- **Uptime:** >95%

---

## 🚨 Acil Durum Planı

### Eğer Backend API'leri gecikirse:
1. **Gün 1-2:** Sadece User model ve auth
2. **Gün 3-4:** Temel CRUD operations
3. **Gün 5-6:** API client'ları
4. **Gün 7:** Entegrasyon testleri

### Eğer Veritabanı sorunları olursa:
1. **SQLite'a geç** (development için)
2. **Migration'ları basitleştir**
3. **Test verilerini manuel ekle**
4. **PostgreSQL'i sonra düzelt**

### Eğer Entegrasyon sorunları olursa:
1. **Mock API kullan**
2. **Offline mode ekle**
3. **Error handling güçlendir**
4. **Fallback mekanizmaları ekle**

---

*Bu acil aksiyon planı, projenin kritik eksikliklerini hızlıca gidermek için tasarlanmıştır. Her gün sonunda ilerleme kontrol edilmeli ve gerekirse plan güncellenmelidir.*
