#!/bin/bash

# Admin Panel Domain Deployment Script
# Bu script admin panel'deki değişiklikleri domain'e deploy eder

set -e  # Hata durumunda script'i durdur

echo "🚀 Admin Panel Domain Deployment Başlıyor..."

# 1. Admin panel'i build et
echo "📦 Admin panel build ediliyor..."
docker-compose build admin-panel

# 2. Admin panel container'ını restart et
echo "🔄 Admin panel container restart ediliyor..."
docker-compose restart admin-panel

# 3. Container'ın hazır olmasını bekle
echo "⏳ Container'ın hazır olması bekleniyor..."
sleep 10

# 4. Static files'ları domain'e kopyala
echo "📁 Static files domain'e kopyalanıyor..."
docker cp kurbancebimde-admin-panel-1:/app/dist/. /var/www/admin.kurbancebimde.com/

# 5. Dosya izinlerini düzelt
echo "🔐 Dosya izinleri düzeltiliyor..."
chown -R root:root /var/www/admin.kurbancebimde.com/
chmod -R 755 /var/www/admin.kurbancebimde.com/

# 6. Nginx'i reload et
echo "🔄 Nginx reload ediliyor..."
docker-compose restart nginx

# 7. Deployment'ın başarılı olduğunu kontrol et
echo "✅ Deployment kontrol ediliyor..."
if [ -f "/var/www/admin.kurbancebimde.com/index.html" ]; then
    echo "🎉 Admin panel başarıyla deploy edildi!"
    echo "🌐 Domain: https://admin.kurbancebimde.com"
    echo "📅 Deploy zamanı: $(date)"
else
    echo "❌ Deployment başarısız! index.html bulunamadı."
    exit 1
fi

echo "✨ Deployment tamamlandı!"
