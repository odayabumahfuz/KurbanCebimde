import { useState } from 'react'
import Layout from '../components/Layout'
import { Save, RefreshCw, Bell, Shield, Database, Globe } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Kurban Cebimde',
    siteDescription: 'Online kurban bağış platformu',
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    apiRateLimit: 1000,
    maxFileSize: 10,
    allowedFileTypes: 'jpg,jpeg,png,pdf',
    backupFrequency: 'daily',
    logRetention: 30
  })

  const handleSave = () => {
    console.log('Settings saved:', settings)
    // API call to save settings
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white">Ayarlar</h1>
          <p className="text-zinc-400 mt-1">
            Sistem ve hesap ayarlarınızı yönetin
          </p>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-zinc-900">Genel Ayarlar</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Site Adı</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Site Açıklaması</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  className="input-field"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-zinc-100">Bildirim Ayarları</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">E-posta Bildirimleri</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-600 rounded bg-zinc-700"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">SMS Bildirimleri</span>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-600 rounded bg-zinc-700"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-semibold text-zinc-100">Güvenlik Ayarları</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Bakım Modu</span>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-600 rounded bg-zinc-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">API Rate Limit</label>
                <input
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => setSettings({...settings, apiRateLimit: parseInt(e.target.value)})}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-zinc-100">Sistem Ayarları</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Maksimum Dosya Boyutu (MB)</label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">İzin Verilen Dosya Türleri</label>
                <input
                  type="text"
                  value={settings.allowedFileTypes}
                  onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={16} />
            Ayarları Kaydet
          </button>
        </div>
      </div>
    </Layout>
  )
}