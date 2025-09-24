# 🧪 KurbanCebimde API Test Senaryoları

## 📋 Test Senaryoları Listesi

### 1. 🔐 Authentication Flow Test
```bash
# 1. Kullanıcı kaydı
POST /api/v1/auth/register
{
  "name": "Ahmet",
  "surname": "Yılmaz", 
  "phone": "5551234567",
  "email": "ahmet@example.com",
  "password": "password123"
}

# 2. Kullanıcı girişi
POST /api/v1/auth/login
{
  "phone": "5551234567",
  "password": "password123"
}

# 3. Mevcut kullanıcı bilgilerini getir
GET /api/v1/auth/me
Authorization: Bearer {access_token}

# 4. Push token kaydet
POST /api/v1/user/push-token
{
  "user_id": "{user_id}",
  "expo_push_token": "ExponentPushToken[test_token_here]",
  "platform": "android"
}
```

### 2. 🔔 Push Notification Flow Test
```bash
# 1. Test bildirimi gönder
GET /api/notifications/v1/test

# 2. Tek bildirim gönder
POST /api/notifications/v1/send
{
  "to": "ExponentPushToken[test_token_here]",
  "title": "Test Bildirimi",
  "body": "Bu bir test bildirimidir",
  "data": {
    "type": "test",
    "timestamp": 1640995200
  },
  "sound": "default",
  "channelId": "test_notifications"
}

# 3. Toplu bildirim gönder
POST /api/notifications/v1/send-bulk
{
  "messages": [
    {
      "to": "ExponentPushToken[token1]",
      "title": "Toplu Bildirim 1",
      "body": "İlk bildirim"
    },
    {
      "to": "ExponentPushToken[token2]",
      "title": "Toplu Bildirim 2", 
      "body": "İkinci bildirim"
    }
  ]
}

# 4. Kurban bildirimi gönder
POST /api/notifications/v1/kurban
{
  "expo_token": "ExponentPushToken[test_token_here]",
  "kurban_title": "2024 Kurban Organizasyonu",
  "message": "Kurban kesimi başladı!",
  "kurban_id": "kurban_123"
}

# 5. Bağış bildirimi gönder
POST /api/notifications/v1/donation
{
  "expo_token": "ExponentPushToken[test_token_here]",
  "amount": 500.0,
  "donor_name": "Ahmet Yılmaz"
}

# 6. Yayın bildirimi gönder
POST /api/notifications/v1/stream
{
  "expo_token": "ExponentPushToken[test_token_here]",
  "stream_title": "Canlı Kurban Kesimi",
  "message": "Yayın başladı!"
}
```

### 3. 📜 Certificate Flow Test
```bash
# 1. Sertifika oluştur
POST /api/certificates/v1/create
{
  "user_id": "{user_id}",
  "kurban_id": "kurban_123",
  "certificate_type": "kurban",
  "title": "Kurban Katılım Sertifikası",
  "description": "2024 Kurban Bayramı katılım sertifikası",
  "metadata": {
    "animal_type": "koyun",
    "weight": "45kg",
    "location": "Ankara",
    "imam": "Mehmet Yılmaz"
  }
}

# 2. Sertifika detaylarını getir
GET /api/certificates/v1/{certificate_id}

# 3. Kullanıcının sertifikalarını getir
GET /api/certificates/v1/user/{user_id}

# 4. Sertifika doğrula
GET /api/certificates/v1/verify/{verification_code}

# 5. Sertifika istatistikleri
GET /api/certificates/v1/stats/overview

# 6. PDF indir
GET /api/certificates/v1/{certificate_id}/download
```

### 4. 🧪 Test Endpoints Flow
```bash
# 1. Test root
GET /api/test/v1/

# 2. Bildirim servisi test
GET /api/test/v1/notification

# 3. Sertifika servisi test
GET /api/test/v1/certificate

# 4. Entegrasyon testi
GET /api/test/v1/integration

# 5. Servis durumları
GET /api/test/v1/status
```

### 5. 📊 System Health Test
```bash
# 1. Health check
GET /health

# 2. Monitor status
GET /api/monitor/status

# 3. System resources
GET /api/monitor/system

# 4. API documentation
GET /docs
```

## 🚨 Error Testing Scenarios

### 1. Validation Error Test
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

# Eksik alanlar
POST /api/certificates/v1/create
{
  "user_id": "{user_id}",
  "kurban_id": "kurban_123"
  // title ve description eksik
}
```

### 2. Authentication Error Test
```bash
# Geçersiz token
GET /api/v1/auth/me
Authorization: Bearer invalid_token

# Eksik token
GET /api/v1/auth/me
// Authorization header yok
```

### 3. Rate Limit Test
```bash
# Çok fazla istek gönder (100+ istek)
for i in {1..150}; do
  curl -X GET "http://localhost:8000/api/test/v1/"
done
```

### 4. Not Found Error Test
```bash
# Var olmayan sertifika
GET /api/certificates/v1/non_existent_certificate_id

# Var olmayan kullanıcı
GET /api/certificates/v1/user/non_existent_user_id
```

## 🔧 Test Automation Scripts

### 1. Bash Test Script
```bash
#!/bin/bash
BASE_URL="http://localhost:8000"

echo "🧪 KurbanCebimde API Test Başlatılıyor..."

# Health check
echo "📊 Health check..."
curl -s "$BASE_URL/health" | jq '.'

# Test root
echo "🧪 Test root..."
curl -s "$BASE_URL/api/test/v1/" | jq '.'

# Notification test
echo "🔔 Notification test..."
curl -s "$BASE_URL/api/notifications/v1/test" | jq '.'

# Certificate test
echo "📜 Certificate test..."
curl -s "$BASE_URL/api/test/v1/certificate" | jq '.'

# Integration test
echo "🔗 Integration test..."
curl -s "$BASE_URL/api/test/v1/integration" | jq '.'

echo "✅ Test tamamlandı!"
```

### 2. Python Test Script
```python
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, method="GET", data=None):
    """Endpoint test et"""
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

def main():
    print("🧪 KurbanCebimde API Test Başlatılıyor...")
    
    # Health check
    test_endpoint("/health")
    
    # Test endpoints
    test_endpoint("/api/test/v1/")
    test_endpoint("/api/test/v1/notification")
    test_endpoint("/api/test/v1/certificate")
    test_endpoint("/api/test/v1/integration")
    test_endpoint("/api/test/v1/status")
    
    # Notification endpoints
    test_endpoint("/api/notifications/v1/test")
    test_endpoint("/api/notifications/v1/status")
    
    # Certificate endpoints
    test_endpoint("/api/certificates/v1/mock/sample")
    test_endpoint("/api/certificates/v1/stats/overview")
    
    print("✅ Test tamamlandı!")

if __name__ == "__main__":
    main()
```

### 3. JavaScript Test Script
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

async function main() {
    console.log('🧪 KurbanCebimde API Test Başlatılıyor...');
    
    // Health check
    await testEndpoint('/health');
    
    // Test endpoints
    await testEndpoint('/api/test/v1/');
    await testEndpoint('/api/test/v1/notification');
    await testEndpoint('/api/test/v1/certificate');
    await testEndpoint('/api/test/v1/integration');
    await testEndpoint('/api/test/v1/status');
    
    // Notification endpoints
    await testEndpoint('/api/notifications/v1/test');
    await testEndpoint('/api/notifications/v1/status');
    
    // Certificate endpoints
    await testEndpoint('/api/certificates/v1/mock/sample');
    await testEndpoint('/api/certificates/v1/stats/overview');
    
    console.log('✅ Test tamamlandı!');
}

main().catch(console.error);
```

## 📝 Test Checklist

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

### ✅ Integration Tests
- [ ] End-to-end workflows
- [ ] Service integration
- [ ] Database integration
- [ ] External API integration
- [ ] Error propagation

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
    },
    {
      "type": "bagis",
      "title": "Bağış Katılım Sertifikası",
      "description": "Kurban bağışı katılım sertifikası",
      "metadata": {
        "amount": 500.0,
        "currency": "TL",
        "payment_method": "kredi_karti"
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
    },
    {
      "type": "donation",
      "title": "💰 Yeni Bağış!",
      "body": "Ahmet Yılmaz 500 TL bağış yaptı",
      "data": {
        "amount": 500.0,
        "donor": "Ahmet Yılmaz",
        "type": "donation"
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
