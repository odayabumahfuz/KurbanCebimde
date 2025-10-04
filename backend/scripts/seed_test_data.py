"""
Test ortamına: 1 admin, 3 kullanıcı, 5 bağış, 1 yayın ve 3 'uploaded' medya ekler.
Ayrıca testler için /api/test/v1/login-as-admin sahte endpointi için admin hazırlar.
"""
import os
from sqlalchemy import create_engine, text
import uuid

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://kc_user:kc_pass@localhost:5433/kc_test")
engine = create_engine(DATABASE_URL)

print("Seeding test data...")

with engine.connect() as conn:
    # Minimal şema oluştur (seed için yeterli)
    conn.execute(text("""
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            surname VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(20) UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            is_admin BOOLEAN DEFAULT FALSE,
            is_super_admin BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            email_verified BOOLEAN DEFAULT FALSE,
            phone_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS donations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            donor_name VARCHAR(100),
            donor_phone VARCHAR(20),
            payment_method VARCHAR(50),
            payment_status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS streams (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            admin_id UUID REFERENCES users(id),
            title VARCHAR(200) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'scheduled',
            room_name VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS media_assets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            owner_donation_id UUID REFERENCES donations(id),
            broadcast_id UUID,
            storage_key TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
    """))

    # Admin kullanıcı
    admin_id = str(uuid.uuid4())
    conn.execute(text("""
        INSERT INTO users (id, name, surname, email, phone, password_hash, role, is_admin, is_super_admin, is_active, created_at, updated_at)
        VALUES (:id,'Admin','User','admin@test.local','+900000000000','$2b$12$u1kZo6O6iD7jX9b0GmC7qOBqT9y5XGfQH3Qy9lYk2iLkXgkVZ5bWm','super_admin',true,true,true,NOW(),NOW())
        ON CONFLICT (email) DO NOTHING
    """), {"id": admin_id})

    # 3 kullanıcı
    user_ids = []
    for i in range(1, 4):
        uid = str(uuid.uuid4())
        user_ids.append(uid)
        conn.execute(text("""
            INSERT INTO users (id, name, surname, email, phone, password_hash, role, is_admin, is_super_admin, is_active, created_at, updated_at)
            VALUES (:id,:name,:surname,:email,:phone,'$2b$12$u1kZo6O6iD7jX9b0GmC7qOBqT9y5XGfQH3Qy9lYk2iLkXgkVZ5bWm','kullanıcı',false,false,true,NOW(),NOW())
            ON CONFLICT (email) DO NOTHING
        """), {
            "id": uid,
            "name": f"User{i}",
            "surname": "Test",
            "email": f"user{i}@test.local",
            "phone": f"+90000000000{i}"
        })

    # 5 bağış
    donation_ids = []
    for i, uid in enumerate(user_ids, start=1):
        did = str(uuid.uuid4())
        donation_ids.append(did)
        conn.execute(text("""
            INSERT INTO donations (id, user_id, amount, donor_name, donor_phone, payment_method, payment_status, created_at, updated_at)
            VALUES (:id, :user_id, :amount, :donor_name, :donor_phone, 'iyzico', 'pending', NOW(), NOW())
        """), {"id": did, "user_id": uid, "amount": 8500 + i * 10, "donor_name": f"Donor{i}", "donor_phone": f"+90000000000{i}"})

    # 1 yayın (streams)
    stream_id = str(uuid.uuid4())
    conn.execute(text("""
        INSERT INTO streams (id, user_id, admin_id, title, description, status, room_name, created_at, updated_at)
        VALUES (:id, :user_id, :admin_id, 'Test Stream', 'Seeded stream', 'scheduled', 'seed_room', NOW(), NOW())
    """), {"id": stream_id, "user_id": user_ids[0], "admin_id": admin_id})

    # 3 medya uploaded
    for i in range(1, 4):
        conn.execute(text("""
            INSERT INTO media_assets (id, owner_donation_id, storage_key, mime_type, status, created_at)
            VALUES (:id, :donation_id, :key, 'image/jpeg', 'uploaded', NOW())
        """), {"id": str(uuid.uuid4()), "donation_id": donation_ids[0], "key": f"media/seed_{i}.jpg"})

    conn.commit()

print("Seed tamamlandı.")
