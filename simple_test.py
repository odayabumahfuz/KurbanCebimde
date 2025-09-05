#!/usr/bin/env python3
"""
Simple Test Server - Import Test
"""

import logging
logging.basicConfig(level=logging.DEBUG)

print("🚀 Simple Test Server başlatılıyor...")

try:
    print(">>> 1. FastAPI import...")
    from fastapi import FastAPI
    print("✅ FastAPI import OK")
    
    print(">>> 2. App oluşturuluyor...")
    app = FastAPI()
    print("✅ App oluşturuldu")
    
    print(">>> 3. Endpoint ekleniyor...")
    @app.get("/health")
    def health():
        return {"status": "ok", "message": "Simple test server çalışıyor"}
    
    @app.get("/")
    def root():
        return {"message": "Simple Test Server"}
    
    print("✅ Endpoint'ler eklendi")
    
    print(">>> 4. Server başlatılıyor...")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
except Exception as e:
    print(f"❌ HATA: {e}")
    import traceback
    traceback.print_exc()




