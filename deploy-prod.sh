#!/bin/bash

# KurbanCebimde Production Deployment Script
# Bu script production ortamında sistemi deploy eder

set -e

echo "🚀 KurbanCebimde Production Deployment Başlatılıyor..."

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonksiyonlar
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Environment kontrolü
check_environment() {
    log_info "Environment kontrolü yapılıyor..."
    
    if [ ! -f ".env" ]; then
        log_error ".env dosyası bulunamadı!"
        log_info "env.example dosyasını kopyalayıp .env olarak düzenleyin"
        exit 1
    fi
    
    # Gerekli environment variables kontrolü
    required_vars=(
        "DATABASE_URL"
        "SECRET_KEY"
        "LIVEKIT_URL"
        "LIVEKIT_API_KEY"
        "LIVEKIT_API_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env; then
            log_error "${var} environment variable eksik!"
            exit 1
        fi
    done
    
    log_success "Environment variables kontrol edildi"
}

# Docker kontrolü
check_docker() {
    log_info "Docker kontrolü yapılıyor..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker yüklü değil!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose yüklü değil!"
        exit 1
    fi
    
    log_success "Docker ve Docker Compose hazır"
}

# SSL sertifikası kontrolü
check_ssl() {
    log_info "SSL sertifikası kontrolü yapılıyor..."
    
    if [ ! -d "/etc/letsencrypt/live" ]; then
        log_warning "Let's Encrypt sertifikası bulunamadı"
        log_info "SSL sertifikası oluşturmak için:"
        log_info "sudo certbot certonly --standalone -d api.kurbancebimde.com -d admin.kurbancebimde.com -d www.kurbancebimde.com"
    else
        log_success "SSL sertifikası mevcut"
    fi
}

# Backup oluştur
create_backup() {
    log_info "Mevcut veritabanı backup'ı oluşturuluyor..."
    
    if [ -d "backups" ]; then
        timestamp=$(date +"%Y%m%d_%H%M%S")
        backup_file="backups/backup_${timestamp}.sql"
        
        docker-compose exec -T postgres pg_dump -U postgres kurban_cebimde > "$backup_file"
        log_success "Backup oluşturuldu: $backup_file"
    else
        log_warning "Backup dizini bulunamadı, backup oluşturulamadı"
    fi
}

# Docker image'ları build et
build_images() {
    log_info "Docker image'ları build ediliyor..."
    
    # Backend image
    log_info "Backend image build ediliyor..."
    docker build -t kurban-cebimde/api:latest ./backend/
    
    # Admin panel image
    log_info "Admin panel image build ediliyor..."
    docker build -t kurban-cebimde/admin-panel:latest ./kurban-cebimde/admin-panel/
    
    log_success "Docker image'ları build edildi"
}

# Production deployment
deploy_production() {
    log_info "Production deployment başlatılıyor..."
    
    # Mevcut container'ları durdur
    log_info "Mevcut container'lar durduruluyor..."
    docker-compose -f docker-compose.prod.yml down
    
    # Yeni container'ları başlat
    log_info "Yeni container'lar başlatılıyor..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Health check
    log_info "Health check yapılıyor..."
    sleep 30
    
    # API health check
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        log_success "API sağlıklı"
    else
        log_error "API health check başarısız!"
        docker-compose -f docker-compose.prod.yml logs api
        exit 1
    fi
    
    # Admin panel health check
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Admin panel sağlıklı"
    else
        log_error "Admin panel health check başarısız!"
        docker-compose -f docker-compose.prod.yml logs admin-panel
        exit 1
    fi
    
    log_success "Production deployment tamamlandı!"
}

# Monitoring setup
setup_monitoring() {
    log_info "Monitoring setup yapılıyor..."
    
    # Log dizinleri oluştur
    mkdir -p logs/nginx
    mkdir -p logs/api
    mkdir -p logs/admin
    
    # Backup dizini oluştur
    mkdir -p backups
    
    log_success "Monitoring setup tamamlandı"
}

# Cleanup
cleanup() {
    log_info "Cleanup yapılıyor..."
    
    # Eski image'ları temizle
    docker image prune -f
    
    # Kullanılmayan volume'ları temizle
    docker volume prune -f
    
    log_success "Cleanup tamamlandı"
}

# Ana fonksiyon
main() {
    log_info "KurbanCebimde Production Deployment Script"
    log_info "=========================================="
    
    check_environment
    check_docker
    check_ssl
    create_backup
    build_images
    setup_monitoring
    deploy_production
    cleanup
    
    log_success "🎉 Deployment başarıyla tamamlandı!"
    log_info "Sistem URL'leri:"
    log_info "- API: https://api.kurbancebimde.com"
    log_info "- Admin Panel: https://admin.kurbancebimde.com"
    log_info "- Web: https://www.kurbancebimde.com"
    
    log_info "Monitoring:"
    log_info "- Logs: docker-compose -f docker-compose.prod.yml logs -f"
    log_info "- Status: docker-compose -f docker-compose.prod.yml ps"
    log_info "- Health: curl http://localhost:8000/health"
}

# Script'i çalıştır
main "$@"
