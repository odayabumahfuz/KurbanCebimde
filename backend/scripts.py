#!/usr/bin/env python3
"""
🐑 KurbanCebimde Backend Scripts
Bu dosya backend için yardımcı script'leri içerir
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def run_command(command, description=""):
    """Komut çalıştır ve sonucu göster"""
    print(f"🚀 {description}")
    print(f"📝 Komut: {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ Başarılı: {description}")
        if result.stdout:
            print(f"📤 Çıktı: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Hata: {description}")
        print(f"📤 Hata çıktısı: {e.stderr}")
        return False

def install_dependencies():
    """Dependencies yükle"""
    print("📦 Dependencies yükleniyor...")
    return run_command("pip install -r requirements.txt", "Dependencies yükleme")

def run_tests():
    """Testleri çalıştır"""
    print("🧪 Testler çalıştırılıyor...")
    return run_command("pytest tests/ -v", "Test çalıştırma")

def run_lint():
    """Linting yap"""
    print("🔍 Linting yapılıyor...")
    commands = [
        ("black --check .", "Black formatting check"),
        ("isort --check-only .", "Import sorting check"),
        ("flake8 .", "Flake8 linting"),
        ("mypy . --ignore-missing-imports", "Type checking")
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            return False
    return True

def run_lint_fix():
    """Linting düzeltmeleri yap"""
    print("🔧 Linting düzeltmeleri yapılıyor...")
    commands = [
        ("black .", "Black formatting"),
        ("isort .", "Import sorting"),
        ("flake8 . --max-line-length=127", "Flake8 linting")
    ]
    
    for command, description in commands:
        run_command(command, description)
    return True

def create_env_file():
    """Environment dosyası oluştur"""
    print("🔧 Environment dosyası oluşturuluyor...")
    
    if os.path.exists(".env"):
        print("⚠️  .env dosyası zaten mevcut")
        return True
    
    if os.path.exists("env.example"):
        run_command("cp env.example .env", "Environment dosyası kopyalama")
        print("✅ .env dosyası oluşturuldu")
        print("📝 Lütfen .env dosyasını düzenleyin")
        return True
    else:
        print("❌ env.example dosyası bulunamadı")
        return False

def start_server():
    """Development server başlat"""
    print("🚀 Development server başlatılıyor...")
    return run_command("uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload", "Server başlatma")

def run_migrations():
    """Database migration'ları çalıştır"""
    print("🗄️ Database migration'ları çalıştırılıyor...")
    return run_command("alembic upgrade head", "Migration çalıştırma")

def create_migration():
    """Yeni migration oluştur"""
    print("📝 Yeni migration oluşturuluyor...")
    message = input("Migration mesajını girin: ")
    return run_command(f'alembic revision --autogenerate -m "{message}"', "Migration oluşturma")

def setup_database():
    """Database kurulumu"""
    print("🗄️ Database kurulumu...")
    commands = [
        ("python -c \"from app.main import create_tables; create_tables()\"", "Tabloları oluşturma"),
        ("python create_admin.py", "Admin kullanıcı oluşturma")
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            return False
    return True

def run_security_check():
    """Güvenlik kontrolü"""
    print("🔒 Güvenlik kontrolü yapılıyor...")
    return run_command("bandit -r . -f json -o bandit-report.json", "Güvenlik taraması")

def generate_docs():
    """API dokümantasyonu oluştur"""
    print("📚 API dokümantasyonu oluşturuluyor...")
    return run_command("python -c \"import app.main; print('API docs available at http://localhost:8000/docs')\"", "Dokümantasyon")

def main():
    """Ana fonksiyon"""
    parser = argparse.ArgumentParser(description="KurbanCebimde Backend Scripts")
    parser.add_argument("command", choices=[
        "install", "test", "lint", "lint-fix", "env", "start", "migrate", 
        "create-migration", "setup-db", "security", "docs", "all"
    ], help="Çalıştırılacak komut")
    
    args = parser.parse_args()
    
    print("🐑 KurbanCebimde Backend Scripts")
    print("=" * 50)
    
    if args.command == "install":
        install_dependencies()
    elif args.command == "test":
        run_tests()
    elif args.command == "lint":
        run_lint()
    elif args.command == "lint-fix":
        run_lint_fix()
    elif args.command == "env":
        create_env_file()
    elif args.command == "start":
        start_server()
    elif args.command == "migrate":
        run_migrations()
    elif args.command == "create-migration":
        create_migration()
    elif args.command == "setup-db":
        setup_database()
    elif args.command == "security":
        run_security_check()
    elif args.command == "docs":
        generate_docs()
    elif args.command == "all":
        print("🚀 Tüm işlemler çalıştırılıyor...")
        commands = [
            ("install", "Dependencies yükleme"),
            ("env", "Environment dosyası oluşturma"),
            ("lint", "Linting"),
            ("test", "Test çalıştırma"),
            ("security", "Güvenlik kontrolü")
        ]
        
        for command, description in commands:
            print(f"\n📋 {description}")
            if command == "install":
                install_dependencies()
            elif command == "env":
                create_env_file()
            elif command == "lint":
                run_lint()
            elif command == "test":
                run_tests()
            elif command == "security":
                run_security_check()
    
    print("\n✅ İşlem tamamlandı!")

if __name__ == "__main__":
    main()
