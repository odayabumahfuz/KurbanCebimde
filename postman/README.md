# 🚀 KurbanCebimde API Test Koleksiyonu

## 📋 İçerik

Bu klasör KurbanCebimde API'si için kapsamlı test koleksiyonu içerir:

- **Postman Collection**: Tüm API endpoint'leri için hazır test istekleri
- **Environment**: Farklı ortamlar için konfigürasyon
- **Test Scenarios**: Detaylı test senaryoları ve örnekler
- **Error Testing**: Hata yönetimi testleri

## 🛠️ Kurulum

### 1. Postman Koleksiyonunu İçe Aktar

1. Postman'i aç
2. `Import` butonuna tıkla
3. `KurbanCebimde_API.postman_collection.json` dosyasını seç
4. Koleksiyon otomatik olarak yüklenecek

### 2. Environment Ayarla

1. Postman'de `Environments` sekmesine git
2. `Import` butonuna tıkla
3. `KurbanCebimde_Environment.postman_environment.json` dosyasını seç
4. Environment'ı aktif hale getir

### 3. Environment Variables

```json
{
  "base_url": "http://localhost:8000",
  "access_token": "",
  "user_id": "",
  "certificate_id": "",
  "verification_code": "",
  "expo_push_token": "ExponentPushToken[test_token_here]"
}
```

## 🧪 Test Senaryoları

### 1. 🔐 Authentication Flow
```bash
# 1. Kullanıcı kaydı
POST /api/v1/auth/register

# 2. Kullanıcı girişi  
POST /api/v1/auth/login

# 3. Mevcut kullanıcı bilgileri
GET /api/v1/auth/me

# 4. Push token kaydet
POST /api/v1/user/push-token
```

### 2. 🔔 Push Notifications
```bash
# Test bildirimi
GET /api/notifications/v1/test

# Tek bildirim
POST /api/notifications/v1/send

# Toplu bildirim
POST /api/notifications/v1/send-bulk

# Kurban bildirimi
POST /api/notifications/v1/kurban

# Bağış bildirimi
POST /api/notifications/v1/donation

# Yayın bildirimi
POST /api/notifications/v1/stream
```

### 3. 📜 Certificates
```bash
# Sertifika oluştur
POST /api/certificates/v1/create

# Sertifika detayı
GET /api/certificates/v1/{certificate_id}

# Kullanıcı sertifikaları
GET /api/certificates/v1/user/{user_id}

# Sertifika doğrula
GET /api/certificates/v1/verify/{verification_code}

# İstatistikler
GET /api/certificates/v1/stats/overview
```

### 4. 🧪 Test Endpoints
```bash
# Test root
GET /api/test/v1/

# Servis testleri
GET /api/test/v1/notification
GET /api/test/v1/certificate
GET /api/test/v1/integration

# Servis durumları
GET /api/test/v1/status
```

### 5. 🚨 Error Testing
```bash
# Error test root
GET /api/error-test/v1/

# Farklı error türleri
GET /api/error-test/v1/validation
GET /api/error-test/v1/authentication
GET /api/error-test/v1/authorization
GET /api/error-test/v1/not_found
GET /api/error-test/v1/internal_server
GET /api/error-test/v1/database
GET /api/error-test/v1/rate_limit
GET /api/error-test/v1/random
```

## 🔧 Otomatik Test Scripts

### Bash Script
```bash
#!/bin/bash
BASE_URL="http://localhost:8000"

echo "🧪 KurbanCebimde API Test Başlatılıyor..."

# Health check
curl -s "$BASE_URL/health" | jq '.'

# Test endpoints
curl -s "$BASE_URL/api/test/v1/" | jq '.'
curl -s "$BASE_URL/api/test/v1/notification" | jq '.'
curl -s "$BASE_URL/api/test/v1/certificate" | jq '.'
curl -s "$BASE_URL/api/test/v1/integration" | jq '.'
```

### Python Script
```python
import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, method="GET", data=None):
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}")
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=data)
        
        print(f"✅ {method} {endpoint}: {response.status_code}")
        return response.json()
    except Exception as e:
        print(f"❌ {method} {endpoint}: {e}")
        return None

# Test endpoints
test_endpoint("/health")
test_endpoint("/api/test/v1/")
test_endpoint("/api/test/v1/notification")
test_endpoint("/api/test/v1/certificate")
```

### JavaScript Script
```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testEndpoint(endpoint, method = 'GET', data = null) {
    try {
        let response;
        if (method === 'GET') {
            response = await axios.get(`${BASE_URL}${endpoint}`);
        } else if (method === 'POST') {
            response = await axios.post(`${BASE_URL}${endpoint}`, data);
        }
        
        console.log(`✅ ${method} ${endpoint}: ${response.status}`);
        return response.data;
    } catch (error) {
        console.log(`❌ ${method} ${endpoint}: ${error.message}`);
        return null;
    }
}

// Test endpoints
testEndpoint('/health');
testEndpoint('/api/test/v1/');
testEndpoint('/api/test/v1/notification');
testEndpoint('/api/test/v1/certificate');
```

## 📊 Test Checklist

### ✅ Functional Tests
- [ ] Authentication flow (register, login, me)
- [ ] Push notification sending (single, bulk, specialized)
- [ ] Certificate creation and management
- [ ] Certificate verification
- [ ] PDF generation
- [ ] Statistics and reporting

### ✅ Error Handling Tests
- [ ] Validation errors
- [ ] Authentication errors
- [ ] Authorization errors
- [ ] Not found errors
- [ ] Internal server errors
- [ ] Database errors
- [ ] External service errors

### ✅ Performance Tests
- [ ] Rate limiting
- [ ] Response times
- [ ] Concurrent requests
- [ ] Memory usage
- [ ] Database performance

### ✅ Security Tests
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Authentication bypass

## 🎯 Test Data

### Sample Users
```json
{
  "users": [
    {
      "name": "Ahmet",
      "surname": "Yılmaz",
      "phone": "5551234567",
      "email": "ahmet@example.com",
      "password": "password123"
    },
    {
      "name": "Fatma",
      "surname": "Demir",
      "phone": "5557654321",
      "email": "fatma@example.com",
      "password": "password456"
    }
  ]
}
```

### Sample Certificates
```json
{
  "certificates": [
    {
      "type": "kurban",
      "title": "Kurban Katılım Sertifikası",
      "description": "2024 Kurban Bayramı katılım sertifikası",
      "metadata": {
        "animal_type": "koyun",
        "weight": "45kg",
        "location": "Ankara",
        "imam": "Mehmet Yılmaz"
      }
    }
  ]
}
```

### Sample Notifications
```json
{
  "notifications": [
    {
      "type": "kurban",
      "title": "🐑 Kurban Kesimi Başladı",
      "body": "2024 Kurban Organizasyonu başladı!",
      "data": {
        "kurban_id": "kurban_123",
        "type": "kurban"
      }
    }
  ]
}
```

## 🚀 Performance Benchmarks

### Expected Response Times
- Health check: < 100ms
- Authentication: < 500ms
- Push notifications: < 1000ms
- Certificate operations: < 300ms
- Statistics: < 200ms

### Rate Limits
- General API: 100 requests/hour
- Authentication: 10 requests/minute
- Push notifications: 50 requests/hour
- Certificate operations: 200 requests/hour

### Concurrent Users
- Expected: 100 concurrent users
- Peak: 500 concurrent users
- Stress test: 1000+ concurrent users

## 🔍 API Documentation

### Swagger UI
- URL: `http://localhost:8000/docs`
- Interactive API documentation
- Test endpoints directly from browser

### ReDoc
- URL: `http://localhost:8000/redoc`
- Clean, readable API documentation
- Better for sharing with team

## 🛡️ Security Testing

### Authentication Tests
```bash
# Geçersiz token
GET /api/v1/auth/me
Authorization: Bearer invalid_token

# Eksik token
GET /api/v1/auth/me
# Authorization header yok
```

### Rate Limiting Tests
```bash
# Çok fazla istek gönder
for i in {1..150}; do
  curl -X GET "http://localhost:8000/api/test/v1/"
done
```

### Input Validation Tests
```bash
# Geçersiz telefon numarası
POST /api/v1/auth/register
{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "phone": "invalid_phone",
  "email": "ahmet@example.com",
  "password": "password123"
}
```

## 📝 Test Reports

### Postman Test Results
- Her test çalıştırıldığında sonuçlar otomatik kaydedilir
- Test raporları `Test Results` sekmesinde görüntülenebilir
- Başarılı/başarısız testler ayrı ayrı listelenir

### Performance Metrics
- Response time
- Status codes
- Error rates
- Throughput

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Backend servisinin çalıştığından emin ol
   - Port 8000'in açık olduğunu kontrol et

2. **Authentication Errors**
   - Token'ın geçerli olduğunu kontrol et
   - Token süresinin dolmadığını kontrol et

3. **Rate Limit Errors**
   - Çok fazla istek gönderilmiş olabilir
   - Rate limit süresini bekle

4. **Validation Errors**
   - Gönderilen verilerin formatını kontrol et
   - Gerekli alanların eksik olmadığını kontrol et

### Debug Tips

1. **Request/Response Logging**
   - Postman Console'da tüm istekleri görüntüle
   - Response body'yi kontrol et

2. **Environment Variables**
   - Environment değişkenlerinin doğru ayarlandığını kontrol et
   - Base URL'in doğru olduğunu kontrol et

3. **Headers**
   - Content-Type header'ının doğru olduğunu kontrol et
   - Authorization header'ının doğru formatda olduğunu kontrol et

## 📞 Support

### API Support
- Email: api-support@kurbancebimde.com
- Documentation: http://localhost:8000/docs
- Issues: GitHub Issues

### Test Support
- Test questions: test-support@kurbancebimde.com
- Bug reports: GitHub Issues
- Feature requests: GitHub Issues

## 🔄 Updates

### Version History
- v1.0.0: Initial release with basic endpoints
- v1.1.0: Added error testing endpoints
- v1.2.0: Added rate limiting tests
- v1.3.0: Added performance benchmarks

### Future Plans
- [ ] Automated test suite
- [ ] CI/CD integration
- [ ] Performance monitoring
- [ ] Load testing
- [ ] Security scanning
