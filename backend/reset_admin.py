#!/usr/bin/env python3
"""
Admin şifresini sıfırlama scripti
"""
import sys
import os
sys.path.append('/app')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import bcrypt

# Database connection
DATABASE_URL = "postgresql+psycopg2://postgres:password@postgres:5432/kurban_cebimde"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def reset_admin_password():
    """Admin şifresini sıfırla"""
    
    try:
        db = SessionLocal()
        
        # Admin kullanıcısını bul ve şifreyi sıfırla
        result = db.execute(text("""
            UPDATE users 
            SET password_hash = :password_hash, role = 'admin', is_active = true 
            WHERE email = 'admin@kurbancebimde.com'
        """), {"password_hash": bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')})
        
        if result.rowcount > 0:
            db.commit()
            print("✅ Admin şifresi sıfırlandı!")
            print("📧 Email: admin@kurbancebimde.com")
            print("🔑 Şifre: admin123")
            return True
        else:
            print("❌ Admin kullanıcısı bulunamadı!")
            return False
            
    except Exception as e:
        print(f"❌ Hata: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Admin şifresi sıfırlanıyor...")
    success = reset_admin_password()
    if success:
        print("\n🎉 Admin şifresi başarıyla sıfırlandı!")
    else:
        print("\n❌ Admin şifresi sıfırlanamadı!")
        sys.exit(1)
