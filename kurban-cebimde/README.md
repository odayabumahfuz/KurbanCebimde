# Kurban Cebimde - Canlı Yayın ve Bağış Platformu

## 📱 Basit Açıklama (Teknik Olmayanlar İçin)

**Kurban Cebimde** nedir?
- Kurban bağışı yapabileceğiniz ve canlı yayın izleyebileceğiniz bir mobil uygulama
- Bağış yaptığınız kurbanın kesimini canlı olarak izleyebilirsiniz
- Kesim sonrası sertifika ve video alabilirsiniz

**Nasıl Çalışır?**
1. **Kullanıcı**: Uygulamayı indirir, bağış yapar, yayını izler
2. **Admin**: Yayını başlatır, kamerayı açar, kesimi yapar
3. **Sistem**: Bağışları kaydeder, ödemeleri işler, sertifika üretir

**Teknik Bileşenler:**
- **Mobil Uygulama**: iOS ve Android (React Native)
- **Web Paneli**: Yönetim için (React)
- **Sunucu**: Veritabanı ve API (Python FastAPI)
- **Canlı Yayın**: WebRTC teknolojisi (LiveKit)
- **Ödeme**: Güvenli ödeme sistemi
- **Bildirim**: SMS ve push bildirimleri

**Yayın Tarihi**: En geç 9 Ekim 2024

---

## ⚠️ Mevcut Durum ve Kalan İşler

### ✅ Tamamlananlar
- [x] Proje yapısı ve konfigürasyon
- [x] Backend API geliştirme
- [x] Mobil uygulama temel yapısı
- [x] Canlı yayın sistemi (LiveKit)
- [x] Ödeme entegrasyonu
- [x] Bildirim sistemi
- [x] Admin paneli
- [x] Test senaryoları

### 🔧 WebRTC'den Kaynaklanan Hatalar
- **iOS Simulator**: WebRTC tam desteklenmiyor (gerçek cihaz gerekli)
- **Android Emulator**: Bazı cihazlarda kamera/mikrofon sorunları
- **Ağ Bağlantısı**: Zayıf internet bağlantısında yayın kesintileri
- **Cihaz Uyumluluğu**: Eski Android cihazlarda (API 24 altı) sorunlar

### 📋 Kalan İşler (9 Ekim'e Kadar)

#### Yüksek Öncelik
- [ ] **WebRTC hatalarının düzeltilmesi**
  - iOS gerçek cihaz testleri
  - Android cihaz uyumluluk testleri
  - Ağ kesintilerinde otomatik yeniden bağlanma
- [ ] **Son testler ve hata düzeltmeleri**
  - Canlı yayın stabilite testleri
  - Ödeme akışı testleri
  - Bildirim sistemi testleri
- [ ] **Mağaza yayın hazırlığı**
  - App Store ve Google Play Store metadata
  - Gizlilik politikası ve kullanım şartları
  - Uygulama açıklamaları ve ekran görüntüleri

#### Orta Öncelik
- [ ] **Performans optimizasyonu**
  - Yayın kalitesi ayarları
  - Bellek kullanımı optimizasyonu
  - Batarya tüketimi iyileştirmeleri
- [ ] **Kullanıcı deneyimi iyileştirmeleri**
  - Hata mesajlarının Türkçeleştirilmesi
  - Yükleme ekranları ve animasyonlar
  - Offline mod desteği

#### Düşük Öncelik
- [ ] **Ek özellikler**
  - Çoklu dil desteği (Arapça, İngilizce)
  - Gelişmiş raporlama
  - Sosyal medya paylaşımı

### 🚨 Kritik Sorunlar
1. **WebRTC Stabilite**: Canlı yayında kesintiler
2. **Cihaz Uyumluluğu**: Bazı Android cihazlarda çalışmama
3. **Ağ Optimizasyonu**: Yavaş internet bağlantısında sorunlar

### 📅 Zaman Çizelgesi
- **2-3 Ekim**: WebRTC hatalarının düzeltilmesi
- **4-5 Ekim**: Son testler ve hata düzeltmeleri
- **6-7 Ekim**: Mağaza yayın hazırlığı
- **8-9 Ekim**: Final testler ve yayın

---

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

## Test Senaryoları ve Checklist

### 1) Ortam & Giriş – Temel Sağlık

#### TS-01 – Health Check
**Amaç**: API ve sürüm hazır mı?

**Önkoşul**: Staging domain (HTTPS), backend ayakta.

**Adımlar**:
- Tarayıcı/terminal: `GET https://api-stg.../api/v1/healthz`
- `GET https://api-stg.../api/v1/version`

**Beklenen**: `{"status":"ok"}` + versiyon/git-sha dönmeli (200).

**Kanıt**: Ekran görüntüsü + cURL çıktısı.

#### TS-02 – Mobil ENV Doğrulama
**Amaç**: APK/IPA doğru API URL'ine mi vuruyor?

**Önkoşul**: Staging build (APP_ENV=staging).

**Adımlar**:
- App açılışında console.log ile ENV ve apiUrl logla.
- Android: `adb logcat | find "API_BASE"` / iOS: Xcode console.

**Beklenen**: `ENV=staging`, `apiUrl=https://api-stg.../api/v1`.

**Kanıt**: Log ekran görüntüsü.

#### TS-03 – CORS & HTTPS
**Amaç**: Panel → API çağrıları sorunsuz mu?

**Adımlar**: Panelden giriş sayfasını aç, Network tab'da XHR'leri izle.

**Beklenen**: Tüm XHR'ler 200/204/201, CORS hatası yok.

**Kanıt**: DevTools screenshot.

#### TS-04 – Auth: OTP Login (Kullanıcı)
**Amaç**: OTP akışı çalışıyor mu?

**Adımlar**: Kullanıcı uygulamasında telefon gir → OTP gönder → doğrula.

**Beklenen**: 1) SMS geliyor 2) app token alıyor 3) `/auth/me` 200.

**Kanıt**: App ekranı + SMS ekran görüntüsü + `/auth/me` log.

#### TS-05 – Auth: Admin Login
**Amaç**: Admin app ve panel giriş.

**Adımlar**: Admin app'te ve panelde admin kullanıcıyla login.

**Beklenen**: `role=admin` ile yetkili ekranlar açılır.

**Kanıt**: Ekran görüntüleri.

### 2) Yayın – Publish & Watch

#### TS-06 – Yayın Oluştur (Admin Panel)
**Amaç**: Stream kaydı oluşuyor mu?

**Adımlar**: Panel → "Yayın Oluştur" (bağış/animal seç).

**Beklenen**: `/streams` 201; panel listede "scheduled/draft".

**Kanıt**: Panel ekran + Network log.

#### TS-07 – Yayın Başlat (Admin Mobil – Publisher)
**Amaç**: Admin app oda token alıp yayına girebiliyor mu?

**Adımlar**:
- Admin app'te oluşturulan yayına gir → "Başlat".
- `/streams/{id}/start` → token → LiveKit'e bağlan.

**Beklenen**: 1–3 sn içinde kamera açılır, "LIVE" durumu; `/streams/{id}` status=live.

**Kanıt**: Ekran kaydı + backend log (room started).

#### TS-08 – Yayın İzleme (Kullanıcı App + Panel)
**Amaç**: Subscriber olarak aynı odayı izleme.

**Adımlar**:
- Kullanıcı app'te "Canlı Yayınlar" → yayına gir.
- Panelde aynı yayını izleme bileşeni aç.

**Beklenen**: Her iki tarafta da 2–3 sn'de görüntü/ses. Drop-frame < %3.

**Kanıt**: İki ekrandan kısa video + LiveKit dashboard metriki (varsa).

### 3) Bildirim & SMS

#### TS-09 – Push Token Kaydı
**Amaç**: Cihaza push token alınıyor ve backend'e kaydediliyor mu?

**Adımlar**: App ilk açılış → izin ver → token backend'e POST.

**Beklenen**: `device_tokens` tablosunda kayıt.

**Kanıt**: DB ekranı/endpoint çıktısı.

#### TS-10 – "Yayın 1 dk içinde başlıyor" Push
**Amaç**: Planlanan yayından 1 dk önce push.

**Adımlar**:
- `scheduled_at = now+2dk` yayını oluştur.
- Cron/job tetikle (manuel endpoint olabilir).

**Beklenen**: Kullanıcı app'te push bildirimi görünsün; tıklayınca yayına gitsin (deep link).

**Kanıt**: Bildirim screenshot + app navigation videosu.

#### TS-11 – NetGSM SMS – OTP
**Amaç**: OTP SMS geliyor mu (sandbox/gerçek hat)?

**Adımlar**: OTP iste → gelen kodla doğrula.

**Beklenen**: NetGSM response 200; SMS ulaştı.

**Kanıt**: SMS ekran görüntüsü + backend log.

#### TS-12 – NetGSM SMS – Yayın Hatırlatma
**Amaç**: Şablonlu SMS (donation_id, zaman).

**Adımlar**: `/notify/stream-1min` tetikle.

**Beklenen**: Mesaj metni doğru değişkenlerle gelmeli.

**Kanıt**: SMS görüntüsü + payload log.

### 4) Ödeme (Sandbox) + Webhook

PSP olarak hangisini seçtiysek (ör. iyzico/PayTR/EsnekPOS/Stripe) test kartlarıyla ilerle.

#### TS-13 – Checkout Link Oluşturma
**Amaç**: Hosted Payment Page linki alınıyor mu?

**Adımlar**: App → "Bağış Yap" → `/donations/checkout`.

**Beklenen**: 200 + `payment_url`.

**Kanıt**: Network log.

#### TS-14 – Ödeme Başarılı
**Amaç**: HPP'de test kartla başarı.

**Adımlar**: `payment_url`'ü aç → test kart → success → redirect → webhook gelir.

**Beklenen**: `payments.status=paid`, `donations.status=paid`.

**Kanıt**: PSP panel kayıtları + backend DB durumu + app "Bağışlarım"da paid.

#### TS-15 – Ödeme Başarısız
**Amaç**: Fail akışı ve UI hata mesajı.

**Adımlar**: Hatalı kart/3D fail.

**Beklenen**: `payments.status=failed`, kullanıcıya anlaşılır uyarı.

**Kanıt**: UI ekran + webhook/DB log.

#### TS-16 – Webhook Güvenliği
**Amaç**: İmza doğrulama çalışıyor mu?

**Adımlar**: Yanlış imza ile webhook dene (Postman).

**Beklenen**: 401/403; state değişmemeli.

**Kanıt**: Log + DB değişmedi screen.

### 5) Medya Yükleme & Sertifika PDF

#### TS-17 – Presigned Upload (Admin App)
**Amaç**: Video/görsel doğrudan S3'e yükleniyor mu?

**Adımlar**:
- Admin app → "Medya Ekle" → `/media/presign`.
- Dönen URL ile PUT/POST upload.
- `/donations/{id}/media/attach`.

**Beklenen**: S3 objesi oluşur; kullanıcı tarafında listede görünür.

**Kanıt**: S3 console + app listesi ekranı.

#### TS-18 – Büyük Dosya / Yavaş Ağ
**Amaç**: 50–100MB dosya yavaş ağda retry/başarı.

**Adımlar**: Android Emulator'da ağ kısıtla (aşağıda) → yükle.

**Beklenen**: Zaman aşımı yoksa tamamlanır, yoksa anlamlı hata + yeniden dene.

**Kanıt**: Video + log.

#### TS-19 – Sertifika PDF Üretimi
**Amaç**: PDF oluşturuluyor ve indirilebiliyor mu?

**Adımlar**: Admin panel → "Sertifika oluştur" → S3'e yükle.

**Beklenen**: Kullanıcı "Bağışlarım > Sertifika"dan görüntüler/indirir.

**Kanıt**: PDF açılmış ekran görüntüsü.

#### TS-20 – QR Doğrulama
**Amaç**: PDF üzerindeki QR ile doğrulama endpoint'i.

**Adımlar**: QR'ı tara → `/certificate/verify?code=...`

**Beklenen**: 200 + geçerli sertifika bilgisi.

**Kanıt**: Tarayıcı ekranı.

### 6) Performans, Ağ Koşulları, Hata Senaryoları

#### TS-21 – Ağ Koşulları (Android)
**Amaç**: Zayıf ağda yayın & izleme kararlılığı.

**Adımlar**:
- Emulator: Extended controls > Cellular → 2G/3G; Network → packet loss %5–10.

**Beklenen**: Yayın düşse bile 5 sn içinde reconnect.

**Kanıt**: Video + LiveKit reconnect log.

#### TS-22 – Ağ Koşulları (iOS)
**Adımlar**: macOS'ta Network Link Conditioner: 3G/Edge profilleri.

**Beklenen**: Görüntü düşük kaliteye inse de kesintisiz veya kısa süreli (reovery).

**Kanıt**: Video.

#### TS-23 – 50 İzleyici İzleme (Staging)
**Amaç**: İzleyici yük testi (HLS varsa daha verimli).

**Adımlar**: 50 adet izleyici (emulator/gerçek) ya da script'li abone.

**Beklenen**: Yayın gecikmesi makul, CPU yükselmez, panel akıcı.

**Kanıt**: LiveKit/egress metrikleri + kısa video.

#### TS-24 – Token Süresi & Saat Hatası
**Amaç**: JWT exp ve cihaz saati sapmasında davranış.

**Adımlar**: Cihaz saatini 10 dk geri/ileri al (test amaçlı).

**Beklenen**: Token exp ise tekrar login yönlendirmesi + net mesaj.

**Kanıt**: Ekran + log.

#### TS-25 – Storage/MIME Güvenliği
**Amaç**: Yanlış tip dosya red.

**Adımlar**: .exe veya yanlış MIME ile yükleme dene.

**Beklenen**: 400/415; dosya kabul edilmesin.

**Kanıt**: Hata mesajı + S3'te obje yok.

#### TS-26 – Bildirim/SMS Rate Limit
**Amaç**: Kısa sürede çoklu istek limiti.

**Adımlar**: 5 sn'de 10 bildirim/SMS gönder.

**Beklenen**: Backend 429 veya queue; sistem çökmesin.

**Kanıt**: Log + yanıtlar.

#### TS-27 – Ödeme Aykırı Durumlar
**Amaç**: Timeout/3D-cancel/refund testleri.

**Adımlar**: PSP sandbox senaryolarını çalıştır.

**Beklenen**: Doğru state transition, kullanıcıya net uyarı.

**Kanıt**: PSP paneli + DB durumları.

### 7) UAT (Gerçek Kullanıcı Senaryoları)

#### TS-28 – Tam Bağış & Yayın Deneyimi
**Akış**: Kayıt → OTP login → bağış sepeti → ödeme → yayın duyurusu → canlı izleme → tamamlanınca medya & sertifika.

**Beklenen**: Baştan sona sorunsuz.

#### TS-29 – Admin Operasyon Akışı
**Akış**: Panelden yayın oluştur → admin app'te başlat/bitir → panelden izleme → medya yükleme → sertifika üret.

**Beklenen**: Tüm adımlar 1 panel + 1 telefonla tamamlanır.

#### TS-30 – Hesap & Profil
Şifre/telefon değişimi, bildirim izinleri, dil seçimi (TR/AR/EN varsa).

#### TS-31 – Çoklu Cihaz
Aynı kullanıcının iki cihazdan aynı anda izleme/push davranışı.

#### TS-32 – Hata Mesajlarının Anlaşılabilirliği
İnternet yok, sunucu kapalı, 401/403/500 mesajları net ve Türkçe.

### 8) Kanıt Toplama & Raporlama

Her test için Screen/Video + backend log + tarih/saat kaydet.

**Hata şablonu**:
- **Başlık**
- **Ortam** (staging/prod), App versiyon, Cihaz/OS
- **Adımlar** (1..n)
- **Beklenen / Gerçek sonuç**
- **Ekran görüntüsü / Loglar**
- **Öncelik** (P0 kritik – P3 düşük)

### 9) Go / No-Go Checklist (Yayın Öncesi)

- [ ] TS-01..TS-32 PASS
- [ ] Sentry error rate < %0.5 (staging)
- [ ] Ödeme sandbox'ta success/fail senaryoları PASS
- [ ] Push & SMS teslim oranı > %90
- [ ] LiveKit publish/watch kararlı (reconnect testi PASS)
- [ ] Sertifika PDF + QR doğrulama PASS
- [ ] Store metadata, izin açıklamaları, gizlilik metinleri hazır
- [ ] EAS production build'leri imzalı ve test edildi

### 10) Faydalı Komutlar (Hızlı)

```bash
# Android logcat
adb logcat | find "API_BASE"
adb logcat | find "axios"

# Cihaz listesi
adb devices

# iOS sim ağ kısıt
# Network Link Conditioner

# Backend run
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Health
curl -i https://api-stg.../api/v1/healthz

# EAS build (staging)
eas build -p android --profile staging
eas build -p ios --profile staging

# EAS Update (OTA küçük fix)
eas update --channel staging
```

---

## Son söz

Bu planı aynı sırayla uygula; araya yeni teknoloji/deneme katma.

**Test Senaryoları**: TS-01'den TS-32'ye kadar tüm senaryoları birebir uygula ve her birine PASS/FAIL ver. Fail olanların hata raporlarını aç; kritikler (P0/P1) çözülmeden prod'a geçme.

---

## 📞 İletişim ve Destek

**Proje Sahibi**: ODAY ABUMAHFUZ
**Geliştirici**: ODAY ABUMAHFUZ
**Teknik Destek**: ODAY ABUMAHFUZ

**GitHub Repository**: https://github.com/odayabumahfuz/KurbanCebimde
**Canlı Demo**: [Demo URL]
**Test Ortamı**: [Staging URL]

---

## 📄 Lisans

Bu proje [Lisans türü] altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 🙏 Teşekkürler

- LiveKit ekibine WebRTC altyapısı için
- Expo ekibine React Native geliştirme ortamı için
- FastAPI ekibine backend framework için
- Tüm açık kaynak katkıda bulunanlara

---

## 👨‍💻 Geliştirici

**Proje**: ODAY ABUMAHFUZ tarafından geliştirilmiştir.

**İletişim**: [İletişim bilgileri]

---

## 🎯 Proje Durumu

<div align="center">

# KurbanCebimde - Modern kurban organizasyonu platformu 🐑✨

[![GitHub Stars](https://img.shields.io/github/stars/odayabumahfuz/KurbanCebimde?style=social)](https://github.com/odayabumahfuz/KurbanCebimde)
[![Issues](https://img.shields.io/github/issues/odayabumahfuz/KurbanCebimde)](https://github.com/odayabumahfuz/KurbanCebimde/issues)

**Made with ❤️ by ODAY ABUMAHFUZ**

</div>
