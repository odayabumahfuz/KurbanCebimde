# Kurban Cebimde Admin Panel Kurulum Rehberi

Bu rehber, Kurban Cebimde platformu için Admin Panel'in nasıl kurulacağını ve çalıştırılacağını açıklar.

## 🚀 Hızlı Başlangıç

### Windows (Batch)
```bash
# Kurulum
setup-admin-panel.bat

# Admin Panel'i başlat
start-admin-panel.bat

# Backend'i başlat
cd backend
python -m uvicorn app.main:app --reload
```

### Windows (PowerShell)
```powershell
# Kurulum
.\setup-admin-panel.ps1

# Admin Panel'i başlat
.\start-admin-panel.ps1

# Backend'i başlat
cd backend
python -m uvicorn app.main:app --reload
```

## 📋 Gereksinimler

### Sistem Gereksinimleri
- **OS**: Windows 10/11, macOS, Linux
- **RAM**: En az 4GB (8GB önerilen)
- **Disk**: En az 2GB boş alan
- **Network**: İnternet bağlantısı (bağımlılık yükleme için)

### Yazılım Gereksinimleri
- **Python**: 3.8+ (3.11 önerilen)
- **Node.js**: 18+ (20 önerilen)
- **npm**: 8+ (10 önerilen)
- **Git**: 2.0+ (proje klonlama için)

## 🛠️ Manuel Kurulum

### 1. Backend Kurulumu

```bash
cd backend

# Virtual environment oluştur
python -m venv venv

# Virtual environment aktifleştir
# Windows
venv\Scripts\activate.bat
# macOS/Linux
source venv/bin/activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Veritabanı migration'ları
alembic upgrade head

# Admin kullanıcısı oluştur
python scripts/create_admin_user.py
```

### 2. Frontend Kurulumu

```bash
cd admin-panel

# Bağımlılıkları yükle
npm install

# Environment dosyası oluştur
cp env.example .env
# .env dosyasını düzenle
```

### 3. Environment Konfigürasyonu

`.env` dosyasını düzenleyin:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
ADMIN_API_PREFIX=/api/admin/v1

# App Configuration
VITE_APP_TITLE=Kurban Cebimde Admin Panel
VITE_APP_VERSION=1.0.0
```

## 🔐 Admin Kullanıcısı

Kurulum sırasında otomatik olarak oluşturulan admin kullanıcısı:

- **Email**: admin@kurbancebimde.com
- **Şifre**: Admin123!

**⚠️ Güvenlik**: Production'da mutlaka şifreyi değiştirin!

## 🚀 Uygulamayı Başlatma

### Backend (Terminal 1)
```bash
cd backend

# Virtual environment aktifleştir
venv\Scripts\activate.bat  # Windows
source venv/bin/activate   # macOS/Linux

# Uygulamayı başlat
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend http://localhost:8000 adresinde çalışacak.

### Admin Panel (Terminal 2)
```bash
cd admin-panel

# Development server'ı başlat
npm run dev
```

Admin panel http://localhost:3001 adresinde açılacak.

## 🧪 Test Etme

### Admin API Test
```bash
cd backend

# Virtual environment aktifleştir
venv\Scripts\activate.bat  # Windows
source venv/bin/activate   # macOS/Linux

# Test'i çalıştır
python test_admin_api.py
```

### Postman Test
1. Postman'i açın
2. Collection import edin: `postman/admin-api-collection.json`
3. Environment variables ayarlayın:
   - `base_url`: http://localhost:8000
   - `admin_prefix`: /api/admin/v1

## 📁 Proje Yapısı

```
kurban-cebimde/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/         # Kullanıcı API
│   │   │   └── admin/      # Admin API
│   │   ├── models/         # Veritabanı modelleri
│   │   ├── schemas/        # Pydantic şemaları
│   │   └── core/           # Güvenlik ve config
│   ├── alembic/            # Veritabanı migration'ları
│   ├── scripts/            # Yardımcı script'ler
│   └── requirements.txt    # Python bağımlılıkları
├── admin-panel/            # React admin panel
│   ├── src/
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── lib/            # API client ve utilities
│   │   └── components/     # Yeniden kullanılabilir bileşenler
│   ├── package.json        # Node.js bağımlılıkları
│   └── env.example         # Environment variables örneği
└── scripts/                # Kurulum ve test script'leri
    ├── setup-admin-panel.bat
    ├── start-admin-panel.bat
    └── test-admin-api.bat
```

## 🔧 Konfigürasyon

### Backend Konfigürasyonu

`backend/app/core/config.py`:
```python
class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://app:app@postgres:5432/appdb"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ADMIN_SECRET_KEY: str = "admin-secret-key-here"
    
    # JWT Settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14
```

### Frontend Konfigürasyonu

`admin-panel/vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

## 🚨 Sorun Giderme

### Yaygın Sorunlar

#### 1. Port Çakışması
```bash
# Port 8000 kullanımda
netstat -ano | findstr :8000
# Port 3001 kullanımda
netstat -ano | findstr :3001
```

#### 2. Python Bağımlılık Hataları
```bash
# Virtual environment'ı yeniden oluştur
rm -rf venv
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
```

#### 3. Node.js Bağımlılık Hataları
```bash
# node_modules'ı temizle
rm -rf node_modules package-lock.json
npm install
```

#### 4. Veritabanı Bağlantı Hatası
```bash
# PostgreSQL servisini kontrol et
# Windows
services.msc
# PostgreSQL servisini başlat

# macOS/Linux
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Log Dosyaları

- **Backend**: Terminal output
- **Frontend**: Browser console (F12)
- **Database**: PostgreSQL logs

## 🔒 Güvenlik

### Production Önlemleri

1. **Environment Variables**
   ```bash
   # Güçlü secret key'ler kullan
   ADMIN_SECRET_KEY=your-super-secret-256-bit-key
   ```

2. **HTTPS**
   - SSL sertifikası kur
   - HTTP'den HTTPS'e yönlendir

3. **Firewall**
   - Admin panel port'unu sınırla
   - IP whitelist uygula

4. **Rate Limiting**
   - Redis ile rate limiting aktifleştir
   - API abuse'ı önle

## 📞 Destek

### Yardım Alma
- **GitHub Issues**: [Repository Link]
- **Email**: support@kurbancebimde.com
- **Telegram**: @kurbancebimde_support

### Dokümantasyon
- [Admin API README](./backend/ADMIN_API_README.md)
- [Admin Panel README](./admin-panel/README.md)
- [Backend README](./backend/README.md)

## 🎯 Sonraki Adımlar

1. **Kullanıcı Yönetimi**: Yeni admin kullanıcıları ekle
2. **Rol Yönetimi**: RBAC sistemini genişlet
3. **Audit Logs**: Detaylı loglama sistemi
4. **Monitoring**: Performance monitoring ekle
5. **Backup**: Otomatik backup sistemi

---

**Not**: Bu kurulum rehberi development ortamı içindir. Production deployment için ek güvenlik önlemleri alınmalıdır.
