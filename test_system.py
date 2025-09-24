#!/usr/bin/env python3
"""
🧪 KurbanCebimde Comprehensive Test System
Bu script tüm sistemi test eder ve rapor oluşturur
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Any

class KurbanCebimdeTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        self.user_token = None
        self.user_id = None
        
    def log_test(self, test_name: str, success: bool, details: str = "", data: Any = None):
        """Test sonucunu logla"""
        result = {
            "test_name": test_name,
            "success": success,
            "details": details,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅" if success else "❌"
        print(f"{status} {test_name}: {details}")
        
    def test_health_check(self):
        """Sistem sağlık kontrolü"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Health Check", True, f"Status: {data.get('status')}", data)
                return True
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Kullanıcı kaydı testi"""
        try:
            # Benzersiz telefon numarası oluştur
            phone = f"555{int(time.time()) % 10000000:07d}"
            email = f"test{int(time.time())}@example.com"
            
            data = {
                "name": "Test",
                "surname": "User",
                "phone": phone,
                "email": email,
                "password": "password123"
            }
            
            response = self.session.post(f"{self.base_url}/api/v1/auth/register", json=data)
            
            if response.status_code == 200:
                result = response.json()
                self.user_id = result.get("user_id")
                self.log_test("User Registration", True, f"User ID: {self.user_id}", result)
                return True
            else:
                self.log_test("User Registration", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Registration", False, f"Error: {str(e)}")
            return False
    
    def test_user_login(self, phone: str = None):
        """Kullanıcı girişi testi"""
        try:
            if not phone:
                phone = f"555{int(time.time()) % 10000000:07d}"
            
            data = {
                "phoneOrEmail": phone,
                "password": "password123"
            }
            
            response = self.session.post(f"{self.base_url}/api/v1/auth/login", json=data)
            
            if response.status_code == 200:
                result = response.json()
                self.user_token = result.get("access_token")
                self.log_test("User Login", True, f"Token received", {"token_length": len(self.user_token) if self.user_token else 0})
                return True
            else:
                self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Login", False, f"Error: {str(e)}")
            return False
    
    def test_user_profile(self):
        """Kullanıcı profil bilgileri testi"""
        try:
            if not self.user_token:
                self.log_test("User Profile", False, "No token available")
                return False
            
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = self.session.get(f"{self.base_url}/api/v1/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("User Profile", True, f"User: {data.get('name')} {data.get('surname')}", data)
                return True
            else:
                self.log_test("User Profile", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Profile", False, f"Error: {str(e)}")
            return False
    
    def test_donation_create(self):
        """Bağış oluşturma testi"""
        try:
            if not self.user_token:
                self.log_test("Donation Create", False, "No token available")
                return False
            
            headers = {
                "Authorization": f"Bearer {self.user_token}",
                "Content-Type": "application/json"
            }
            
            data = {
                "amount": 250.0,
                "description": "Test bağışı - Sistem testi",
                "payment_method": "credit_card"
            }
            
            response = self.session.post(f"{self.base_url}/api/v1/donations/", json=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                self.log_test("Donation Create", True, f"Amount: {result.get('amount')} {result.get('currency')}", result)
                return True
            else:
                self.log_test("Donation Create", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Donation Create", False, f"Error: {str(e)}")
            return False
    
    def test_donation_list(self):
        """Bağış listesi testi"""
        try:
            if not self.user_token:
                self.log_test("Donation List", False, "No token available")
                return False
            
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = self.session.get(f"{self.base_url}/api/v1/donations/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else 0
                self.log_test("Donation List", True, f"Found {count} donations", data)
                return True
            else:
                self.log_test("Donation List", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Donation List", False, f"Error: {str(e)}")
            return False
    
    def test_streams_list(self):
        """Yayın listesi testi"""
        try:
            if not self.user_token:
                self.log_test("Streams List", False, "No token available")
                return False
            
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = self.session.get(f"{self.base_url}/api/v1/streams/", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else 0
                self.log_test("Streams List", True, f"Found {count} streams", data)
                return True
            else:
                self.log_test("Streams List", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Streams List", False, f"Error: {str(e)}")
            return False
    
    def test_admin_endpoints(self):
        """Admin endpoint'leri testi"""
        try:
            # Admin login denemesi
            data = {
                "phoneOrEmail": "admin@kurbancebimde.com",
                "password": "admin123"
            }
            
            response = self.session.post(f"{self.base_url}/api/admin/v1/auth/login", json=data)
            
            if response.status_code == 200:
                result = response.json()
                admin_token = result.get("access_token")
                self.log_test("Admin Login", True, "Admin login successful", {"token_length": len(admin_token) if admin_token else 0})
                
                # Admin bağış listesi
                if admin_token:
                    headers = {"Authorization": f"Bearer {admin_token}"}
                    response = self.session.get(f"{self.base_url}/api/admin/v1/donations/", headers=headers)
                    
                    if response.status_code == 200:
                        data = response.json()
                        count = len(data) if isinstance(data, list) else 0
                        self.log_test("Admin Donations", True, f"Found {count} donations", data)
                    else:
                        self.log_test("Admin Donations", False, f"HTTP {response.status_code}: {response.text}")
                
                return True
            else:
                self.log_test("Admin Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Endpoints", False, f"Error: {str(e)}")
            return False
    
    def test_frontend_services(self):
        """Frontend servisleri testi"""
        try:
            # Admin Panel
            response = self.session.get("http://localhost:3001")
            admin_status = response.status_code == 200
            self.log_test("Admin Panel", admin_status, f"Status: {response.status_code}")
            
            # React Native Web
            response = self.session.get("http://localhost:8081")
            rn_status = response.status_code == 200
            self.log_test("React Native Web", rn_status, f"Status: {response.status_code}")
            
            # Expo Dev Server
            response = self.session.get("http://localhost:8082")
            expo_status = response.status_code == 200
            self.log_test("Expo Dev Server", expo_status, f"Status: {response.status_code}")
            
            return admin_status and rn_status and expo_status
            
        except Exception as e:
            self.log_test("Frontend Services", False, f"Error: {str(e)}")
            return False
    
    def test_api_documentation(self):
        """API dokümantasyonu testi"""
        try:
            # Swagger UI
            response = self.session.get(f"{self.base_url}/docs")
            swagger_status = response.status_code == 200
            self.log_test("Swagger UI", swagger_status, f"Status: {response.status_code}")
            
            # ReDoc
            response = self.session.get(f"{self.base_url}/redoc")
            redoc_status = response.status_code == 200
            self.log_test("ReDoc", redoc_status, f"Status: {response.status_code}")
            
            # OpenAPI JSON
            response = self.session.get(f"{self.base_url}/openapi.json")
            openapi_status = response.status_code == 200
            if openapi_status:
                data = response.json()
                paths_count = len(data.get("paths", {}))
                self.log_test("OpenAPI JSON", True, f"Found {paths_count} endpoints")
            else:
                self.log_test("OpenAPI JSON", False, f"Status: {response.status_code}")
            
            return swagger_status and redoc_status and openapi_status
            
        except Exception as e:
            self.log_test("API Documentation", False, f"Error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Hata yönetimi testi"""
        try:
            # Geçersiz endpoint
            response = self.session.get(f"{self.base_url}/api/invalid/endpoint")
            self.log_test("Invalid Endpoint", response.status_code == 404, f"Status: {response.status_code}")
            
            # Geçersiz token
            headers = {"Authorization": "Bearer invalid_token"}
            response = self.session.get(f"{self.base_url}/api/v1/auth/me", headers=headers)
            self.log_test("Invalid Token", response.status_code == 401, f"Status: {response.status_code}")
            
            # Geçersiz veri
            data = {"invalid": "data"}
            response = self.session.post(f"{self.base_url}/api/v1/auth/login", json=data)
            self.log_test("Invalid Data", response.status_code == 422, f"Status: {response.status_code}")
            
            return True
            
        except Exception as e:
            self.log_test("Error Handling", False, f"Error: {str(e)}")
            return False
    
    def run_comprehensive_test(self):
        """Kapsamlı test çalıştır"""
        print("🧪 KurbanCebimde Comprehensive Test System")
        print("=" * 50)
        
        # Temel sistem testleri
        print("\n📊 Sistem Sağlık Kontrolü:")
        self.test_health_check()
        
        # API dokümantasyonu
        print("\n📚 API Dokümantasyonu:")
        self.test_api_documentation()
        
        # Frontend servisleri
        print("\n🖥️ Frontend Servisleri:")
        self.test_frontend_services()
        
        # Kullanıcı işlemleri
        print("\n👤 Kullanıcı İşlemleri:")
        self.test_user_registration()
        self.test_user_login()
        self.test_user_profile()
        
        # Bağış sistemi
        print("\n💰 Bağış Sistemi:")
        self.test_donation_create()
        self.test_donation_list()
        
        # Yayın sistemi
        print("\n📺 Yayın Sistemi:")
        self.test_streams_list()
        
        # Admin sistemi
        print("\n🔧 Admin Sistemi:")
        self.test_admin_endpoints()
        
        # Hata yönetimi
        print("\n🚨 Hata Yönetimi:")
        self.test_error_handling()
        
        # Sonuçları özetle
        self.generate_report()
    
    def generate_report(self):
        """Test raporu oluştur"""
        print("\n" + "=" * 50)
        print("📋 TEST RAPORU")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        successful_tests = sum(1 for test in self.test_results if test["success"])
        failed_tests = total_tests - successful_tests
        
        print(f"📊 Toplam Test: {total_tests}")
        print(f"✅ Başarılı: {successful_tests}")
        print(f"❌ Başarısız: {failed_tests}")
        print(f"📈 Başarı Oranı: {(successful_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Başarısız Testler:")
            for test in self.test_results:
                if not test["success"]:
                    print(f"  - {test['test_name']}: {test['details']}")
        
        print("\n🎯 Sistem Durumu:")
        if successful_tests >= total_tests * 0.8:
            print("🟢 Sistem sağlıklı çalışıyor!")
        elif successful_tests >= total_tests * 0.6:
            print("🟡 Sistem kısmen çalışıyor, bazı sorunlar var")
        else:
            print("🔴 Sistemde ciddi sorunlar var!")
        
        # Raporu dosyaya kaydet
        report_file = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump({
                "summary": {
                    "total_tests": total_tests,
                    "successful_tests": successful_tests,
                    "failed_tests": failed_tests,
                    "success_rate": (successful_tests/total_tests)*100
                },
                "tests": self.test_results
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Detaylı rapor kaydedildi: {report_file}")

def main():
    """Ana fonksiyon"""
    tester = KurbanCebimdeTester()
    tester.run_comprehensive_test()

if __name__ == "__main__":
    main()
