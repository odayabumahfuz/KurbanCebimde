# Kurban Cebimde - Canlı Yayın ve Bağış Platformu

## Genel Mimari ve Roller

### Uygulamalar

- **Admin Mobil (Publisher)**: iOS/Android. Yayını başlatır/bitirir, medya yükler.
- **Kullanıcı Mobil (Viewer/Donor)**: Yayını izler, bağış/sertifika/medya görür.
- **Süper Admin Web Panel**: Yayını izler, yönetir, moderasyon ve raporlar.

### Servisler

- **Backend (FastAPI)**: Auth, bağış, yayın, ödeme, SMS/Push, medya, sertifika PDF.
- **LiveKit**: Oda yönetimi + WebRTC (admin yayın) + izleme (kullanıcı/panel).
- **Depolama (S3 uyumlu)**: Video/görsel/sertifika PDF.
- **Bildirim**: Expo Push + NetGSM SMS.
- **Ödeme PSP**: (İyzico/PayTR/EsnekPOS/Stripe vb.) HPP (hosted payment page) yönlendirme + webhook.

### Roller & Yetkiler

- **super_admin**: tüm sistem (panel).
- **admin**: odaları yönetir, yayını başlatır, medya yükler.
- **user**: bağış yapar/izler, sertifika/medyayı görür.

## 1) Ortamlar (ENV) ve DNS (İlk Öncelik)

### 1.1 Domain & Alt Domainler

**Prod**
- `api.kurbancebimde.com` → Backend (HTTPS, geçerli SSL)
- `livekit.kurbancebimde.com` → LiveKit (WSS, TURN dahil)
- `panel.kurbancebimde.com` → Admin web
- `cdn.kurbancebimde.com` → S3/Cloudfront varsa

**Staging**
- `api-stg.kurbancebimde.com`, `livekit-stg...`, `panel-stg...`, `cdn-stg...`

> **Not**: Cloudflare DNS + Auto SSL önerilir. Prod'da yalnızca HTTPS kabul et.

### 1.2 Backend .env Şeması

```bash
# FastAPI
ENV=staging|production
PORT=8000
SECRET_KEY=...
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
REDIS_URL=redis://host:6379/0

# LiveKit
LIVEKIT_WS_URL=wss://livekit-stg.kurbancebimde.com
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

# Storage (S3 uyumlu)
S3_ENDPOINT=https://s3.wasabisys.com
S3_BUCKET=kc-stg
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_REGION=us-east-1

# NetGSM
NETGSM_USER=...
NETGSM_PASS=...
NETGSM_HEADER=KURBANCB

# Push (Expo)
EXPO_ACCESS_TOKEN=... # opsiyonel sunucudan göndermek için

# Payment
PAYMENT_PROVIDER=iyzico|paytr|stripe|param|esnekpos
PAYMENT_PUBLIC_KEY=...
PAYMENT_SECRET_KEY=...
PAYMENT_WEBHOOK_SECRET=...
PAYMENT_RETURN_URL_SCHEME=kurbancebimde://pay-return
PAYMENT_RETURN_WEB=https://panel-stg.kurbancebimde.com/pay/return
```

### 1.3 Mobil eas.json & app.config.ts

**eas.json**
```json
{
  "cli": { "version": ">= 13.0.0" },
  "build": {
    "development": { 
      "developmentClient": true, 
      "distribution": "internal", 
      "channel": "dev", 
      "env": { "APP_ENV": "dev" } 
    },
    "staging": { 
      "distribution": "internal", 
      "channel": "staging", 
      "env": { "APP_ENV": "staging" } 
    },
    "production": { 
      "channel": "prod", 
      "env": { "APP_ENV": "production" } 
    }
  },
  "submit": { "production": {} }
}
```

**app.config.ts**
```typescript
const ENV = process.env.APP_ENV ?? "dev";
const cfg = {
  dev: {
    apiUrl: "http://10.0.2.2:8000/api/v1",
    livekitUrl: "wss://livekit-stg.kurbancebimde.com",
    deepLink: "kurbancebimde://"
  },
  staging: {
    apiUrl: "https://api-stg.kurbancebimde.com/api/v1",
    livekitUrl: "wss://livekit-stg.kurbancebimde.com",
    deepLink: "kurbancebimde://"
  },
  production: {
    apiUrl: "https://api.kurbancebimde.com/api/v1",
    livekitUrl: "wss://livekit.kurbancebimde.com",
    deepLink: "kurbancebimde://"
  }
} as const;

export default {
  name: "Kurban Cebimde",
  slug: "kurban-cebimde",
  scheme: "kurbancebimde",
  extra: { ENV, ...cfg[ENV as keyof typeof cfg] },
  plugins: [
    "@livekit/react-native-expo-plugin",
    "@config-plugins/react-native-webrtc"
  ],
  ios: {
    infoPlist: {
      NSCameraUsageDescription: "Canlı yayın için kamera.",
      NSMicrophoneUsageDescription: "Canlı yayın için mikrofon."
    }
  },
  android: {
    permissions: [
      "CAMERA",
      "RECORD_AUDIO",
      "FOREGROUND_SERVICE_CAMERA",
      "FOREGROUND_SERVICE_MICROPHONE"
    ]
  }
};
```

> **Kural**: APK/IPA'da `Constants.expoConfig.extra.apiUrl` mutlaka staging/prod HTTPS olsun. Dev'de Android emulator için `10.0.2.2`.

## 2) Backend Uygulama Yüzeyi (FastAPI)

### 2.1 Tablolar (özet)

- `users` (id, phone, name, role, created_at)
- `donations` (id, user_id, amount, currency, status, animal_type, created_at)
- `streams` (id, donation_id?, room_id, status, scheduled_at, started_at, ended_at)
- `media_assets` (id, donation_id, type[video|image|pdf], s3_key, url, created_at)
- `payments` (id, donation_id, provider, intent_id, status, amount, created_at)
- `device_tokens` (id, user_id, expo_token, platform, created_at)
- `sms_messages` (id, to, template, payload, status, created_at)
- `notifications` (id, user_id, type, payload, status, created_at)
- `audit_logs` (actor_id, action, entity, entity_id, meta, created_at)

### 2.2 Durum Makineleri

**Donation.status**: `created` → `payment_pending` → `paid` → `assigned` → `scheduled` → `live` → `completed` → `delivered`

**Stream.status**: `draft` → `scheduled` → `live` → `ended` → `archived` → `failed`

### 2.3 Auth & RBAC

JWT access/refresh. role alanına göre bağımlı uçlar:
- `/admin/*` (admin/super_admin)
- `/super/*` (sadece super_admin)
- `/me/*` (user)

### 2.4 Yayın (LiveKit) Uçları

- `POST /streams` (admin): oda oluşturur (DB: streams.draft)
- `POST /streams/{id}/schedule` (admin): scheduled_at set → status scheduled
- `POST /streams/{id}/start` (admin): LiveKit room açımı + publisher token üret → status live
- `POST /streams/{id}/stop` (admin): room kapat/egrss durdur → status ended
- `GET /streams/active` (panel/kullanıcı): izlenebilir yayın listesi
- `GET /streams/{id}/token?role=publisher|subscriber`:
  - publisher: admin mobil için
  - subscriber: kullanıcı/panel için
- (Opsiyonel) `POST /streams/{id}/egress/hls/start|stop` (yüksek trafik için HLS)

> **Kabul Kriteri**: Admin mobil "Yayın Başlat" dediğinde 3 sn içinde token gelsin, oda açılıp video başlasın; kullanıcı uygulaması aynı odayı 2 sn içinde oynatsın.

### 2.5 Medya Yükleme

- `POST /media/presign` (admin): {key, url, fields} döner (S3 presigned POST/PUT)
- Admin app/panel dosyayı doğrudan S3'e yükler.
- `POST /donations/{id}/media/attach` (admin): s3_key'i donasyona bağlar.
- Kullanıcı app: `GET /me/donations/{id}/media` → indir/görüntüle.

### 2.6 Sertifika/Rapor PDF

- `POST /donations/{id}/certificate` (admin veya event-driven): PDF üret → S3'e koy → media_assets'e ekle.
- Kullanıcı app: `GET /me/donations/{id}/certificate` → PDF viewer.

### 2.7 Ödeme

- `POST /donations/checkout`:
  - Sunucu PSP'den Hosted Payment Page linki üretir.
  - Mobil app web tarayıcıda açar (iOS SFSafariViewController / Android Custom Tabs).
- `GET /payments/return` (web): success/fail redirect (panel URL).
- `POST /payments/webhook`: PSP imza doğrulama + donations.status = paid.

> **Kabul Kriteri**: PSP sandbox'ta ödeme tamamlanınca 10 sn içinde bağış paid olur, kullanıcı "Bağışlarım"da görür.

### 2.8 SMS & Push

- `POST /auth/otp/send` → NetGSM (OTP)
- `POST /auth/otp/verify`
- `POST /notify/stream-1min` (cron/job): canlı yayın başlamadan 1 dk önce hem Push hem SMS gönder.
- `POST /notify/custom` (admin): şablon + parametrelerle tekil/çoklu gönderim.

> **Kabul Kriteri**: Staging'de %95 teslim, hatalarda retry/backoff.

### 2.9 Gözlemlenebilirlik

- **Sentry**: backend & mobil
- **Request log**: path, latency, user_id
- **Metrics**: Prometheus/Grafana (opsiyonel)
- **LiveKit webhooks**: room started/ended → otomatik status güncelle

## 3) Admin Mobil (Publisher) – Expo

### 3.1 LiveKit Kurulumu

**Paketler**: `@livekit/react-native` `@livekit/react-native-expo-plugin` `@livekit/react-native-webrtc` `livekit-client`

app.config.ts pluginleri eklendi (yukarıda).

> **Expo Go değil**: development client veya EAS build (staging/prod).

### 3.2 Akışlar

1. **Giriş & Yetki**: phone + OTP veya admin hesabı; role kontrolü
2. **Yayın Kartı**: bağış bilgileri, hayvan türü, süre sayacı
3. **Başlat**: `/streams/{id}/start` → token fetch → `<LiveKitRoom ... audio video connect />`
4. **Bitir**: `/streams/{id}/stop` → oda kapanır, egress varsa durdurulur
5. **Medya Yükleme**: galeri/kamera → `/media/presign` → S3 upload → attach
6. **Uyarılar**: Zayıf ağ, kamera/mikrofon izinleri, tekrar bağlanma

> **Kabul Kriteri**: 1 tıkla yayın başlar, kesinti olursa 5 sn içinde otomatik reconnect; bitirince status "ended".

## 4) Kullanıcı Mobil (Viewer)

### 4.1 Akışlar

1. **Auth**: phone + OTP
2. **Bağış**: liste, detay, ödeme (HPP web), durum takibi
3. **Yayın İzleme**: Subscriber token ile LiveKitRoom (veya HLS player)
4. **Bildirimler**: push topic (ör. donation_id bazlı)
5. **Medya & PDF**: "Bağışlarım" → medya listesi, sertifika indir/görüntüle

> **Kabul Kriteri**: Kullanıcı yayın sayfasına girince video 2–3 sn'de oynar, geri dönünce state temizlenir.

## 5) Web Admin Panel (Super Admin)

Giriş (RBAC), kullanıcı/bağış/stream listeleri.

**Yayın İzleme**: LiveKit JS (subscriber) ile embed player.

**Medya Yönetimi**: sürükle-bırak yükleme (S3 presigned).

**Raporlar**: günlük/haftalık bağış, yayın süresi, başarı oranları.

> **Kabul Kriteri**: Panelden aynı anda 3 yayın izlenebilsin, CPU %70'i geçmesin.

## 6) CI/CD ve Branch Stratejisi

**Git**: main(prod), develop(staging), feature branşları.

**CI (GitHub Actions)**:
- Python: lint (ruff), test (pytest)
- RN: lint (eslint), type-check (tsc), unit test (jest)

**EAS**
- development: dev client
- staging: Internal testing (Play Internal / TestFlight)
- production: Store

**EAS Update**: küçük UI fix'lerini kanala göre (dev/staging/prod) OTA.

## 7) Güvenlik

- HTTPS zorunlu; HSTS.
- JWT süresi/yenileme; admin uçları IP-rate limit.
- Webhook HMAC doğrulama.
- S3 bucket policy (public read yok; presigned GET ile ver).
- PII maskeleme (loglarda telefon vs.)
- Dosya yüklemede MIME doğrulama + boyut sınırları.

## 8) Test Stratejisi (Ağır Testler Dahil)

### 8.1 Otomatik

- **Backend Unit**: Auth, token, payments webhook stub, presigned URL.
- **Backend Integration**: /streams flow, donation state machine.
- **Mobil Unit/Jest**: servis çağrıları, reducer/store.
- **E2E (Detox)**: login → bağış → yayın izleme → medya görüntüleme.

### 8.2 Manuel Cihaz Matrisi

iOS (12–15 serisi), iOS 15.1+; Android minSDK 24, Samsung/Xiaomi/Pixel.

**Ağ senaryoları**: 3G, %10 paket kaybı, yüksek gecikme.

### 8.3 Yayın Yük Testi

Staging oda: admin publish + 50 subscriber (kullanıcı/panel karışık).

**Ölç**: gecikme, drop frame, reconnect sayısı.

### 8.4 Bildirim/SMS

100 push + 100 SMS batch → teslimat oranı, gecikme, retry.

### 8.5 Ödeme

PSP sandbox: success/fail/timeout/iade; webhook doğrulama.

> **Release Gate (geçiş kriteri)**: Tüm yukarıdaki testler "passed", Sentry error rate < %0.5, cold start < 2.5s, CPU/mem sınır içinde.

## 9) Yayın Süreci (Mağazalar)

### 9.1 Android (Play Store)

İç test → Kapalı test → Üretim.

Gizlilik formu, izin açıklamaları (kamera/mikrofon), external payment açıklaması (bağış web sayfası).

### 9.2 iOS (App Store)

TestFlight (internal/external), sonra "Submit for Review".

"Donations via web checkout" notu, Apple Pay opsiyonunu ayrıca değerlendir.

Privacy manifest, izin metinleri.

> **Kural**: Dijital içerik satışı yok; bağışlar harici HPP ile yapılır → IAP gereksinimi tetiklenmez.

## 10) Yayın Sonrası Operasyon

- **Sentry alarm**, LiveKit oda hataları için webhook/alert.
- **Uptime (healthz)**, RPO/RTO hedefleri, günlük yedekleme.
- **Runbook**: ödeme-webhook düşerse manuel tetik adımı; NetGSM kesintisinde fallback.

## 11) Günlük İş Akışları (Check-list)

### 11.1 Geliştirici

- APP_ENV doğrula (splash'ta API URL'yi console'a yaz).
- Yeni endpoint → pytest + OpenAPI docs güncelle.
- UI değişikliği → Storybook/preview (opsiyonel) + EAS Update dev/staging.

### 11.2 Operasyon

- Log ve hata raporu (Sentry).
- PSP mutabakatı: Günlük "paid" vs PSP dashboard.
- Storage yaşam döngüsü: 90 gün üstü ham videoları arşive taşı.

## 12) Uygulanabilir "Bugün Başla" Planı (2 Sprint)

### Sprint 1 (Altyapı + Yayın)

- DNS/SSL: staging alt domainleri.
- Backend: /healthz, /version, CORS & HTTPS zorunlu.
- LiveKit bağlantısı: token endpoint'leri; admin mobil dev client build.
- Admin mobilde Yayın Başlat/Bitir akışı (publisher token).
- Kullanıcı mobilde İzle (subscriber token).
- Panelde LiveKit JS ile izleme.
- Logs/Sentry.

> **Kabul**: Admin iOS/Android yayın açıyor; kullanıcı & panel aynı anda izliyor.

### Sprint 2 (Bildirim/SMS/Ödeme/Medya)

- NetGSM OTP + "Yayın başlıyor" şablonu (push + SMS).
- Ödeme: PSP HPP entegrasyonu + webhook; bağış state'leri güncelleniyor.
- Medya: S3 presigned upload; adminden yükle, kullanıcıdan görüntüle.
- Sertifika PDF üretimi + QR doğrulama endpoint'i.
- E2E testler + cihaz matrisi + yük testleri.
- TestFlight & Play Internal dağıtım.

> **Kabul**: Sandbox ödemeler paid; bildirim & SMS çalışıyor; medya/sertifika akışı tamam.

## 13) Komut Çizelgesi (Cheat Sheet)

### Mobil

```bash
# Dev client (LiveKit için şart)
eas build --profile development --platform ios
eas build --profile development --platform android

# Staging/Prod build
eas build -p android --profile staging
eas build -p ios --profile staging
eas build -p android --profile production
eas build -p ios --profile production

# OTA
eas update --channel staging
eas update --channel prod
```

### Backend

```bash
# Migrations
alembic upgrade head

# Run
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Health
curl -i https://api-stg.kurbancebimde.com/api/v1/healthz
```

### LiveKit (örnek)

> oda token üretmeyi backend yapacak; local debug için cli kullanabilirsin

### NetGSM (örnek)

> backend üzerinden test endpoint: `/debug/sms?to=5XXXXXXXXX&msg=...`

## 14) README'ye Eklemen İçin Örnek Başlıklar

- Mimari Özeti
- Ortamlar & DNS
- Backend .env ve Çalıştırma
- Mobil app.config.ts & eas.json
- Yayın Sistemi (LiveKit)
- Medya Yükleme (S3 presigned)
- Ödeme (HPP + webhook)
- Bildirim & SMS
- Durum Makineleri ve Akış Şemaları
- Test Planı & Cihaz Matrisi
- CI/CD & EAS Update Kanalları
- Güvenlik & Uyum (App Store/Play)
- Operasyon Runbook

---

## Son söz

Bu planı aynı sırayla uygula; araya yeni teknoloji/deneme katma.
