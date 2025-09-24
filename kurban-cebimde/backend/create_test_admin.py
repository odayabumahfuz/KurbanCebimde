#!/usr/bin/env python3
"""
Test admin kullanıcısı oluşturma scripti
"""
import os
import sys
import django
from django.contrib.auth import get_user_model

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kurbancebimde.settings')
django.setup()

User = get_user_model()

def create_test_admin():
    """Test admin kullanıcısı oluştur"""
    
    # Test admin bilgileri
    admin_data = {
        'username': 'admin',
        'email': 'admin@kurbancebimde.com',
        'phone': '+905551234567',
        'name': 'Test',
        'surname': 'Admin',
        'is_admin': True,
        'is_super_admin': True,
        'is_verified': True,
        'is_active': True
    }
    
    try:
        # Mevcut admin var mı kontrol et
        if User.objects.filter(username='admin').exists():
            admin_user = User.objects.get(username='admin')
            print(f"✅ Admin kullanıcı zaten mevcut: {admin_user.username}")
        else:
            # Yeni admin oluştur
            admin_user = User.objects.create_user(
                username=admin_data['username'],
                email=admin_data['email'],
                phone=admin_data['phone'],
                name=admin_data['name'],
                surname=admin_data['surname'],
                password='admin123',  # Test şifresi
                is_admin=admin_data['is_admin'],
                is_super_admin=admin_data['is_super_admin'],
                is_verified=admin_data['is_verified'],
                is_active=admin_data['is_active']
            )
            print(f"✅ Yeni admin kullanıcı oluşturuldu: {admin_user.username}")
        
        # Admin bilgilerini yazdır
        print("\n" + "="*50)
        print("🔐 TEST ADMIN HESABI")
        print("="*50)
        print(f"👤 Kullanıcı Adı: {admin_user.username}")
        print(f"📧 Email: {admin_user.email}")
        print(f"📱 Telefon: {admin_user.phone}")
        print(f"🔑 Şifre: admin123")
        print(f"👑 Admin Yetkisi: {'✅' if admin_user.is_admin else '❌'}")
        print(f"🌟 Super Admin: {'✅' if admin_user.is_super_admin else '❌'}")
        print(f"✅ Doğrulanmış: {'✅' if admin_user.is_verified else '❌'}")
        print("="*50)
        
        # Test kullanıcısı da oluştur
        test_user_data = {
            'username': 'oday_abumahfuz',
            'email': 'oday@test.com',
            'phone': '+905559876543',
            'name': 'Oday',
            'surname': 'Abumahfuz',
            'is_admin': False,
            'is_super_admin': False,
            'is_verified': True,
            'is_active': True
        }
        
        if not User.objects.filter(username='oday_abumahfuz').exists():
            test_user = User.objects.create_user(
                username=test_user_data['username'],
                email=test_user_data['email'],
                phone=test_user_data['phone'],
                name=test_user_data['name'],
                surname=test_user_data['surname'],
                password='test123',
                is_admin=test_user_data['is_admin'],
                is_super_admin=test_user_data['is_super_admin'],
                is_verified=test_user_data['is_verified'],
                is_active=test_user_data['is_active']
            )
            print(f"\n✅ Test kullanıcısı oluşturuldu: {test_user.username}")
        
        print("\n" + "="*50)
        print("👤 TEST KULLANICI HESABI")
        print("="*50)
        print(f"👤 Kullanıcı Adı: oday_abumahfuz")
        print(f"📧 Email: oday@test.com")
        print(f"📱 Telefon: +905559876543")
        print(f"🔑 Şifre: test123")
        print(f"👤 Ad Soyad: Oday Abumahfuz")
        print("="*50)
        
        return True
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Test admin kullanıcısı oluşturuluyor...")
    success = create_test_admin()
    if success:
        print("\n🎉 Test hesapları başarıyla oluşturuldu!")
        print("\n📱 Uygulamada giriş yapmak için:")
        print("   Admin: admin / admin123")
        print("   Test: oday_abumahfuz / test123")
    else:
        print("\n❌ Test hesapları oluşturulamadı!")
        sys.exit(1)
