# 🐑 Kurban Cebimde - Kurban Bağış Platformu

**Kurban Cebimde**, kurban bağışlarını dijital ortamda yönetmek için geliştirilmiş kapsamlı bir platformdur. Proje üç ana bileşenden oluşmaktadır:

- **Backend API** (Flask + SQLite/PostgreSQL)
- **Admin Panel** (React + TypeScript + Vite)  
- **Mobil Uygulama** (React Native + Expo)

---

## 🚀 Hızlı Başlangıç

### Sunucuya Deploy Edilmiş Durumda

Proje bu sunucuya başarıyla deploy edilmiştir. Tüm servisler Docker container'ları olarak çalışmaktadır.

### 🌐 Erişim URL'leri

- **Ana Site**: `http://sunucu-ip:8081`
- **Admin Panel**: `http://sunucu-ip:3000`
- **API Backend**: `http://sunucu-ip:8000`
- **API Health Check**: `http://sunucu-ip:8000/health`

Not: Geliştirme sırasında admin panel lokal Vite dev sunucusunda `http://localhost:3001` olarak açılabilir; Docker Compose ortamında `http://localhost:3000`’dan erişilir.

### 🔧 Servis Durumu

```bash
# Servisleri kontrol et
docker ps

# Servisleri başlat
cd /root/KurbanCebimde
docker-compose up -d

# Servisleri durdur
docker-compose down

# Logları görüntüle
docker-compose logs -f
```

---

## 📊 Proje Yapısı

```
KurbanCebimde/
├── 🐳 Docker Konfigürasyonu
│   ├── docker-compose.yml          # Servis orkestrasyonu
│   ├── nginx.conf                   # Reverse proxy
│   └── ssl/                         # SSL sertifikaları
│
├── 🔧 Backend (Flask)
│   ├── kurban-cebimde/backend/
│   │   ├── main.py                  # Ana Flask uygulaması
│   │   ├── requirements.txt         # Python bağımlılıkları
│   │   └── test.db                  # SQLite veritabanı
│   └── backend/                     # Alternatif backend
│
├── 🖥️ Admin Panel (React + TypeScript)
│   ├── kurban-cebimde/admin-panel/
│   │   ├── src/
│   │   │   ├── components/          # UI bileşenleri
│   │   │   ├── pages/               # Sayfa bileşenleri
│   │   │   ├── stores/              # Zustand state stores
│   │   │   └── lib/                 # Utility fonksiyonlar
│   │   ├── package.json             # Node.js bağımlılıkları
│   │   └── vite.config.ts           # Vite konfigürasyonu
│
├── 📱 Mobil Uygulama (React Native + Expo)
│   ├── kurban-cebimde/
│   │   ├── src/
│   │   │   ├── screens/             # 16 ekran tamamlandı
│   │   │   ├── components/          # UI bileşenleri
│   │   │   ├── contexts/            # Auth & Cart contexts
│   │   │   └── navigation/          # Navigation setup
│   │   ├── package.json             # Expo bağımlılıkları
│   │   └── app.json                 # Expo konfigürasyonu
│
└── 📋 Dokümantasyon
    ├── README.md                    # Bu dosya
    ├── SUNUCU_DURUM_RAPORU.md       # Detaylı durum raporu
    ├── ACTIVE_FEATURES.md           # Aktif özellikler
    └── kurban-cebimde/
        ├── PROJE_DURUMU.md          # Proje durumu
        ├── PROJE_TAMAMLANDI.md      # Tamamlanan özellikler
        └── ADMIN_PANEL_SETUP.md     # Admin panel kurulumu
```

---

## 🔧 Teknoloji Stack

### Backend
- **Framework**: Flask + Flask-CORS
- **Veritabanı**: SQLite (PostgreSQL'e geçiş planlanıyor)
- **Authentication**: Session-based (UUID tokens)
- **API**: RESTful endpoints

### Admin Panel
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod validation

### Mobil Uygulama
- **Framework**: React Native + Expo SDK 53
- **Navigation**: React Navigation v6
- **State Management**: Context API
- **Storage**: AsyncStorage
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL + Redis
- **Monitoring**: Temel health check'ler

---

## 📡 API Endpoints

### Kullanıcı API'leri (`/api/v1`)
```
✅ GET  /health                    - Sağlık kontrolü
✅ POST /auth/login               - Kullanıcı girişi
✅ POST /auth/register             - Kullanıcı kaydı
✅ POST /auth/refresh              - Token yenileme
✅ GET  /auth/me                   - Profil bilgisi
✅ POST /auth/logout               - Çıkış
```

### Admin API'leri (`/api/admin/v1`)
```
✅ POST /auth/login               - Admin girişi
✅ GET  /users                     - Kullanıcı listesi
✅ GET  /donations                 - Bağış listesi
✅ GET  /carts                     - Sepet listesi
```

---

## 🗄️ Veritabanı Yapısı

### Users Tablosu
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT,
    surname TEXT,
    username TEXT UNIQUE,
    phone TEXT UNIQUE,
    email TEXT,
    password_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### User Sessions Tablosu
```sql
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    device_id TEXT,
    ip TEXT,
    user_agent TEXT,
    started_at TEXT NOT NULL,
    ended_at TEXT
);
```

---

## 🚀 Geliştirme Komutları

### Docker Servisleri
```bash
# Tüm servisleri başlat
docker-compose up -d

# Belirli servisi başlat
docker-compose up -d [service-name]

# Servisleri durdur
docker-compose down

# Logları görüntüle
docker-compose logs -f [service-name]

# Container'a erişim
docker exec -it kurbancebimde-api-1 bash
docker exec -it kurbancebimde-admin-panel-1 sh
```

### Backend Geliştirme
```bash
cd kurban-cebimde/backend
pip install flask flask-cors
python main.py
```

### Admin Panel Geliştirme
```bash
cd kurban-cebimde/admin-panel
npm install
npm run dev
```

### Mobil Uygulama Geliştirme
```bash
cd kurban-cebimde
npm install
npx expo start
```

---

## ⚠️ Bilinen Sorunlar ve Çözümler

### 1. Port Çakışmaları
**Sorun**: Sistem Redis'i ve Nginx'i çalıştığı için port çakışmaları
**Çözüm**: Docker-compose.yml'de portları değiştirdik:
- Redis: 6379 → 6380
- Nginx: 80 → 8081

### 2. Backend Framework Uyumsuzluğu
**Sorun**: Docker-compose.yml FastAPI için yazılmış ama backend Flask kullanıyor
**Çözüm**: Command'ları Flask için güncelledik

### 3. Volume Mapping Sorunları
**Sorun**: Backend volume mapping'i yanlış
**Çözüm**: `./kurban-cebimde/backend:/app` olarak düzelttik

---

## 🔒 Güvenlik Notları

### ⚠️ Mevcut Güvenlik Sorunları
1. **Şifreleme**: Şifreler plain text olarak saklanıyor
2. **SQL Injection**: Raw SQL sorguları var
3. **Input Validation**: Kullanıcı girdisi kontrol edilmiyor
4. **HTTPS**: SSL sertifikası yok

### 🛡️ Önerilen İyileştirmeler
1. **Şifre Hash'leme**: BCrypt ile şifre hash'leme
2. **Input Validation**: Pydantic ile validation
3. **SQL Injection**: ORM kullanımı
4. **HTTPS**: SSL sertifikası kurulumu

---

## 📈 Performans ve Monitoring

### Mevcut Monitoring
- **Health Check**: `/health` endpoint'i
- **Docker Stats**: `docker stats` komutu
- **Log Monitoring**: `docker-compose logs`

### Önerilen Monitoring
- **Prometheus**: Metrik toplama
- **Grafana**: Dashboard'lar
- **Sentry**: Hata takibi
- **Uptime Monitoring**: Servis durumu

---

## 🎯 Sonraki Adımlar

### 🔥 Acil (Bu Hafta)
1. **Şifre Hash'leme**: BCrypt implementasyonu
2. **Input Validation**: Pydantic ile validation
3. **Error Handling**: Sistematik hata yönetimi
4. **API Documentation**: Swagger/OpenAPI

### ⚡ Orta Vadeli (2-3 Hafta)
1. **PostgreSQL Migration**: SQLite'dan PostgreSQL'e geçiş
2. **JWT Authentication**: Session yerine JWT token
3. **Rate Limiting**: API istek sınırlaması
4. **SSL Certificate**: HTTPS konfigürasyonu

### 📈 Uzun Vadeli (1-2 Ay)
1. **Testing**: Unit ve integration testler
2. **CI/CD**: GitHub Actions pipeline
3. **Monitoring**: Prometheus + Grafana
4. **Performance**: Optimizasyon çalışmaları

---

## 📞 Destek ve İletişim

**Proje Durumu**: ✅ Aktif ve Çalışır  
**Sunucu Durumu**: ✅ Stabil  
**Son Güncelleme**: 15 Ağustos 2025  

### Sorun Giderme
1. **Container Logları**: `docker-compose logs` ile kontrol
2. **Port Çakışmaları**: `netstat -tulpn` ile kontrol
3. **Disk Alanı**: `df -h` ile kontrol
4. **Memory Kullanımı**: `free -h` ile kontrol

### Detaylı Rapor
Daha detaylı bilgi için `SUNUCU_DURUM_RAPORU.md` dosyasını inceleyin.

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**🎉 Kurban Cebimde projesi başarıyla sunucuya deploy edilmiştir!**

Tüm servisler çalışır durumda ve geliştirme için hazır. Yukarıdaki komutları kullanarak projeyi başlatabilir ve geliştirebilirsiniz.
