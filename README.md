# 🐑 KurbanCebimde - Kurban Organizasyon Platformu

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=D04A37)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

> Modern kurban organizasyon platformu - Push bildirimleri, sertifika sistemi ve canlı yayın desteği ile

## 📋 İçindekiler

- [🚀 Özellikler](#-özellikler)
- [🏗️ Mimari](#️-mimari)
- [📦 Kurulum](#-kurulum)
- [🔧 Konfigürasyon](#-konfigürasyon)
- [🧪 Test](#-test)
- [📚 API Dokümantasyonu](#-api-dokümantasyonu)
- [🔔 Push Bildirimleri](#-push-bildirimleri)
- [📜 Sertifika Sistemi](#-sertifika-sistemi)
- [🛡️ Güvenlik](#️-güvenlik)
- [📊 Monitoring](#-monitoring)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)
- [📄 Lisans](#-lisans)

## 🚀 Özellikler

### 🔔 Push Bildirimleri
- ✅ Expo Push Notification desteği
- ✅ Toplu bildirim gönderimi
- ✅ Kurban, bağış ve yayın bildirimleri
- ✅ Bildirim kanalları ve ses ayarları
- ✅ Token yönetimi ve kayıt sistemi

### 📜 Sertifika Sistemi
- ✅ Kurban katılım sertifikaları
- ✅ Bağış sertifikaları
- ✅ Etkinlik katılım sertifikaları
- ✅ QR kod doğrulama
- ✅ PDF indirme
- ✅ Sertifika istatistikleri

### 🎥 Canlı Yayın
- ✅ LiveKit entegrasyonu
- ✅ Agora SDK desteği
- ✅ RTMP stream desteği
- ✅ Yayın kalitesi ayarları

### 🛡️ Güvenlik & Performans
- ✅ JWT authentication
- ✅ Rate limiting (Redis + Memory)
- ✅ Global error handling
- ✅ Input validation
- ✅ CORS konfigürasyonu
- ✅ Request ID tracking

### 📱 Mobil Uygulama
- ✅ React Native + Expo
- ✅ Cross-platform (iOS/Android)
- ✅ Push notification desteği
- ✅ Offline-first yaklaşım
- ✅ Modern UI/UX

## 🏗️ Mimari

Detaylı sistem mimarisi için [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) dosyasına bakın.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Admin Panel   │    │   Web Client    │
│   (Expo)        │    │   (Vite)        │    │   (React)       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      FastAPI Backend       │
                    │   (Python 3.11 + Uvicorn)  │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────┴───────┐    ┌─────────┴───────┐    ┌─────────┴───────┐
│   PostgreSQL    │    │      Redis      │    │   Expo Push    │
│   (Database)    │    │   (Cache/Rate)  │    │   Service      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🚀 Production Deployment

```bash
# Production deployment
./deploy-prod.sh

# Environment setup
cp env.example .env
# .env dosyasını düzenleyin

# Production services
docker-compose -f docker-compose.prod.yml up -d
```

### 🏛️ Teknoloji Stack

**Backend:**
- FastAPI (Python 3.11)
- PostgreSQL (Database)
- Redis (Cache & Rate Limiting)
- Uvicorn (ASGI Server)
- SQLAlchemy (ORM)
- Pydantic (Validation)
- JWT (Authentication)

**Frontend:**
- React Native (Expo SDK 53)
- TypeScript
- React Navigation
- Expo Notifications
- AsyncStorage

**DevOps:**
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- SSL/TLS
- CI/CD Pipeline

## 📦 Kurulum

### 🐳 Docker ile Kurulum (Önerilen)

```bash
# Repository'yi klonla
git clone https://github.com/your-org/kurban-cebimde.git
cd kurban-cebimde

# Environment dosyasını kopyala
cp .env.example .env

# Environment değişkenlerini düzenle
nano .env

# Docker Compose ile başlat
docker-compose up -d

# Logları kontrol et
docker-compose logs -f
```

### 🔧 Manuel Kurulum

#### Backend Kurulumu

```bash
# Backend klasörüne git
cd backend

# Virtual environment oluştur
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Dependencies yükle
pip install -r requirements.txt

# Environment değişkenlerini ayarla
cp .env.example .env
nano .env

# Database migration
python -m alembic upgrade head

# Backend'i başlat
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Kurulumu

```bash
# React Native uygulaması
cd kurban-cebimde

# Dependencies yükle
npm install

# Expo CLI yükle (global)
npm install -g @expo/cli

# Expo development server başlat
npx expo start

# Admin panel
cd admin-panel
npm install
npm run dev
```

## 🔧 Konfigürasyon

### 🌍 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/kurban_cebimde

# Redis
REDIS_URL=redis://localhost:6379

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

# Expo Push Notifications
EXPO_ACCESS_TOKEN=your-expo-access-token

# Agora (Video/Audio)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERT=your-agora-certificate

# LiveKit (Streaming)
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081

# Debug
DEBUG=true
LOG_LEVEL=INFO
```

### 🐳 Docker Compose Konfigürasyonu

```yaml
version: '3.8'

services:
  api:
    image: python:3.11-slim
    working_dir: /app
    volumes: ["./backend:/app"]
    command: bash -lc "pip install -U pip && pip install -r requirements.txt && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/kurban_cebimde
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - kurban-network

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=kurban_cebimde
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - kurban-network

  redis:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    volumes:
      - redis_data:/data
    networks:
      - kurban-network

volumes:
  postgres_data:
  redis_data:

networks:
  kurban-network:
    driver: bridge
```

## 🧪 Test

### 🎯 **Yayın Test Senaryosu**

Bu test senaryosu 1 bilgisayar ve 2 telefon ile gerçekleştirilir:

#### 📱 **Test Ortamı**
- **Bilgisayar**: Admin panel kontrolü ve iletişim
- **Telefon 1**: Normal kullanıcı (bağış yapan)
- **Telefon 2**: Admin kullanıcı (yayın oluşturan)

#### 🔄 **Test Adımları**

**1. Kullanıcı Kaydı ve Bağış (Telefon 1)**
```
1. Normal kullanıcı olarak kayıt ol
2. Giriş yap
3. Sepete bağış ekle
4. Bağışı onayla
5. Ödeme sayfası atlanır → "Bağışınız alındı" mesajı
```

**2. Admin Kontrolü (Telefon 2)**
```
1. Admin olarak giriş yap
2. Bağış yapan kullanıcıyı gör
3. Kullanıcı için kesim yayını oluştur
4. Kullanıcıya bildirim gönder: "1dk içerisinde yayınınız başlayacaktır"
```

**3. Yayın Süreci**
```
1. Kullanıcı yayına erken girerse → Geri sayım sayfası
2. Yayın başladığında → 2dk süre verilir
3. Hem kullanıcı hem admin panelden izler
4. Yayın biter
```

#### ✅ **Beklenen Sonuçlar**
- ✅ Admin panelde bağış verileri görünür
- ✅ Kullanıcıya bildirim gelir
- ✅ Yayın oluşturulur ve izlenebilir
- ✅ Geri sayım sistemi çalışır
- ✅ 2dk yayın süresi tamamlanır

### 🚀 Hızlı Test

```bash
# Backend health check
curl http://localhost:8000/health

# Test endpoints
curl http://localhost:8000/api/test/v1/

# Notification test
curl http://localhost:8000/api/notifications/v1/test

# Certificate test
curl http://localhost:8000/api/test/v1/certificate
```

### 📋 Postman Koleksiyonu

```bash
# Postman collection import et
postman/KurbanCebimde_API.postman_collection.json
postman/KurbanCebimde_Environment.postman_environment.json
```

### 🔧 Otomatik Test

```bash
# Backend testleri
cd backend
python -m pytest tests/ -v

# Frontend testleri
cd kurban-cebimde
npm test

# Integration testleri
npm run test:integration
```

### 🚨 Error Testing

```bash
# Error test endpoints
curl http://localhost:8000/api/error-test/v1/
curl http://localhost:8000/api/error-test/v1/random
curl http://localhost:8000/api/error-test/v1/rate_limit
```

## 📚 API Dokümantasyonu

### 📖 Swagger UI
- **URL**: `http://localhost:8000/docs`
- **Özellikler**: Interactive API documentation, test endpoints

### 📋 ReDoc
- **URL**: `http://localhost:8000/redoc`
- **Özellikler**: Clean, readable documentation

### 🔗 API Endpoints

#### 🔐 Authentication
- `POST /api/v1/auth/register` - Kullanıcı kaydı
- `POST /api/v1/auth/login` - Kullanıcı girişi
- `GET /api/v1/auth/me` - Mevcut kullanıcı
- `POST /api/v1/auth/refresh` - Token yenileme

#### 🔔 Push Notifications
- `POST /api/notifications/v1/send` - Tek bildirim
- `POST /api/notifications/v1/send-bulk` - Toplu bildirim
- `POST /api/notifications/v1/kurban` - Kurban bildirimi
- `POST /api/notifications/v1/donation` - Bağış bildirimi
- `POST /api/notifications/v1/stream` - Yayın bildirimi

#### 📜 Certificates
- `POST /api/certificates/v1/create` - Sertifika oluştur
- `GET /api/certificates/v1/{id}` - Sertifika detayı
- `GET /api/certificates/v1/user/{user_id}` - Kullanıcı sertifikaları
- `GET /api/certificates/v1/verify/{code}` - Sertifika doğrula
- `GET /api/certificates/v1/stats/overview` - İstatistikler

#### 🧪 Test Endpoints
- `GET /api/test/v1/` - Test root
- `GET /api/test/v1/notification` - Bildirim testi
- `GET /api/test/v1/certificate` - Sertifika testi
- `GET /api/test/v1/integration` - Entegrasyon testi

## 🔔 Push Bildirimleri

### 📱 Expo Push Token Alma

```typescript
import * as Notifications from 'expo-notifications';

// Push notification izni iste
const { status } = await Notifications.requestPermissionsAsync();

// Expo push token al
const token = await Notifications.getExpoPushTokenAsync({
  projectId: Constants.expoConfig?.extra?.eas?.projectId,
});

console.log('Expo Push Token:', token.data);
```

### 🔔 Bildirim Gönderme

```typescript
// Backend'den bildirim gönder
const response = await fetch('/api/notifications/v1/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'ExponentPushToken[token]',
    title: 'Test Bildirimi',
    body: 'Bu bir test bildirimidir',
    data: { type: 'test' }
  })
});
```

### 🎯 Bildirim Türleri

- **Kurban Bildirimleri**: Kurban kesimi, organizasyon
- **Bağış Bildirimleri**: Yeni bağışlar, bağış durumu
- **Yayın Bildirimleri**: Canlı yayın başladı, yayın durumu
- **Sistem Bildirimleri**: Güncellemeler, bakım

## 📜 Sertifika Sistemi

### 🏆 Sertifika Türleri

- **Kurban Sertifikası**: Kurban kesimi katılımı
- **Bağış Sertifikası**: Bağış katılımı
- **Etkinlik Sertifikası**: Organizasyon katılımı

### 🔍 Sertifika Doğrulama

```typescript
// QR kod ile doğrulama
const response = await fetch(`/api/certificates/v1/verify/${verificationCode}`);
const certificate = await response.json();

if (certificate.success) {
  console.log('Sertifika doğrulandı:', certificate.data);
}
```

### 📄 PDF İndirme

```typescript
// Sertifika PDF'i indir
const response = await fetch(`/api/certificates/v1/${certificateId}/download`);
const pdfUrl = response.data.download_url;

// PDF'i aç
window.open(pdfUrl, '_blank');
```

## 🛡️ Güvenlik

### 🔐 Authentication

- JWT token tabanlı authentication
- Refresh token mekanizması
- Token expiration handling
- Secure password hashing (bcrypt)

### 🚦 Rate Limiting

- IP tabanlı rate limiting
- User tabanlı rate limiting
- Redis + Memory fallback
- Configurable limits

### 🛡️ Input Validation

- Pydantic model validation
- SQL injection prevention
- XSS protection
- CORS configuration

### 🔒 Security Headers

- Request ID tracking
- Rate limit headers
- CORS headers
- Security headers

## 📊 Monitoring

### 📈 Health Checks

```bash
# System health
curl http://localhost:8000/health

# Detailed status
curl http://localhost:8000/api/monitor/status

# System resources
curl http://localhost:8000/api/monitor/system
```

### 📊 Metrics

- Response times
- Error rates
- Rate limit hits
- Database performance
- Memory usage
- CPU usage

### 🔍 Logging

- Structured logging
- Request/Response logging
- Error logging
- Performance logging

## 🚀 Deployment

### 🐳 Docker Deployment

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale api=3
```

### ☁️ Cloud Deployment

- **AWS**: ECS, RDS, ElastiCache
- **Google Cloud**: Cloud Run, Cloud SQL, Memorystore
- **Azure**: Container Instances, Database, Cache

### 🔧 Environment Setup

```bash
# Production environment
export NODE_ENV=production
export DEBUG=false
export LOG_LEVEL=WARNING

# Database
export DATABASE_URL=postgresql://user:pass@prod-db:5432/kurban_cebimde

# Redis
export REDIS_URL=redis://prod-redis:6379
```

## 🤝 Katkıda Bulunma

### 🔧 Development Setup

```bash
# Fork repository
git clone https://github.com/your-username/kurban-cebimde.git
cd kurban-cebimde

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes
# Add tests
# Update documentation

# Commit changes
git commit -m "Add amazing feature"

# Push to branch
git push origin feature/amazing-feature

# Create Pull Request
```

### 📋 Contribution Guidelines

1. Fork the repository
2. Create feature branch
3. Write tests
4. Update documentation
5. Submit pull request

### 🧪 Testing Requirements

- Unit tests for new features
- Integration tests for API endpoints
- Error handling tests
- Performance tests

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 Destek

### 🆘 Yardım

- **Email**: support@kurbancebimde.com
- **GitHub Issues**: [Issues](https://github.com/your-org/kurban-cebimde/issues)
- **Documentation**: [Docs](https://docs.kurbancebimde.com)

### 📚 Kaynaklar

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### 🏆 Contributors

- [@your-username](https://github.com/your-username) - Project Lead
- [@contributor1](https://github.com/contributor1) - Backend Developer
- [@contributor2](https://github.com/contributor2) - Frontend Developer

---

<div align="center">

**KurbanCebimde** ile modern kurban organizasyonu! 🐑✨

[![GitHub stars](https://img.shields.io/github/stars/your-org/kurban-cebimde?style=social)](https://github.com/your-org/kurban-cebimde/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/your-org/kurban-cebimde?style=social)](https://github.com/your-org/kurban-cebimde/network)
[![GitHub issues](https://img.shields.io/github/issues/your-org/kurban-cebimde)](https://github.com/your-org/kurban-cebimde/issues)

</div>