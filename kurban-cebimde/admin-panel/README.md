# Kurban Cebimde Admin Panel

Bu proje, Kurban Cebimde platformu için React tabanlı admin panel'idir.

## 🚀 Özellikler

- **Modern UI**: Tailwind CSS ile tasarlanmış responsive arayüz
- **Authentication**: JWT tabanlı güvenli giriş sistemi
- **Dashboard**: Gerçek zamanlı metrikler ve istatistikler
- **User Management**: Kullanıcı yönetimi ve rol atama
- **Order Management**: Sipariş takibi ve durum güncelleme
- **Stream Management**: Canlı yayın yönetimi
- **Certificate Generation**: Sertifika oluşturma ve yönetimi
- **Audit Logs**: Detaylı işlem kayıtları

## 🛠️ Teknolojiler

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Fetch API
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Gereksinimler

- Node.js 18+ 
- npm 8+
- Backend API çalışır durumda olmalı

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle
```bash
cd admin-panel
npm install
```

### 2. Environment Variables
`.env` dosyası oluşturun:
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
ADMIN_API_PREFIX=/api/admin/v1

# App Configuration
VITE_APP_TITLE=Kurban Cebimde Admin Panel
VITE_APP_VERSION=1.0.0
```

### 3. Development Server'ı Başlat
```bash
npm run dev
```

Admin panel geliştirme modunda `http://localhost:3001` adresinde açılır. Docker Compose ile çalıştırılırsa `http://localhost:3000` üzerinden proxy ile sunulabilir.

## 🔐 Giriş

Demo kullanıcı bilgileri:
- **Email**: admin@kurbancebimde.com
- **Şifre**: Admin123!

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
├── pages/              # Sayfa bileşenleri
│   ├── AdminLoginPage.tsx
│   └── AdminDashboardPage.tsx
├── lib/                # Utility fonksiyonlar ve API client
│   └── adminApi.ts
├── stores/             # State management
├── types/              # TypeScript type definitions
└── App.tsx             # Ana uygulama bileşeni
```

## 🔌 API Entegrasyonu

Admin panel, backend'deki `/api/admin/v1` endpoint'lerini kullanır:

- **Authentication**: `/auth/login`, `/auth/refresh`, `/auth/logout`
- **Dashboard**: `/dashboard`, `/dashboard/users/stats`, `/dashboard/orders/stats`
- **Users**: `/users` (CRUD operations)
- **Orders**: `/orders` (list, update status)
- **Streams**: `/streams` (start, stop, list)
- **Certificates**: `/certificates` (generate, get)
- **Audit**: `/audit` (list logs)

## 🎨 UI Bileşenleri

### Login Sayfası
- Email/şifre girişi
- OTP desteği (opsiyonel)
- Hata mesajları
- Responsive tasarım

### Dashboard
- Metrik kartları (kullanıcı, sipariş, gelir, yayın)
- Son siparişler listesi
- Son kullanıcılar listesi
- Gerçek zamanlı güncelleme

## 🔒 Güvenlik

- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Yetkisiz erişim engelleme
- **Token Refresh**: Otomatik token yenileme
- **Secure Storage**: LocalStorage'da token saklama

## 📱 Responsive Tasarım

- Mobile-first yaklaşım
- Tailwind CSS breakpoint'leri
- Touch-friendly interface
- Cross-browser compatibility

## 🧪 Test

```bash
# Lint check
npm run lint

# Build
npm run build

# Preview build
npm run preview
```

## 🚀 Production

```bash
# Production build
npm run build

# Build'i test et
npm run preview
```

Build edilen dosyalar `dist/` klasöründe oluşur.

## 🔧 Konfigürasyon

### Vite Config
```typescript
// vite.config.ts
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

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          // ... diğer tonlar
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
```

## 📞 Destek

Herhangi bir sorun yaşarsanız:
- GitHub Issues: [Repository Link]
- Email: support@kurbancebimde.com
- Telegram: @kurbancebimde_support

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Not**: Bu admin panel sadece yetkili kullanıcılar tarafından kullanılmalıdır. Güvenlik önlemlerini ihmal etmeyin.
