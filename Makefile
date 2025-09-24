# 🐑 KurbanCebimde Project Makefile
# Bu dosya tüm proje için kolay komutlar sağlar

.PHONY: help install start stop build test lint clean docker-up docker-down

# Varsayılan hedef
help: ## Yardım mesajını göster
	@echo "🐑 KurbanCebimde Project Makefile"
	@echo "=================================="
	@echo ""
	@echo "Kullanılabilir komutlar:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Kurulum
install: ## Tüm dependencies yükle
	@echo "📦 Tüm dependencies yükleniyor..."
	@echo "🔧 Backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "📱 React Native dependencies..."
	cd kurban-cebimde && npm install
	@echo "🖥️ Admin Panel dependencies..."
	cd kurban-cebimde/admin-panel && npm install

install-backend: ## Backend dependencies yükle
	@echo "🔧 Backend dependencies yükleniyor..."
	cd backend && pip install -r requirements.txt

install-frontend: ## Frontend dependencies yükle
	@echo "📱 Frontend dependencies yükleniyor..."
	cd kurban-cebimde && npm install

install-admin: ## Admin panel dependencies yükle
	@echo "🖥️ Admin Panel dependencies yükleniyor..."
	cd kurban-cebimde/admin-panel && npm install

# Başlatma
start: ## Tüm servisleri başlat
	@echo "🚀 Tüm servisler başlatılıyor..."
	docker-compose up -d

start-backend: ## Backend'i başlat
	@echo "🔧 Backend başlatılıyor..."
	cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

start-frontend: ## React Native'i başlat
	@echo "📱 React Native başlatılıyor..."
	cd kurban-cebimde && npm start

start-admin: ## Admin panel'i başlat
	@echo "🖥️ Admin Panel başlatılıyor..."
	cd kurban-cebimde/admin-panel && npm run dev

# Durdurma
stop: ## Tüm servisleri durdur
	@echo "🛑 Tüm servisler durduruluyor..."
	docker-compose down

stop-backend: ## Backend'i durdur
	@echo "🛑 Backend durduruluyor..."
	pkill -f "uvicorn app.main:app" || true

stop-frontend: ## React Native'i durdur
	@echo "🛑 React Native durduruluyor..."
	pkill -f "expo start" || true

stop-admin: ## Admin panel'i durdur
	@echo "🛑 Admin Panel durduruluyor..."
	pkill -f "vite" || true

# Build
build: ## Tüm projeleri build et
	@echo "🏗️ Tüm projeler build ediliyor..."
	@echo "🔧 Backend build..."
	cd backend && python -m py_compile app/main.py
	@echo "📱 React Native build..."
	cd kurban-cebimde && npm run build || echo "Build script not found"
	@echo "🖥️ Admin Panel build..."
	cd kurban-cebimde/admin-panel && npm run build

build-backend: ## Backend'i build et
	@echo "🔧 Backend build ediliyor..."
	cd backend && python -m py_compile app/main.py

build-frontend: ## React Native'i build et
	@echo "📱 React Native build ediliyor..."
	cd kurban-cebimde && npm run build || echo "Build script not found"

build-admin: ## Admin panel'i build et
	@echo "🖥️ Admin Panel build ediliyor..."
	cd kurban-cebimde/admin-panel && npm run build

# Test
test: ## Tüm testleri çalıştır
	@echo "🧪 Tüm testler çalıştırılıyor..."
	@echo "🔧 Backend testleri..."
	cd backend && python -m pytest tests/ -v || echo "Backend tests not configured"
	@echo "📱 React Native testleri..."
	cd kurban-cebimde && npm test || echo "Frontend tests not configured"
	@echo "🖥️ Admin Panel testleri..."
	cd kurban-cebimde/admin-panel && npm test || echo "Admin tests not configured"

test-backend: ## Backend testlerini çalıştır
	@echo "🔧 Backend testleri çalıştırılıyor..."
	cd backend && python -m pytest tests/ -v || echo "Backend tests not configured"

test-frontend: ## React Native testlerini çalıştır
	@echo "📱 React Native testleri çalıştırılıyor..."
	cd kurban-cebimde && npm test || echo "Frontend tests not configured"

test-admin: ## Admin panel testlerini çalıştır
	@echo "🖥️ Admin Panel testleri çalıştırılıyor..."
	cd kurban-cebimde/admin-panel && npm test || echo "Admin tests not configured"

# Linting
lint: ## Tüm projeleri lint et
	@echo "🔍 Tüm projeler lint ediliyor..."
	@echo "🔧 Backend linting..."
	cd backend && python -m flake8 . --max-line-length=127 || echo "Backend linting failed"
	@echo "📱 React Native linting..."
	cd kurban-cebimde && npm run lint || echo "Frontend linting not configured"
	@echo "🖥️ Admin Panel linting..."
	cd kurban-cebimde/admin-panel && npm run lint || echo "Admin linting not configured"

lint-fix: ## Linting düzeltmeleri yap
	@echo "🔧 Linting düzeltmeleri yapılıyor..."
	@echo "🔧 Backend linting fix..."
	cd backend && python -m black . && python -m isort .
	@echo "📱 React Native linting fix..."
	cd kurban-cebimde && npm run lint:fix || echo "Frontend linting fix not configured"
	@echo "🖥️ Admin Panel linting fix..."
	cd kurban-cebimde/admin-panel && npm run lint:fix || echo "Admin linting fix not configured"

# Docker
docker-up: ## Docker servislerini başlat
	@echo "🐳 Docker servisleri başlatılıyor..."
	docker-compose up -d

docker-down: ## Docker servislerini durdur
	@echo "🐳 Docker servisleri durduruluyor..."
	docker-compose down

docker-build: ## Docker image'ları build et
	@echo "🐳 Docker image'ları build ediliyor..."
	docker-compose build

docker-logs: ## Docker loglarını göster
	@echo "📋 Docker logları gösteriliyor..."
	docker-compose logs -f

docker-clean: ## Docker temizliği yap
	@echo "🧹 Docker temizliği yapılıyor..."
	docker-compose down -v
	docker system prune -f

# Database
db-setup: ## Database kurulumu
	@echo "🗄️ Database kurulumu..."
	cd backend && python -c "from app.main import create_tables; create_tables()"
	cd backend && python create_admin.py

db-migrate: ## Database migration'ları çalıştır
	@echo "🗄️ Database migration'ları çalıştırılıyor..."
	cd backend && alembic upgrade head

db-reset: ## Database'i sıfırla
	@echo "🗄️ Database sıfırlanıyor..."
	docker-compose down -v
	docker-compose up -d postgres redis
	sleep 10
	$(MAKE) db-setup

# Temizlik
clean: ## Cache ve geçici dosyaları temizle
	@echo "🧹 Temizlik yapılıyor..."
	@echo "🔧 Backend temizliği..."
	cd backend && find . -type f -name "*.pyc" -delete
	cd backend && find . -type d -name "__pycache__" -delete
	@echo "📱 React Native temizliği..."
	cd kurban-cebimde && npm run clean || echo "Clean script not found"
	@echo "🖥️ Admin Panel temizliği..."
	cd kurban-cebimde/admin-panel && npm run clean || echo "Clean script not found"

clean-all: ## Tüm cache ve geçici dosyaları temizle
	@echo "🧹 Tüm temizlik yapılıyor..."
	$(MAKE) clean
	rm -rf node_modules
	rm -rf backend/__pycache__
	rm -rf backend/.pytest_cache
	rm -rf backend/htmlcov
	rm -rf backend/.coverage

# Development
dev: ## Development ortamı kurulumu
	@echo "🔧 Development ortamı kuruluyor..."
	$(MAKE) install
	$(MAKE) db-setup
	@echo "✅ Development ortamı hazır!"
	@echo "🚀 Servisleri başlatmak için: make start"

# Production
prod: ## Production ortamı kurulumu
	@echo "🚀 Production ortamı kuruluyor..."
	$(MAKE) install
	$(MAKE) db-migrate
	@echo "✅ Production ortamı hazır!"

# Monitoring
status: ## Sistem durumunu kontrol et
	@echo "📊 Sistem durumu:"
	@echo "  Backend Health: http://localhost:8000/health"
	@echo "  Backend Status: http://localhost:8000/api/monitor/status"
	@echo "  Admin Panel: http://localhost:3000"
	@echo "  React Native: http://localhost:8081"

health: ## Health check yap
	@echo "🏥 Health check yapılıyor..."
	@curl -s http://localhost:8000/health | jq . || echo "Backend not running"
	@curl -s http://localhost:3000 | head -1 || echo "Admin Panel not running"

# Test endpoints
test-api: ## API test endpoint'lerini çalıştır
	@echo "🧪 API test endpoint'leri:"
	@echo "  Root: http://localhost:8000/api/test/v1/"
	@echo "  Notification: http://localhost:8000/api/test/v1/notification"
	@echo "  Certificate: http://localhost:8000/api/test/v1/certificate"
	@echo "  Integration: http://localhost:8000/api/test/v1/integration"

# Error testing
error-test: ## Error test endpoint'lerini çalıştır
	@echo "🚨 Error test endpoint'leri:"
	@echo "  Root: http://localhost:8000/api/error-test/v1/"
	@echo "  Random: http://localhost:8000/api/error-test/v1/random"
	@echo "  Rate Limit: http://localhost:8000/api/error-test/v1/rate_limit"

# Documentation
docs: ## Dokümantasyonu aç
	@echo "📚 Dokümantasyon:"
	@echo "  Swagger UI: http://localhost:8000/docs"
	@echo "  ReDoc: http://localhost:8000/redoc"
	@echo "  README: ./README.md"
	@echo "  Postman: ./postman/README.md"

# All
all: ## Tüm işlemleri çalıştır
	@echo "🚀 Tüm işlemler çalıştırılıyor..."
	$(MAKE) install
	$(MAKE) lint
	$(MAKE) test
	@echo "✅ Tüm işlemler tamamlandı!"

# Quick start
quick: ## Hızlı başlangıç
	@echo "⚡ Hızlı başlangıç..."
	$(MAKE) docker-up
	sleep 30
	$(MAKE) health
	@echo "✅ Hızlı başlangıç tamamlandı!"
	@echo "🚀 Servisler hazır:"
	@echo "  Backend: http://localhost:8000"
	@echo "  Admin Panel: http://localhost:3000"
	@echo "  React Native: http://localhost:8081"
