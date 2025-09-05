# 📋 Kurban Cebimde - Yapılacak Listesi

> **Tarih:** Aralık 2024  
> **Öncelik:** API Environment → Yayın Sistemi  
> **Durum:** Aktif Geliştirme

---

## 🎯 Öncelik Sırası

### 🔥 **ACİL (Bu Hafta)**
1. **API Environment Setup** - Backend'i tam çalışır hale getir
2. **Yayın Sistemi** - Canlı yayın altyapısı
3. **Entegrasyon** - Mobil ↔ Backend bağlantısı

### ⚡ **ORTA VADELİ (2-3 Hafta)**
4. **Certificate Sistemi** - Sertifika oluşturma
5. **Payment Integration** - Ödeme sistemi
6. **File Upload** - Dosya yükleme

### 📈 **UZUN VADELİ (1-2 Ay)**
7. **Background Tasks** - Arka plan işleri
8. **Monitoring** - Performans takibi
9. **Deployment** - Production deployment

---

## 🚀 1. API ENVIRONMENT SETUP

### ✅ **Tamamlanan**
- [x] FastAPI framework kurulu
- [x] SQLAlchemy ORM kurulu
- [x] Alembic migration kurulu
- [x] JWT authentication temel yapı
- [x] CORS middleware aktif
- [x] User ve Order modelleri var

### 🔧 **Yapılacaklar**

#### 1.1 Database Setup
- [ ] **PostgreSQL kurulumu**
  ```bash
  # Docker ile PostgreSQL
  docker run --name kurban-db -e POSTGRES_USER=app -e POSTGRES_PASSWORD=app -e POSTGRES_DB=kurban -p 5432:5432 -d postgres:16
  ```
- [ ] **Alembic migration çalıştır**
  ```bash
  cd backend
  alembic upgrade head
  ```
- [ ] **Test verileri oluştur**
  ```python
  # backend/scripts/create_test_data.py
  # Admin user ve test user'ları oluştur
  ```

#### 1.2 API Endpoints Test
- [ ] **Auth endpoints test et**
  ```bash
  # POST /api/v1/auth/register
  # POST /api/v1/auth/login
  # POST /api/v1/auth/refresh
  ```
- [ ] **User endpoints test et**
  ```bash
  # GET /api/v1/users/me
  # PATCH /api/v1/users/me
  ```
- [ ] **Order endpoints test et**
  ```bash
  # POST /api/v1/orders
  # GET /api/v1/orders
  # GET /api/v1/orders/{id}
  ```

#### 1.3 Environment Variables
- [ ] **Backend .env dosyası oluştur**
  ```env
  # backend/.env
  DATABASE_URL=postgresql://app:app@localhost:5432/kurban
  SECRET_KEY=your-secret-key-here
  ALGORITHM=HS256
  ACCESS_TOKEN_EXPIRE_MINUTES=15
  REFRESH_TOKEN_EXPIRE_DAYS=14
  CORS_ORIGINS=["http://localhost:3000", "http://localhost:8081"]
  ```
- [ ] **Admin panel .env dosyası oluştur**
  ```env
  # admin-panel/.env
  VITE_API_URL=http://localhost:8000/api
  VITE_ADMIN_API_URL=http://localhost:8000/api/admin/v1
  ```

#### 1.4 API Client Setup
- [ ] **Mobile API client oluştur**
  ```javascript
  // src/lib/api.js
  // Axios instance + token management
  ```
- [ ] **Admin API client oluştur**
  ```typescript
  // admin-panel/src/lib/adminApi.ts
  // Axios instance + admin token management
  ```

---

## 📺 2. YAYIN SİSTEMİ (LIVE STREAM)

### 🎯 **Hedefler**
- Canlı yayın başlatma/durdurma
- Yayın durumu takibi
- Yayın geçmişi
- Yayın istatistikleri

### 📋 **Yapılacaklar**

#### 2.1 Stream Model
- [ ] **Stream model oluştur**
  ```python
  # backend/app/models/stream.py
  class Stream(Base):
      __tablename__ = "streams"
      id = Column(String(36), primary_key=True)
      title = Column(String(200))
      description = Column(Text)
      status = Column(Enum(StreamStatus))  # PENDING, LIVE, ENDED
      stream_key = Column(String(100))
      stream_url = Column(String(500))
      viewer_count = Column(Integer, default=0)
      started_at = Column(DateTime)
      ended_at = Column(DateTime)
      created_by = Column(String(36), ForeignKey("users.id"))
  ```

#### 2.2 Stream Service
- [ ] **Stream service oluştur**
  ```python
  # backend/app/services/stream.py
  class StreamService:
      def create_stream(self, title: str, description: str, user_id: str):
          # Stream oluştur
          # Stream key generate et
          # RTMP URL oluştur
      
      def start_stream(self, stream_id: str):
          # Stream'i başlat
          # Status'u LIVE yap
      
      def end_stream(self, stream_id: str):
          # Stream'i bitir
          # Status'u ENDED yap
  ```

#### 2.3 Stream Endpoints
- [ ] **Stream API endpoints oluştur**
  ```python
  # backend/app/api/v1/endpoints/streams.py
  @router.post("/streams")
  async def create_stream(stream: StreamCreate, current_user: User):
      # Yeni stream oluştur
  
  @router.get("/streams")
  async def get_streams(skip: int = 0, limit: int = 10):
      # Stream listesi getir
  
  @router.get("/streams/{stream_id}")
  async def get_stream(stream_id: str):
      # Stream detayı getir
  
  @router.post("/streams/{stream_id}/start")
  async def start_stream(stream_id: str, current_user: User):
      # Stream başlat
  
  @router.post("/streams/{stream_id}/end")
  async def end_stream(stream_id: str, current_user: User):
      # Stream bitir
  ```

#### 2.4 Stream Integration
- [ ] **RTMP Server kurulumu**
  ```yaml
  # docker-compose.yml
  nginx-rtmp:
    image: aler9/nginx-rtmp
    ports:
      - "1935:1935"  # RTMP
      - "8080:80"    # HTTP
    volumes:
      - ./nginx-rtmp.conf:/etc/nginx/nginx.conf
  ```
- [ ] **Nginx RTMP config**
  ```nginx
  # nginx-rtmp.conf
  rtmp {
      server {
          listen 1935;
          chunk_size 4096;
          
          application live {
              live on;
              record off;
              
              # HLS
              hls on;
              hls_path /tmp/hls;
              hls_fragment 3s;
              hls_playlist_length 60s;
          }
      }
  }
  ```

#### 2.5 Stream UI
- [ ] **Mobile stream ekranı güncelle**
  ```javascript
  // src/screens/LiveStreamScreen.js
  // Stream listesi
  // Stream detayı
  // Stream başlatma/durdurma
  ```
- [ ] **Admin stream yönetimi**
  ```typescript
  // admin-panel/src/pages/Streams.tsx
  // Stream oluşturma
  // Stream yönetimi
  // Stream istatistikleri
  ```

---

## 🔗 3. ENTEGRASYON

### 📱 **Mobile ↔ Backend**
- [ ] **Login/Register entegrasyonu**
  ```javascript
  // src/context/AuthContext.js
  // API ile login/register
  // Token storage
  // Token refresh
  ```
- [ ] **Order entegrasyonu**
  ```javascript
  // src/screens/DonateScreen.js
  // API ile order oluşturma
  // Order listesi
  // Order detayı
  ```
- [ ] **Stream entegrasyonu**
  ```javascript
  // src/screens/LiveStreamScreen.js
  // Stream listesi API
  // Stream detayı API
  ```

### 🖥️ **Admin ↔ Backend**
- [ ] **Admin login entegrasyonu**
  ```typescript
  // admin-panel/src/stores/authStore.ts
  // Admin API ile login
  // Admin token management
  ```
- [ ] **Dashboard entegrasyonu**
  ```typescript
  // admin-panel/src/pages/Dashboard.tsx
  // Dashboard verileri API
  // İstatistikler
  ```
- [ ] **Stream yönetimi entegrasyonu**
  ```typescript
  // admin-panel/src/pages/Streams.tsx
  // Stream CRUD API
  // Stream istatistikleri
  ```

---

## 🧪 4. TESTING

### 🔍 **API Testing**
- [ ] **Postman collection oluştur**
  ```json
  // Kurban Cebimde API.postman_collection.json
  // Tüm endpoint'ler için test
  ```
- [ ] **Automated API tests**
  ```python
  # backend/tests/test_api.py
  # pytest ile API testleri
  ```

### 📱 **Mobile Testing**
- [ ] **Mobile app test**
  ```javascript
  // src/test/apiIntegration.js
  // API entegrasyon testleri
  ```

### 🖥️ **Admin Testing**
- [ ] **Admin panel test**
  ```typescript
  // admin-panel/src/test/adminApi.test.ts
  // Admin API testleri
  ```

---

## 🚀 5. DEPLOYMENT

### 🐳 **Docker Setup**
- [ ] **Backend Dockerfile**
  ```dockerfile
  # backend/Dockerfile
  FROM python:3.12-slim
  # Python dependencies
  # FastAPI app
  ```
- [ ] **Docker Compose güncelle**
  ```yaml
  # docker-compose.yml
  # Backend, Database, Redis, Nginx-RTMP
  ```

### 🔧 **Environment Setup**
- [ ] **Production .env**
  ```env
  # Production environment variables
  DATABASE_URL=postgresql://...
  REDIS_URL=redis://...
  SECRET_KEY=...
  ```
- [ ] **Nginx config**
  ```nginx
  # nginx.conf
  # Reverse proxy
  # SSL config
  ```

---

## 📊 6. MONITORING

### 📈 **Health Checks**
- [ ] **API health endpoint**
  ```python
  # backend/app/core/health.py
  @router.get("/health")
  async def health_check():
      return {"status": "healthy"}
  ```
- [ ] **Database health check**
- [ ] **Redis health check**

### 📝 **Logging**
- [ ] **Structured logging**
  ```python
  # backend/app/core/logging.py
  # JSON logging
  # Request/response logging
  ```

---

## 🎯 **GÜNLÜK GÖREVLER**

### **Gün 1: API Environment**
- [ ] PostgreSQL kurulumu
- [ ] Alembic migration çalıştır
- [ ] Test verileri oluştur
- [ ] API endpoints test et

### **Gün 2: Stream Model**
- [ ] Stream model oluştur
- [ ] Stream service oluştur
- [ ] Stream endpoints oluştur
- [ ] Alembic migration

### **Gün 3: Stream Integration**
- [ ] RTMP server kurulumu
- [ ] Nginx RTMP config
- [ ] Stream UI güncelle
- [ ] Stream test et

### **Gün 4: Mobile Integration**
- [ ] Mobile API client
- [ ] Auth entegrasyonu
- [ ] Stream entegrasyonu
- [ ] Mobile test et

### **Gün 5: Admin Integration**
- [ ] Admin API client
- [ ] Admin auth entegrasyonu
- [ ] Stream yönetimi
- [ ] Admin test et

### **Gün 6: Testing**
- [ ] API testleri
- [ ] Mobile testleri
- [ ] Admin testleri
- [ ] End-to-end testler

### **Gün 7: Deployment**
- [ ] Docker setup
- [ ] Environment config
- [ ] Production deployment
- [ ] Monitoring setup

---

## ✅ **TAMAMLAMA KRİTERLERİ**

### **API Environment ✅**
- [ ] Backend çalışıyor
- [ ] Database bağlantısı var
- [ ] Auth endpoints çalışıyor
- [ ] User/Order endpoints çalışıyor

### **Yayın Sistemi ✅**
- [ ] Stream model oluşturuldu
- [ ] Stream endpoints çalışıyor
- [ ] RTMP server çalışıyor
- [ ] Stream UI entegre

### **Entegrasyon ✅**
- [ ] Mobile ↔ Backend çalışıyor
- [ ] Admin ↔ Backend çalışıyor
- [ ] Auth entegrasyonu tamam
- [ ] Stream entegrasyonu tamam

---

*Bu liste, projenin temel işlevselliğini sağlamak için gerekli adımları içerir. Her gün sonunda ilerleme kontrol edilmeli ve gerekirse liste güncellenmelidir.*
