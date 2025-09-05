import { useState } from 'react'
import { Settings, Save, User, Shield, Bell, CreditCard, Globe, LogOut, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Kurban Cebimde',
    adminEmail: 'admin@kurbancebimde.com',
    paymentProvider: 'iyzico',
    apiKey: '••••••••••',
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'png', 'pdf', 'mp4'],
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    donationAlerts: true,
    userRegistrationAlerts: true,
    systemMaintenanceAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
  })
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    ipWhitelist: [],
    auditLogging: true,
    dataEncryption: true,
  })

  const tabs = [
    { id: 'general', name: 'Genel', icon: Settings },
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'security', name: 'Güvenlik', icon: Shield },
    { id: 'notifications', name: 'Bildirimler', icon: Bell },
    { id: 'payment', name: 'Ödeme', icon: CreditCard },
    { id: 'regional', name: 'Bölgesel', icon: Globe },
    { id: 'system', name: 'Sistem', icon: Settings },
  ]

  const handleLogout = () => {
    // Çıkış yap işlemi
    console.log('Çıkış yapılıyor...')
    // Local storage'dan token'ı sil
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    // Ana sayfaya yönlendir
    window.location.href = '/login'
  }

  const handleDeleteAccount = async () => {
    // Hesap silme onayı
    if (window.confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        
        const response = await fetch('http://localhost:8000/api/v1/auth/delete-account', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          alert('Hesabınız başarıyla silindi')
          handleLogout()
        } else {
          const error = await response.json()
          alert(`Hata: ${error.detail}`)
        }
      } catch (error) {
        console.error('Hesap silme hatası:', error)
        alert('Hesap silinirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor!')
      return
    }

    if (passwordData.newPassword.length < 8) {
      alert('Yeni şifre en az 8 karakter olmalıdır!')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      const response = await fetch('http://localhost:8000/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      })

      if (response.ok) {
        alert('Şifre başarıyla değiştirildi!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const error = await response.json()
        alert(`Hata: ${error.detail}`)
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error)
      alert('Şifre değiştirilirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page header */}
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#111827'
        }}>Ayarlar</h1>
        <p style={{
          color: '#6b7280',
          marginTop: '0.25rem'
        }}>
          Sistem ve hesap ayarlarınızı yönetin
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '1.5rem'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '1rem'
        }}>
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: isActive ? '#dbeafe' : 'transparent',
                    color: isActive ? '#1e40af' : '#6b7280',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <Icon style={{ height: '1.25rem', width: '1.25rem' }} />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div style={{
          flex: '1',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '2rem'
        }}>
          {activeTab === 'general' && (
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1.5rem'
              }}>Genel Ayarlar</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Uygulama Adı
                  </label>
                  <input
                    type="text"
                    defaultValue="Kurban Cebimde"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Zaman Dilimi
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}>
                    <option value="tr">Türkiye (UTC+3)</option>
                    <option value="utc">UTC</option>
                    <option value="gmt">GMT</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Dil
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}>
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}>
                  <Save style={{ height: '1rem', width: '1rem' }} />
                  Kaydet
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1.5rem'
              }}>Profil Ayarları</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    E-posta
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@kurbancebimde.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Telefon
                  </label>
                  <input
                    type="tel"
                    defaultValue="+90 555 123 45 67"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Rol
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}>
                    <option value="admin">Sistem Yöneticisi</option>
                    <option value="moderator">Moderatör</option>
                    <option value="editor">Editör</option>
                  </select>
                </div>

                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}>
                  <Save style={{ height: '1rem', width: '1rem' }} />
                  Profili Güncelle
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1.5rem'
              }}>Güvenlik Ayarları</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Şifre Değiştirme */}
                <div style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>Şifre Değiştir</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                      type="password"
                      placeholder="Mevcut şifre"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="password"
                      placeholder="Yeni şifre"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="password"
                      placeholder="Yeni şifre (tekrar)"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                    />
                    <button 
                      onClick={handleChangePassword}
                      disabled={loading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-start'
                      }}
                    >
                      {loading ? 'İşleniyor...' : 'Şifreyi Değiştir'}
                    </button>
                  </div>
                </div>

                {/* Hesap İşlemleri */}
                <div style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>Hesap İşlemleri</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        alignSelf: 'flex-start'
                      }}
                    >
                      <LogOut style={{ height: '1rem', width: '1rem' }} />
                      Çıkış Yap
                    </button>
                    
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: loading ? '#9ca3af' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-start'
                      }}
                    >
                      <Trash2 style={{ height: '1rem', width: '1rem' }} />
                      {loading ? 'İşleniyor...' : 'Hesabı Sil'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1.5rem'
              }}>Bildirim Ayarları</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>E-posta Bildirimleri</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        style={{ width: '1rem', height: '1rem' }}
                      />
                      E-posta bildirimleri al
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.donationAlerts}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, donationAlerts: e.target.checked }))}
                        style={{ width: '1rem', height: '1rem' }}
                      />
                      Bağış uyarıları
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyReports}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                        style={{ width: '1rem', height: '1rem' }}
                      />
                      Haftalık raporlar
                    </label>
                  </div>
                </div>

                <div style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>Sistem Bildirimleri</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.systemMaintenanceAlerts}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemMaintenanceAlerts: e.target.checked }))}
                        style={{ width: '1rem', height: '1rem' }}
                      />
                      Sistem bakım uyarıları
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.userRegistrationAlerts}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, userRegistrationAlerts: e.target.checked }))}
                        style={{ width: '1rem', height: '1rem' }}
                      />
                      Yeni kullanıcı kayıtları
                    </label>
                  </div>
                </div>

                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}>
                  <Save style={{ height: '1rem', width: '1rem' }} />
                  Bildirim Ayarlarını Kaydet
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1.5rem'
              }}>Ödeme Ayarları</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>iyzico Ayarları</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        API Anahtarı
                      </label>
                      <input
                        type="password"
                        placeholder="iyzico API anahtarınızı girin"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Gizli Anahtar
                      </label>
                      <input
                        type="password"
                        placeholder="iyzico gizli anahtarınızı girin"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>Test Modu</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        defaultChecked
                        style={{ width: '1rem', height: '1rem' }}
                      />
                      Test modunu aktif et (geliştirme için)
                    </label>
                    
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#fef3c2',
                      border: '1px solid #f59e0b',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      color: '#92400e'
                    }}>
                      ⚠️ Test modunda gerçek ödeme alınmaz
                    </div>
                  </div>
                </div>

                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}>
                  <Save style={{ height: '1rem', width: '1rem' }} />
                  Ödeme Ayarlarını Kaydet
                </button>
              </div>
            </div>
          )}

          {activeTab === 'regional' && (
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1.5rem'
              }}>Bölgesel Ayarlar</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>Varsayılan Bölge</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Ana Bölge
                      </label>
                      <select style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}>
                        <option value="turkey">Türkiye</option>
                        <option value="syria">Suriye</option>
                        <option value="palestine">Filistin</option>
                        <option value="somalia">Somali</option>
                        <option value="bangladesh">Bangladeş</option>
                        <option value="pakistan">Pakistan</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Para Birimi
                      </label>
                      <select style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}>
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">Amerikan Doları ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="SAR">Suudi Riyali (ر.س)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>Çoklu Dil Desteği</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        defaultChecked
                        style={{ width: '1rem', height: '1rem' }}
                      />
                      Türkçe (varsayılan)
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        style={{ width: '1rem', height: '1rem' }}
                      />
                      English
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        style={{ width: '1rem', height: '1rem' }}
                      />
                      العربية
                    </label>
                  </div>
                </div>

                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}>
                  <Save style={{ height: '1rem', width: '1rem' }} />
                  Bölgesel Ayarları Kaydet
                </button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
                  Sistem Ayarları
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Site Adı
                    </label>
                    <input
                      type="text"
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Admin E-posta
                    </label>
                    <input
                      type="email"
                      value={systemSettings.adminEmail}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Ödeme Sağlayıcı
                    </label>
                    <select
                      value={systemSettings.paymentProvider}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, paymentProvider: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="iyzico">iyzico</option>
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                      <option value="manual">Manuel Ödeme</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      API Anahtarı
                    </label>
                    <input
                      type="password"
                      value={systemSettings.apiKey}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="••••••••••"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      style={{ width: '1rem', height: '1rem' }}
                    />
                    Bakım Modu
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={systemSettings.debugMode}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, debugMode: e.target.checked }))}
                      style={{ width: '1rem', height: '1rem' }}
                    />
                    Debug Modu
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={systemSettings.autoBackup}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                      style={{ width: '1rem', height: '1rem' }}
                    />
                    Otomatik Yedekleme
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={systemSettings.autoBackup}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                      style={{ width: '1rem', height: '1rem' }}
                    />
                    Denetim Günlüğü
                  </label>
                </div>
                
                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    onClick={() => alert('Sistem ayarları kaydedildi!')}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Ayarları Kaydet
                  </button>
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
                  Güvenlik Ayarları
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Oturum Zaman Aşımı (dakika)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      min="5"
                      max="480"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Maksimum Giriş Denemesi
                    </label>
                    <input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                      min="3"
                      max="10"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Şifre Geçerlilik Süresi (gün)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                      min="30"
                      max="365"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    onClick={() => alert('Güvenlik ayarları kaydedildi!')}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Güvenlik Ayarlarını Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
