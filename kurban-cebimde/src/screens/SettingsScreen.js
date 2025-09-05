import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState({
    sms: true,
    push: true,
    email: false,
    kurbanReminders: true,
    liveStreams: true,
    reports: false,
    donationUpdates: true,
    certificateReady: true,
    systemMaintenance: false,
  });

  const [language, setLanguage] = useState('tr');
  const [security, setSecurity] = useState({
    biometric: false,
    pinCode: true,
    twoFactor: false,
    autoLock: true,
    sessionTimeout: 30,
  });

  const [profile, setProfile] = useState({
    name: 'Oday',
    surname: 'Abumahfuz',
    phone: '+905397426943',
    email: 'oday@example.com',
    notifications: true,
  });

  const [payment, setPayment] = useState({
    defaultCard: 'Visa ****1234',
    autoSave: true,
    currency: 'TRY',
    taxReceipt: true,
  });

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  function SettingItem({ icon, title, subtitle, onPress, rightElement, showArrow = true }) {
    return (
      <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.settingRight}>
          {rightElement}
          {showArrow && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
        </View>
      </TouchableOpacity>
    );
  }

  function SwitchItem({ icon, title, subtitle, value, onValueChange }) {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E7EB', true: colors.primary }}
          thumbColor={colors.surface}
        />
      </View>
    );
  }

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    Alert.alert('Başarılı', 'Dil ayarı güncellendi!');
  };

  const handleSecurityChange = (key, value) => {
    if (key === 'biometric' && value) {
      Alert.alert(
        'Parmak İzi / Face ID',
        'Bu özelliği etkinleştirmek için cihaz ayarlarınızı kontrol edin.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Ayarlar', onPress: () => {} }
        ]
      );
      return;
    }
    
    setSecurity(prev => ({ ...prev, [key]: value }));
    Alert.alert('Başarılı', 'Güvenlik ayarı güncellendi!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: () => {
            // Burada gerçek çıkış işlemi yapılacak
            Alert.alert('Başarılı', 'Çıkış yapıldı!');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Hesabı Sil', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Son Uyarı',
              'Tüm verileriniz silinecek. Emin misiniz?',
              [
                { text: 'İptal', style: 'cancel' },
                { 
                  text: 'Evet, Sil', 
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Başarılı', 'Hesap silindi!');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlarım</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Bildirim Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirim Tercihleri</Text>
          <View style={styles.sectionContent}>
            <SwitchItem
              icon="notifications-outline"
              title="SMS Bildirimleri"
              subtitle="Kurban kesim hatırlatıcıları"
              value={notifications.sms}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, sms: value }))}
            />
            <SwitchItem
              icon="phone-portrait-outline"
              title="Push Bildirimleri"
              subtitle="Uygulama içi bildirimler"
              value={notifications.push}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, push: value }))}
            />
            <SwitchItem
              icon="mail-outline"
              title="E-posta Bildirimleri"
              subtitle="Detaylı raporlar ve güncellemeler"
              value={notifications.email}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, email: value }))}
            />
            <SwitchItem
              icon="time-outline"
              title="Kurban Hatırlatıcıları"
              subtitle="Kesim öncesi bildirimler"
              value={notifications.kurbanReminders}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, kurbanReminders: value }))}
            />
            <SwitchItem
              icon="videocam-outline"
              title="Canlı Yayın Bildirimleri"
              subtitle="Yayın başlangıç bildirimleri"
              value={notifications.liveStreams}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, liveStreams: value }))}
            />
            <SwitchItem
              icon="document-text-outline"
              title="Rapor Bildirimleri"
              subtitle="Aylık ve yıllık raporlar"
              value={notifications.reports}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, reports: value }))}
            />
            <SwitchItem
              icon="heart-outline"
              title="Bağış Güncellemeleri"
              subtitle="Bağış durumu değişiklikleri"
              value={notifications.donationUpdates}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, donationUpdates: value }))}
            />
            <SwitchItem
              icon="ribbon-outline"
              title="Sertifika Hazır"
              subtitle="Sertifika hazır olduğunda"
              value={notifications.certificateReady}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, certificateReady: value }))}
            />
            <SwitchItem
              icon="construct-outline"
              title="Sistem Bakım Bildirimleri"
              subtitle="Bakım ve güncelleme bildirimleri"
              value={notifications.systemMaintenance}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, systemMaintenance: value }))}
            />
          </View>
        </View>

        {/* Dil Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dil ve Bölge</Text>
          <View style={styles.sectionContent}>
            {languages.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.languageItem, language === lang.code && styles.selectedLanguage]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[styles.languageName, language === lang.code && styles.selectedLanguageText]}>
                  {lang.name}
                </Text>
                {language === lang.code && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Güvenlik Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Güvenlik</Text>
          <View style={styles.sectionContent}>
            <SwitchItem
              icon="finger-print-outline"
              title="Parmak İzi / Face ID"
              subtitle="Hızlı giriş için biyometrik kimlik doğrulama"
              value={security.biometric}
              onValueChange={(value) => handleSecurityChange('biometric', value)}
            />
            <SwitchItem
              icon="lock-closed-outline"
              title="PIN Kodu"
              subtitle="4 haneli PIN ile ekran kilidi"
              value={security.pinCode}
              onValueChange={(value) => handleSecurityChange('pinCode', value)}
            />
            <SwitchItem
              icon="shield-checkmark-outline"
              title="İki Faktörlü Doğrulama"
              subtitle="SMS ile ek güvenlik"
              value={security.twoFactor}
              onValueChange={(value) => handleSecurityChange('twoFactor', value)}
            />
            <SwitchItem
              icon="timer-outline"
              title="Otomatik Kilit"
              subtitle="Uygulama kullanılmadığında otomatik kilit"
              value={security.autoLock}
              onValueChange={(value) => handleSecurityChange('autoLock', value)}
            />
          </View>
        </View>

        {/* Profil Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person-outline"
              title="Ad Soyad"
              subtitle={`${profile.name} ${profile.surname}`}
              onPress={() => Alert.alert('Profil Düzenle', 'Profil düzenleme yakında eklenecek!')}
            />
            <SettingItem
              icon="call-outline"
              title="Telefon"
              subtitle={profile.phone}
              onPress={() => Alert.alert('Telefon Değiştir', 'Telefon değiştirme yakında eklenecek!')}
            />
            <SettingItem
              icon="mail-outline"
              title="E-posta"
              subtitle={profile.email}
              onPress={() => Alert.alert('E-posta Değiştir', 'E-posta değiştirme yakında eklenecek!')}
            />
            <SettingItem
              icon="key-outline"
              title="Şifre Değiştir"
              subtitle="Hesap güvenliği için şifre güncelle"
              onPress={() => Alert.alert('Şifre Değiştir', 'Şifre değiştirme yakında eklenecek!')}
            />
          </View>
        </View>

        {/* Ödeme Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ödeme ve Fatura</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="card-outline"
              title="Varsayılan Kart"
              subtitle={payment.defaultCard}
              onPress={() => Alert.alert('Kart Yönetimi', 'Kart yönetimi yakında eklenecek!')}
            />
            <SwitchItem
              icon="save-outline"
              title="Otomatik Kaydet"
              subtitle="Kart bilgilerini güvenli şekilde kaydet"
              value={payment.autoSave}
              onValueChange={(value) => setPayment(prev => ({ ...prev, autoSave: value }))}
            />
            <SettingItem
              icon="cash-outline"
              title="Para Birimi"
              subtitle={payment.currency}
              onPress={() => Alert.alert('Para Birimi', 'Para birimi seçimi yakında eklenecek!')}
            />
            <SwitchItem
              icon="receipt-outline"
              title="Vergi Makbuzu"
              subtitle="Bağış sonrası vergi makbuzu gönder"
              value={payment.taxReceipt}
              onValueChange={(value) => setPayment(prev => ({ ...prev, taxReceipt: value }))}
            />
          </View>
        </View>

        {/* Hesap Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person-outline"
              title="Profil Bilgileri"
              subtitle="Ad, telefon, e-posta güncelleme"
              onPress={() => Alert.alert('Profil', 'Profil düzenleme özelliği yakında eklenecek!')}
            />
            <SettingItem
              icon="card-outline"
              title="Ödeme Yöntemleri"
              subtitle="Kart ve banka hesabı yönetimi"
              onPress={() => navigation.navigate('Kartlarım')}
            />
            <SettingItem
              icon="download-outline"
              title="Veri İndir"
              subtitle="Hesap verilerinizi indirin"
              onPress={() => Alert.alert('Veri İndir', 'Veri indirme özelliği yakında eklenecek!')}
            />
          </View>
        </View>

        {/* Destek & Yardım */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destek & Yardım</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="help-circle-outline"
              title="Yardım Merkezi"
              subtitle="Sık sorulan sorular ve rehberler"
              onPress={() => Alert.alert('Yardım', 'Yardım merkezi yakında eklenecek!')}
            />
            <SettingItem
              icon="chatbubble-outline"
              title="Canlı Destek"
              subtitle="WhatsApp ve chat desteği"
              onPress={() => Alert.alert('Canlı Destek', 'Canlı destek yakında eklenecek!')}
            />
            <SettingItem
              icon="call-outline"
              title="Bizi Arayın"
              subtitle="+90 xxx xxx xx xx"
              onPress={() => Alert.alert('Arama', 'Arama özelliği yakında eklenecek!')}
            />
            <SettingItem
              icon="mail-outline"
              title="E-posta Gönder"
              subtitle="destek@kurbancebimde.com"
              onPress={() => Alert.alert('E-posta', 'E-posta özelliği yakında eklenecek!')}
            />
          </View>
        </View>

        {/* Uygulama Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="information-circle-outline"
              title="Hakkında"
              subtitle="Versiyon 1.0.0"
              onPress={() => Alert.alert('Hakkında', 'Kurban Cebimde v1.0.0\n\nKurban bağışı için geliştirilmiş mobil uygulama.')}
            />
            <SettingItem
              icon="document-text-outline"
              title="Kullanım Koşulları"
              subtitle="Yasal şartlar ve koşullar"
              onPress={() => Alert.alert('Kullanım Koşulları', 'Kullanım koşulları yakında eklenecek!')}
            />
            <SettingItem
              icon="shield-outline"
              title="Gizlilik Politikası"
              subtitle="Veri koruma ve gizlilik"
              onPress={() => Alert.alert('Gizlilik Politikası', 'Gizlilik politikası yakında eklenecek!')}
            />
          </View>
        </View>

        {/* Çıkış & Hesap Silme */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
              <Text style={styles.deleteText}>Hesabı Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  
  scrollView: { flex: 1 },
  
  section: { marginBottom: 24 },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: colors.text, 
    marginHorizontal: 16, 
    marginBottom: 12,
    marginTop: 16
  },
  sectionContent: { backgroundColor: colors.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  
  settingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  settingIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#F3F4F6', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 },
  settingSubtitle: { fontSize: 14, color: '#6B7280' },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16,
    gap: 8
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#DC2626' },
  
  deleteButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16,
    gap: 8
  },
  deleteText: { fontSize: 16, fontWeight: '600', color: '#DC2626' },

  // New styles for language selection
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedLanguage: {
    backgroundColor: '#E0F2FE', // A light blue background for selected item
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  selectedLanguageText: {
    color: colors.primary,
  },
});
