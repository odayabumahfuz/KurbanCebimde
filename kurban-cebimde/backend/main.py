from flask import Flask, jsonify, request, g
from flask_cors import CORS
import sqlite3
from datetime import datetime
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'kurban-cebimde-secret-key'

# CORS ayarları
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://192.168.2.120:8081"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "supports_credentials": True
    }
})

def get_db():
    conn = sqlite3.connect('test.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Users tablosu
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            surname TEXT,
            username TEXT UNIQUE,
            phone TEXT UNIQUE,
            email TEXT,
            password_hash TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # User sessions tablosu
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            device_id TEXT,
            ip TEXT,
            user_agent TEXT,
            started_at TEXT NOT NULL,
            ended_at TEXT
        )
    """)
    
    # Kullanıcı tablosu boş başlasın - dinamik veriler için
    
    conn.commit()
    conn.close()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

@app.route('/api/v1/auth/login', methods=['POST'])
def mobile_login():
    try:
        data = request.get_json()
        phone = data.get('phone') or data.get('username')
        password = data.get('password')
        
        # Telefon numarasını temizle (boşlukları kaldır)
        if phone:
            phone = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        
        if not phone or not password:
            return jsonify({"error": "Telefon ve şifre gerekli"}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Kullanıcıyı bul
        cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "Kullanıcı bulunamadı"}), 404
        
        # Gerçek şifre kontrolü
        if password != user['password_hash']:
            return jsonify({"error": "Giriş yapılamadı"}), 401
        
        # Session oluştur
        session_id = str(uuid.uuid4())
        device_id = request.headers.get('X-Device-ID', 'unknown')
        
        cursor.execute("""
            INSERT INTO user_sessions (id, user_id, device_id, ip, user_agent, started_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (session_id, user['id'], device_id, request.remote_addr, request.headers.get('User-Agent'), datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "access_token": session_id,
            "token_type": "bearer",
            "user": {
                "id": user['id'],
                "name": user['name'] or '',
                "surname": user['surname'] or '',
                "phone": user['phone'],
                "email": user['email'] or ''
            },
            "session_id": session_id
        })
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"error": "Giriş yapılamadı"}), 500

@app.route('/api/v1/auth/register', methods=['POST'])
def mobile_register():
    try:
        data = request.get_json()
        name = data.get('name')
        surname = data.get('surname')
        phone = data.get('phone')
        email = data.get('email')
        password = data.get('password')
        
        if not name or not surname or not phone or not password:
            return jsonify({"error": "Tüm alanlar gerekli"}), 400
        
        # Telefon numarasını temizle
        if phone:
            phone = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Telefon numarası kontrolü
        cursor.execute("SELECT id FROM users WHERE phone = ?", (phone,))
        if cursor.fetchone():
            return jsonify({"error": "Bu telefon numarası zaten kayıtlı"}), 409
        
        # Email kontrolü (varsa)
        if email:
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                return jsonify({"error": "Bu email zaten kayıtlı"}), 409
        
        # Yeni kullanıcı oluştur
        user_id = str(uuid.uuid4())
        username = f"{name.lower()}{user_id[:8]}"
        
        cursor.execute("""
            INSERT INTO users (id, name, surname, username, phone, email, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name, surname, username, phone, email, password, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "Kayıt başarılı",
            "user_id": user_id
        })
        
    except Exception as e:
        print(f"Register error: {e}")
        return jsonify({"error": "Kayıt yapılamadı"}), 500

@app.route('/api/v1/auth/refresh', methods=['POST'])
def refresh_token():
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({"error": "Refresh token gerekli"}), 400
        
        # Basit refresh token kontrolü (gerçek uygulamada JWT decode edilir)
        conn = get_db()
        cursor = conn.cursor()
        
        # Session kontrolü
        cursor.execute("""
            SELECT u.* FROM users u 
            JOIN user_sessions s ON u.id = s.user_id 
            WHERE s.id = ? AND s.ended_at IS NULL
        """, (refresh_token,))
        
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({"error": "Geçersiz refresh token"}), 401
        
        # Yeni access token oluştur
        new_access_token = str(uuid.uuid4())
        
        return jsonify({
            "access_token": new_access_token,
            "token_type": "bearer"
        })
        
    except Exception as e:
        print(f"Refresh token error: {e}")
        return jsonify({"error": "Token yenilenemedi"}), 500

@app.route('/api/v1/auth/me', methods=['GET'])
def get_user_profile():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Token gerekli"}), 401
        
        token = auth_header.split(' ')[1]
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Session kontrolü
        cursor.execute("""
            SELECT u.* FROM users u 
            JOIN user_sessions s ON u.id = s.user_id 
            WHERE s.id = ? AND s.ended_at IS NULL
        """, (token,))
        
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({"error": "Geçersiz token"}), 401
        
        return jsonify({
            "id": user['id'],
            "name": user['name'] or '',
            "surname": user['surname'] or '',
            "phone": user['phone'],
            "email": user['email'] or ''
        })
        
    except Exception as e:
        print(f"Profile error: {e}")
        return jsonify({"error": "Profil alınamadı"}), 500

@app.route('/api/v1/auth/logout', methods=['POST'])
def mobile_logout():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Token gerekli"}), 401
        
        token = auth_header.split(' ')[1]
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Session'ı sonlandır
        cursor.execute("""
            UPDATE user_sessions 
            SET ended_at = ? 
            WHERE id = ? AND ended_at IS NULL
        """, (datetime.now().isoformat(), token))
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Çıkış yapıldı"})
        
    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({"error": "Çıkış yapılamadı"}), 500

@app.route('/api/admin/v1/auth/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"error": "Kullanıcı adı ve şifre gerekli"}), 400
        
        # Basit admin kontrolü
        if username == "admin" and password == "admin123":
            return jsonify({
                "access_token": "admin-token-123",
                "token_type": "bearer",
                "user": {
                    "id": "admin",
                    "username": "admin",
                    "role": "admin"
                }
            })
        else:
            return jsonify({"error": "Geçersiz kullanıcı adı veya şifre"}), 401
            
    except Exception as e:
        print(f"Admin login error: {e}")
        return jsonify({"error": "Giriş yapılamadı"}), 500

@app.route('/api/admin/v1/users', methods=['GET'])
def admin_users():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Tüm kullanıcıları al
        cursor.execute("SELECT * FROM users")
        users_data = cursor.fetchall()
        
        # Session durumlarını kontrol et
        users = []
        for row in users_data:
            user_id = row['id']
            
            # Son 5 dakika içinde aktif session var mı?
            cursor.execute("""
                SELECT started_at FROM user_sessions 
                WHERE user_id = ? AND ended_at IS NULL 
                AND datetime(started_at) > datetime('now', '-5 minutes')
            """, (user_id,))
            
            active_session = cursor.fetchone()
            is_online = active_session is not None
            last_seen = active_session['started_at'] if active_session else None
            
            users.append({
                "id": user_id,
                "name": row['name'] or '',
                "surname": row['surname'] or '',
                "username": row['username'] or '',
                "phone": row['phone'] or '',
                "email": row['email'] or '',
                "created_at": row['created_at'],
                "status": "active" if is_online else "inactive",
                "last_seen": last_seen
            })
        
        conn.close()
        
        return jsonify({
            "items": users,
            "total": len(users),
            "page": 1,
            "size": 50
        })
        
    except Exception as e:
        print(f"Admin users error: {e}")
        return jsonify({"error": "Kullanıcılar alınamadı"}), 500

@app.route('/api/admin/v1/donations', methods=['GET'])
def admin_donations():
    try:
        # Gerçek bağış verileri (şimdilik boş)
        donations = []
        
        return jsonify({
            "items": donations,
            "total": len(donations),
            "page": 1,
            "size": 50
        })
        
    except Exception as e:
        print(f"Admin donations error: {e}")
        return jsonify({"error": "Bağışlar alınamadı"}), 500

@app.route('/api/admin/v1/carts', methods=['GET'])
def admin_carts():
    try:
        # Gerçek sepet verileri (şimdilik boş)
        carts = []
        
        return jsonify({
            "data": {
                "carts": carts,
                "total": len(carts),
                "page": 1,
                "size": 50
            }
        })
        
    except Exception as e:
        print(f"Admin carts error: {e}")
        return jsonify({"error": "Sepetler alınamadı"}), 500

if __name__ == '__main__':
    init_db()
    print("Backend başlatılıyor... http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)
