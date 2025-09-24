# 🐑 KurbanCebimde - Modern Kurban Organizasyon Platformu

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=D04A37)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> Modern kurban organizasyon platformu - Canlı yayın, push bildirimleri ve sertifika sistemi ile

## 🎯 Proje Hakkında

KurbanCebimde, bağış yapan kullanıcıların kurban kesimlerini canlı olarak izleyebildiği, modern bir platformdur. Platform:

- 📱 **React Native Mobil Uygulama** (iOS/Android)
- 🌐 **React Web Admin Paneli** 
- 🔧 **FastAPI Backend Servisi**
- 🎥 **LiveKit Canlı Yayın Entegrasyonu**

## 🚀 Ana Özellikler

### 👤 Kullanıcı Özellikleri
- ✅ Telefon numarası ile güvenli giriş
- ✅ Çoklu bağış türleri (Kurban, Adak, Sadaka)
- ✅ Sepet sistemi ve ödeme işlemleri
- ✅ Canlı kurban kesimi izleme
- ✅ Push bildirimleri
- ✅ Bağış geçmişi ve sertifikalar

### 👑 Admin Özellikleri
- ✅ Kullanıcı ve bağış yönetimi
- ✅ Canlı yayın oluşturma ve kontrolü
- ✅ Gerçek zamanlı istatistikler
- ✅ Web admin paneli
- ✅ Yayın kalitesi ve ayarları

### 🎥 Canlı Yayın Sistemi
- ✅ LiveKit entegrasyonu
- ✅ WebRTC peer-to-peer iletişim
- ✅ Agora SDK alternatif desteği
- ✅ HD video kalitesi
- ✅ Düşük gecikme (Low latency)

## 🏗️ Sistem Mimarisi

```mermaid
graph TB
    A[React Native App] --> D[FastAPI Backend]
    B[Admin Panel Web] --> D
    C[Web Client] --> D
    
    D --> E[PostgreSQL]
    D --> F[Redis Cache]
    D --> G[LiveKit Server]
    
    H[Expo Push Service] --> A
    I[File Storage] --> D
    J[SSL/Nginx] --> D
```

## 📦 Teknoloji Stack

### Frontend
- **React Native + Expo** - Cross-platform mobil app
- **React + TypeScript** - Web admin panel
- **React Navigation** - Navigasyon
- **Context API** - State management

### Backend  
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Ana veritabanı
- **Redis** - Cache ve session
- **SQLAlchemy** - ORM
- **Docker** - Containerization

### Canlı Yayın
- **LiveKit** - Video/audio streaming
- **WebRTC** - P2P communication
- **Agora SDK** - Alternative streaming

## 🚀 Hızlı Başlangıç

### 1. Repository Klonla
```bash
git clone https://github.com/your-org/kurban-cebimde.git
cd kurban-cebimde
```

### 2. Backend Başlat
```bash
cd backend
docker-compose up -d
```

### 3. Mobil Uygulamayı Çalıştır
```bash
cd ../kurban-cebimde
npm install
npx expo start --port 8081
```

### 4. Admin Panel Başlat
```bash
cd admin-panel
npm install
npm run dev -- --port 3001
```

## 🔧 Konfigürasyon

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://postgres:password@localhost:5432/kurban_cebimde
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-super-secret-key
EXPO_ACCESS_TOKEN=your-expo-token

# LiveKit
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# Agora (Alternative)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERT=your-agora-cert
```

### Docker Compose
```yaml
services:
  api:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/kurban_cebimde
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=kurban_cebimde
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    
  redis:
    image: redis:7-alpine
```

## 🧪 Test Senaryosu

### 📱 1 Bilgisayar + 2 Telefon Test
1. **Telefon 1 (Kullanıcı)**:
   - Normal kullanıcı kaydı
   - Bağış yapma
   - Yayın izleme

2. **Telefon 2 (Admin)**:
   - Admin girişi
   - Yayın oluşturma
   - Bildirim gönderme

3. **Bilgisayar (Admin Panel)**:
   - Web admin kontrolü
   - İstatistik takibi
   - Yayın yönetimi

### Test Hesapları
```
Admin: +905551111111 / admin123
User:  +905559876543 / test123
```

## 📚 API Dokümantasyonu

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Ana Endpoint'ler
- `POST /api/v1/auth/login` - Kullanıcı girişi
- `POST /api/v1/donations/` - Bağış oluşturma  
- `GET /api/v1/streams/` - Yayın listesi
- `POST /api/admin/v1/streams/start` - Yayın başlatma

## 🔔 Push Bildirimleri

```typescript
// Token alma
const token = await Notifications.getExpoPushTokenAsync();

// Bildirim gönderme
await fetch('/api/notifications/v1/send', {
  method: 'POST',
  body: JSON.stringify({
    to: token.data,
    title: 'Yayın Başladı',
    body: 'Kurban kesiniz canlı yayını başladı'
  })
});
```

## 📜 Sertifika Sistemi

- **Kurban Sertifikası**: Kesim katılım belgesi
- **Bağış Sertifikası**: Bağış onay belgesi  
- **QR Kod Doğrulama**: Sertifika authenticity
- **PDF İndirme**: Yazdırılabilir format

## 🏗️ Deployment

### Production Build
```bash
# Mobile app
npx eas build --platform all

# Admin panel  
npm run build

# Backend
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Services
- **AWS**: ECS, RDS, ElastiCache
- **Google Cloud**: Cloud Run, Cloud SQL
- **Azure**: Container Instances, Database

## 📊 Özellikler Roadmap

### ✅ Tamamlandı
- [x] Kullanıcı authentication sistemi
- [x] Bağış ve sepet yönetimi  
- [x] Admin panel temel fonksiyonları
- [x] Canlı yayın entegrasyonu
- [x] Push bildirim sistemi
- [x] Backend API ve database

### 🔄 Devam Eden
- [ ] iOS/Android build optimizasyonu
- [ ] LiveKit performans iyileştirmesi
- [ ] Sertifika sistemi tamamlanması
- [ ] Payment gateway entegrasyonu

### 📋 Planlanan
- [ ] Multi-language desteği (AR/EN/TR)
- [ ] Real-time chat sistemi
- [ ] Advanced analytics dashboard
- [ ] Mobil ödeme entegrasyonu
- [ ] Social media sharing
- [ ] Offline sync özelliği

## 🐛 Bilinen Sorunlar

### Build Issues (Çözüldü ✅)
- ~~iOS "Install pods" hatası~~ → Podfile düzeltildi
- ~~Android "Run gradlew" hatası~~ → New Architecture sorunları çözüldü
- ~~Expo doctor uyarıları~~ → Schema hataları düzeltildi

### Devam Eden
- LiveKit connection stability
- Push notification delivery rate
- Android APK file size optimization

## 🤝 Katkıda Bulunma

1. Fork repository
2. Feature branch oluştur (`git checkout -b feature/amazing-feature`)
3. Değişiklikleri commit et (`git commit -m 'Add amazing feature'`)
4. Branch'i push et (`git push origin feature/amazing-feature`)  
5. Pull Request oluştur

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Email**: support@kurbancebimde.com
- **GitHub**: [Issues](https://github.com/your-org/kurban-cebimde/issues)
- **Website**: https://kurbancebimde.com

---

<div align="center">

**KurbanCebimde** - Modern kurban organizasyonu platformu 🐑✨

[![GitHub stars](https://img.shields.io/github/stars/your-org/kurban-cebimde?style=social)](https://github.com/your-org/kurban-cebimde/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/your-org/kurban-cebimde)](https://github.com/your-org/kurban-cebimde/issues)

Made with ❤️ by the KurbanCebimde Team

</div>
