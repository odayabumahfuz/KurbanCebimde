# 🐑 KurbanCebimde Backend Makefile
# Bu dosya backend için kolay komutlar sağlar

.PHONY: help install test lint lint-fix env start migrate setup-db security docs clean

# Varsayılan hedef
help: ## Yardım mesajını göster
	@echo "🐑 KurbanCebimde Backend Makefile"
	@echo "=================================="
	@echo ""
	@echo "Kullanılabilir komutlar:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Kurulum
install: ## Dependencies yükle
	@echo "📦 Dependencies yükleniyor..."
	pip install -r requirements.txt

install-dev: ## Development dependencies yükle
	@echo "📦 Development dependencies yükleniyor..."
	pip install -r requirements.txt
	pip install pytest pytest-asyncio pytest-cov black isort flake8 mypy bandit

# Test
test: ## Testleri çalıştır
	@echo "🧪 Testler çalıştırılıyor..."
	pytest tests/ -v

test-cov: ## Test coverage ile çalıştır
	@echo "🧪 Test coverage çalıştırılıyor..."
	pytest tests/ -v --cov=app --cov-report=html --cov-report=term

test-watch: ## Testleri watch modunda çalıştır
	@echo "🧪 Testler watch modunda çalıştırılıyor..."
	pytest tests/ -v --watch

# Linting
lint: ## Linting yap
	@echo "🔍 Linting yapılıyor..."
	black --check .
	isort --check-only .
	flake8 . --max-line-length=127
	mypy . --ignore-missing-imports

lint-fix: ## Linting düzeltmeleri yap
	@echo "🔧 Linting düzeltmeleri yapılıyor..."
	black .
	isort .
	flake8 . --max-line-length=127

# Environment
env: ## Environment dosyası oluştur
	@echo "🔧 Environment dosyası oluşturuluyor..."
	@if [ ! -f .env ]; then \
		cp env.example .env; \
		echo "✅ .env dosyası oluşturuldu"; \
		echo "📝 Lütfen .env dosyasını düzenleyin"; \
	else \
		echo "⚠️  .env dosyası zaten mevcut"; \
	fi

# Server
start: ## Development server başlat
	@echo "🚀 Development server başlatılıyor..."
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

start-prod: ## Production server başlat
	@echo "🚀 Production server başlatılıyor..."
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Database
migrate: ## Database migration'ları çalıştır
	@echo "🗄️ Database migration'ları çalıştırılıyor..."
	alembic upgrade head

create-migration: ## Yeni migration oluştur
	@echo "📝 Yeni migration oluşturuluyor..."
	@read -p "Migration mesajını girin: " message; \
	alembic revision --autogenerate -m "$$message"

setup-db: ## Database kurulumu
	@echo "🗄️ Database kurulumu..."
	python -c "from app.main import create_tables; create_tables()"
	python create_admin.py

# Güvenlik
security: ## Güvenlik kontrolü
	@echo "🔒 Güvenlik kontrolü yapılıyor..."
	bandit -r . -f json -o bandit-report.json
	@echo "📊 Güvenlik raporu: bandit-report.json"

# Dokümantasyon
docs: ## API dokümantasyonu
	@echo "📚 API dokümantasyonu:"
	@echo "  Swagger UI: http://localhost:8000/docs"
	@echo "  ReDoc: http://localhost:8000/redoc"

# Temizlik
clean: ## Cache ve geçici dosyaları temizle
	@echo "🧹 Temizlik yapılıyor..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache
	rm -rf .coverage
	rm -rf htmlcov
	rm -rf dist
	rm -rf build

# Docker
docker-build: ## Docker image oluştur
	@echo "🐳 Docker image oluşturuluyor..."
	docker build -t kurban-cebimde-api .

docker-run: ## Docker container çalıştır
	@echo "🐳 Docker container çalıştırılıyor..."
	docker run -p 8000:8000 kurban-cebimde-api

# CI/CD
ci: ## CI pipeline komutları
	@echo "🚀 CI pipeline çalıştırılıyor..."
	$(MAKE) install-dev
	$(MAKE) lint
	$(MAKE) test-cov
	$(MAKE) security

# Development
dev: ## Development ortamı kurulumu
	@echo "🔧 Development ortamı kuruluyor..."
	$(MAKE) install-dev
	$(MAKE) env
	$(MAKE) setup-db
	@echo "✅ Development ortamı hazır!"
	@echo "🚀 Server başlatmak için: make start"

# Production
prod: ## Production ortamı kurulumu
	@echo "🚀 Production ortamı kuruluyor..."
	$(MAKE) install
	$(MAKE) migrate
	@echo "✅ Production ortamı hazır!"
	@echo "🚀 Server başlatmak için: make start-prod"

# Monitoring
monitor: ## Sistem durumunu kontrol et
	@echo "📊 Sistem durumu:"
	@echo "  Health: http://localhost:8000/health"
	@echo "  Status: http://localhost:8000/api/monitor/status"
	@echo "  System: http://localhost:8000/api/monitor/system"

# Test endpoints
test-endpoints: ## Test endpoint'lerini çalıştır
	@echo "🧪 Test endpoint'leri:"
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

# All
all: ## Tüm işlemleri çalıştır
	@echo "🚀 Tüm işlemler çalıştırılıyor..."
	$(MAKE) install-dev
	$(MAKE) env
	$(MAKE) lint
	$(MAKE) test-cov
	$(MAKE) security
	@echo "✅ Tüm işlemler tamamlandı!"
