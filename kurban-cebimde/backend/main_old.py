from flask import Flask, jsonify, request, g
from flask_cors import CORS
import sqlite3
from datetime import datetime
import uuid
import os
try:
    import psutil
except ImportError:
    psutil = None

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

def normalize_phone(phone_raw):
    try:
        if not phone_raw:
            return None
        # Sadece rakamları al
        digits = ''.join(ch for ch in str(phone_raw) if ch.isdigit())
        # Ülke kodu 90 ise at
        if digits.startswith('90') and len(digits) >= 12:
            digits = digits[2:]
        # Başta 0 varsa at
        if digits.startswith('0') and len(digits) >= 11:
            digits = digits[1:]
        # 10 haneden uzunsa son 10 haneyi al
        if len(digits) > 10:
            digits = digits[-10:]
        return digits
    except Exception:
        return None

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
    
    # Carts tablosu
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS carts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            product TEXT,
            category TEXT,
            qty INTEGER DEFAULT 1,
            unit_price REAL DEFAULT 0,
            amount REAL DEFAULT 0,
            region TEXT,
            intention TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Kullanıcı tablosu boş başlasın - dinamik veriler için
    
    conn.commit()
    conn.close()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

# --- Monitoring Endpoints ---
@app.route('/api/monitor/system', methods=['GET'])
def monitor_system():
    try:
        if psutil is None:
            return jsonify({
                "cpu_usage": "N/A",
                "memory_usage": "N/A",
                "memory_total": "N/A",
                "memory_available": "N/A",
                "disk_usage": "N/A",
                "disk_total": "N/A",
                "disk_free": "N/A",
                "uptime": "N/A",
                "timestamp": datetime.now().isoformat()
            })

        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        process = psutil.Process(os.getpid())

        data = {
            "cpu_usage": f"{psutil.cpu_percent(interval=0.2)}%",
            "memory_usage": f"{round(memory.percent, 2)}%",
            "memory_total": f"{round(memory.total / (1024**3), 2)} GB",
            "memory_available": f"{round(memory.available / (1024**3), 2)} GB",
            "disk_usage": f"{round(disk.percent, 2)}%",
            "disk_total": f"{round(disk.total / (1024**3), 2)} GB",
            "disk_free": f"{round(disk.free / (1024**3), 2)} GB",
            "uptime": process.create_time(),
            "timestamp": datetime.now().isoformat()
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/monitor/status', methods=['GET'])
def monitor_status():
    try:
        backend_status = {
            "status": "online",
            "port": 8000,
            "last_check": datetime.now().isoformat()
        }
        admin_status = {
            "status": "online",
            "port": 3000,
            "last_check": datetime.now().isoformat()
        }
        db_status = {
            "status": "online",
            "file": "test.db",
            "last_check": datetime.now().isoformat()
        }
        return jsonify({
            "backend": backend_status,
            "admin_panel": admin_status,
            "database": db_status,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/monitor/logs', methods=['GET'])
def monitor_logs():
    # Basit örnek: uygulama içinde minimal statik loglar
    logs = [
        {"timestamp": datetime.now().isoformat(), "level": "INFO", "message": "Monitor endpoint hit"}
    ]
    return jsonify({"logs": logs})

@app.route('/ws/status', methods=['GET'])
def ws_status():
    return jsonify({"websocket": "ok", "timestamp": datetime.now().isoformat()})

@app.route('/api/v1/auth/login', methods=['POST'])
def mobile_login():
    try:
        data = request.get_json()
        phone = data.get('phone') or data.get('username')
        password = data.get('password')
        
        # Telefon numarasını normalize et
        phone = normalize_phone(phone)
        
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
        
        # Telefon numarasını normalize et
        phone = normalize_phone(phone)
        
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
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.id, c.user_id, u.name, u.surname, u.phone, c.product, c.category, c.qty, c.unit_price, c.amount, c.region, c.intention, c.created_at
            FROM carts c
            LEFT JOIN users u ON u.id = c.user_id
            ORDER BY datetime(c.created_at) DESC
        """)
        rows = cursor.fetchall()
        conn.close()
        carts = []
        for r in rows:
            carts.append({
                "id": r['id'],
                "user_id": r['user_id'],
                "user_name": (r['name'] or '') + (' ' + (r['surname'] or '') if r['surname'] else ''),
                "user_phone": r['phone'],
                "product": r['product'],
                "category": r['category'],
                "qty": r['qty'],
                "unit_price": r['unit_price'],
                "amount": r['amount'],
                "region": r['region'],
                "intention": r['intention'],
                "created_at": r['created_at']
            })
        return jsonify({"items": carts, "total": len(carts), "page": 1, "size": 50})
        
    except Exception as e:
        print(f"Admin carts error: {e}")
        return jsonify({"error": "Sepetler alınamadı"}), 500

# --------- User carts endpoints ---------
def get_user_id_from_token(token: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id FROM users u
        JOIN user_sessions s ON u.id = s.user_id
        WHERE s.id = ? AND s.ended_at IS NULL
    """, (token,))
    row = cursor.fetchone()
    conn.close()
    return row['id'] if row else None

@app.route('/api/v1/carts', methods=['GET'])
def get_my_carts():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Token gerekli"}), 401
        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({"error": "Geçersiz token"}), 401
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM carts WHERE user_id = ? ORDER BY datetime(created_at) DESC
        """, (user_id,))
        rows = cursor.fetchall()
        conn.close()
        items = []
        for r in rows:
            items.append({
                "id": r['id'],
                "product": r['product'],
                "category": r['category'],
                "qty": r['qty'],
                "unit_price": r['unit_price'],
                "amount": r['amount'],
                "region": r['region'],
                "intention": r['intention'],
                "created_at": r['created_at']
            })
        return jsonify({"items": items, "total": len(items)})
    except Exception as e:
        print(f"Get carts error: {e}")
        return jsonify({"error": "Sepetler alınamadı"}), 500

@app.route('/api/v1/carts', methods=['POST'])
def add_to_cart():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Token gerekli"}), 401
        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({"error": "Geçersiz token"}), 401
        data = request.get_json() or {}
        product = data.get('product') or data.get('title') or 'Bağış'
        category = data.get('category') or ''
        qty = int(data.get('qty') or 1)
        unit_price = float(data.get('unit_price') or data.get('unitPrice') or 0)
        amount = float(data.get('amount') or (unit_price * qty))
        region = data.get('region') or ''
        intention = data.get('intention') or ''
        cart_id = str(uuid.uuid4())
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO carts (id, user_id, product, category, qty, unit_price, amount, region, intention)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (cart_id, user_id, product, category, qty, unit_price, amount, region, intention))
        conn.commit()
        conn.close()
        return jsonify({
            "id": cart_id,
            "product": product,
            "category": category,
            "qty": qty,
            "unit_price": unit_price,
            "amount": amount,
            "region": region,
            "intention": intention
        }), 201
    except Exception as e:
        print(f"Add to cart error: {e}")
        return jsonify({"error": "Sepete eklenemedi"}), 500

if __name__ == '__main__':
    init_db()
    print("Backend başlatılıyor... http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)
