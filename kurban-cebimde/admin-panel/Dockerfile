# KurbanCebimde Admin Panel Dockerfile
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Uygulama kodunu kopyala
COPY . .

# Production build
RUN npm run build

# Port'u expose et
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Uygulamayı başlat
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
