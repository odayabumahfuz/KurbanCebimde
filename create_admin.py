#!/usr/bin/env python3
import bcrypt
import uuid
import psycopg2
import os

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/kurban_cebimde")

def create_admin_user():
    # Admin bilgileri
    admin_id = str(uuid.uuid4())
    name = "Admin"
    surname = "User"
    email = "admin@kurbancebimde.com"
    phone = "+905551234567"
    password = "admin123"
    
    # Şifreyi hash'le
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        # Database'e bağlan
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Admin kullanıcısını oluştur
        cursor.execute("""
            INSERT INTO users (id, name, surname, email, phone, password_hash, 
                             role, is_admin, is_super_admin, is_active, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                surname = EXCLUDED.surname,
                phone = EXCLUDED.phone,
                password_hash = EXCLUDED.password_hash,
                role = EXCLUDED.role,
                is_admin = EXCLUDED.is_admin,
                is_super_admin = EXCLUDED.is_super_admin,
                is_active = EXCLUDED.is_active,
                updated_at = NOW()
        """, (
            admin_id, name, surname, email, phone, hashed_password,
            "super_admin", True, True, True
        ))
        
        conn.commit()
        print("✅ Admin kullanıcısı başarıyla oluşturuldu!")
        print(f"📧 Email: {email}")
        print(f"🔑 Şifre: {password}")
        print(f"👤 Kullanıcı ID: {admin_id}")
        
    except Exception as e:
        print(f"❌ Hata: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    create_admin_user()
