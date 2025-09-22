# KurbanCebimde Backend Dockerfile
FROM python:3.11-slim

# Sistem paketlerini güncelle ve gerekli paketleri yükle
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Çalışma dizinini ayarla
WORKDIR /app

# Python bağımlılıklarını kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY . .

# Gerekli dizinleri oluştur
RUN mkdir -p logs uploads

# Port'u expose et
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Uygulamayı başlat
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
