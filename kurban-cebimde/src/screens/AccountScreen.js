import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { tokens } from '../theme/tokens';
import { font } from '../theme/typography';
import BgPattern from '../components/BgPattern';
import { liveAPI } from '../lib/liveAPI';

function Tile({ title, value, icon, tint = '#E5E7EB', onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.tile}>
      <View style={[styles.iconWrap, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={20} color={'#4B5563'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tileTitle}>{title}</Text>
        <Text style={styles.tileValue}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AccountScreen({ navigation }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { t } = useLanguage();
  
  const handleLogout = async () => {
    try {
      await logout();
      // Login sayfasına yönlendir
      navigation.replace('Login');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };
  
  // Eğer kullanıcı giriş yapmamışsa veya yükleniyorsa
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('auth.login')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Gerçek kullanıcı verilerini kullan
  const userData = {
    name: `${user.name || ''} ${user.surname || ''}`.trim() || t('profile.title'),
    phone: user.phone || '+90 5xx xxx xx xx',
    phoneVerified: user.is_verified || false,
    email: user.email || 'email@example.com',
    emailVerified: user.is_verified || false,
    donorId: `DZ-${user.id?.slice(-6) || '000000'}`,
    avatar: require('../../assets/kurbancebimdelogo.png'),
    stats: {
      totalAmount: '₺ 0', // TODO: Backend'den gerçek veri al
      kurbanCount: 0,     // TODO: Backend'den gerçek veri al
      shareCount: 0,      // TODO: Backend'den gerçek veri al
      regionCount: 0,     // TODO: Backend'den gerçek veri al
      lastDonation: t('donation.lastDonation'), // TODO: Backend'den gerçek veri al
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <BgPattern />
        {/* Header: Logo + HESABIM chip */}
        <View style={styles.headerBar}>
          <Image source={require('../../assets/kurbancebimdelogo.png')} style={styles.brandLogo} resizeMode="contain" />
          <View style={styles.headerChip}><Text style={styles.headerChipText}>{t('home.navigation.account').toUpperCase()}</Text></View>
        </View>

        {/* Büyük kart: Kullanıcı bilgileri */}
        <View style={styles.bigBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={userData.avatar} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{userData.name}</Text>
              <View style={styles.rowMiddle}>
                <Ionicons name="call-outline" size={16} color="#6B7280" />
                <Text style={styles.contactText}>{userData.phone}</Text>
                {userData.phoneVerified ? (
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                ) : (
                  <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                )}
              </View>
              <View style={styles.rowMiddle}>
                <Ionicons name="mail-outline" size={16} color="#6B7280" />
                <Text style={styles.contactText}>{userData.email}</Text>
                {userData.emailVerified ? (
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                ) : (
                  <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                )}
              </View>
              <View style={styles.rowMiddle}>
                <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                <Text style={styles.donorId}>{t('profile.stats.totalDonations')} ID: {userData.donorId}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.naqvigate('Profil')}>
              <Ionicons name="create-outline" size={18} color={colors.text} />
              <Text style={styles.editText}>{t('common.edit')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tek satır geniş kutu: Bilgi satırı */}
        <View style={styles.fullBox}>
          <Text style={{ fontFamily: font.regular, color: colors.textMuted }}>{t('profile.securitySubtitle')}</Text>
        </View>

        {/* 2 sütun kutular: İstatistikler */}
        <View style={styles.rowBoxes}>
          <View style={styles.halfBox}>
            <Text style={styles.statLabel}>{t('profile.stats.totalAmount')}</Text>
            <Text style={styles.statValue}>{userData.stats.totalAmount}</Text>
          </View>
          <View style={styles.halfBox}>
            <Text style={styles.statLabel}>Kurban / Hisse</Text>
            <Text style={styles.statValue}>{userData.stats.kurbanCount} / {userData.stats.shareCount}</Text>
          </View>
        </View>
        <View style={styles.rowBoxes}>
          <View style={styles.halfBox}>
            <Text style={styles.statLabel}>Katıldığı Bölge</Text>
            <Text style={styles.statValue}>{userData.stats.regionCount}</Text>
          </View>
          <View style={styles.halfBox}>
            <Text style={styles.statLabel}>{t('donation.lastDonation')}</Text>
            <Text style={styles.statValue}>{userData.stats.lastDonation}</Text>
          </View>
        </View>

        {/* Alt geniş kutu: Çıkış */}
        <TouchableOpacity style={[styles.fullBox, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={[styles.logoutText, { marginLeft: 8 }]}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        {/* Admin Bilgisi */}
        {(user.is_admin || user.is_super_admin) && (
          <View style={{ marginTop: 16 }}>
            <View style={[styles.fullBox, { backgroundColor: '#FEF3C2', borderColor: '#F59E0B' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#F59E0B" />
                <Text style={[styles.logoutText, { marginLeft: 8, color: '#F59E0B' }]}>
                  {user.is_super_admin ? 'Super Admin' : 'Admin'} Hesabı
                </Text>
              </View>
              <Text style={[styles.logoutText, { color: '#F59E0B', fontSize: 12, marginTop: 4, textAlign: 'center' }]}>
                Alt menüden admin özelliklerine erişebilirsiniz
              </Text>
            </View>
          </View>
        )}

        {/* Navigasyon kutuları */}
        <View style={{ marginTop: 16 }}>
          <View style={styles.rowBoxes}>
            <TouchableOpacity style={styles.navBox} onPress={() => navigation.navigate('Bağışlarım')}>
              <Ionicons name="receipt-outline" size={18} color={colors.text} />
              <Text style={styles.navText}>{t('home.navigation.myDonations')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBox} onPress={() => navigation.navigate('Canlı Yayınlar')}>
              <Ionicons name="videocam-outline" size={18} color={colors.text} />
              <Text style={styles.navText}>{t('home.navigation.liveStreams')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rowBoxes}>
            <TouchableOpacity style={styles.navBox} onPress={() => navigation.navigate('Sertifikalarım')}>
              <Ionicons name="document-text-outline" size={18} color={colors.text} />
              <Text style={styles.navText}>{t('home.navigation.certificates')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBox} onPress={() => navigation.navigate('Raporlarım')}>
              <Ionicons name="analytics-outline" size={18} color={colors.text} />
              <Text style={styles.navText}>{t('home.navigation.reports')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rowBoxes}>
            <TouchableOpacity style={styles.navBox} onPress={() => navigation.navigate('Kartlarım')}>
              <Ionicons name="card-outline" size={18} color={colors.text} />
              <Text style={styles.navText}>{t('home.navigation.myCards')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBox} onPress={() => navigation.navigate('Ayarlarım')}>
              <Ionicons name="settings-outline" size={18} color={colors.text} />
              <Text style={styles.navText}>{t('home.navigation.settings')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  brandLogo: { width: 140, height: 48 },
  headerChip: { backgroundColor: colors.brand, paddingHorizontal: 18, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: tokens.stroke.width, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  headerChipText: { color: '#fff', fontWeight: '800', fontFamily: font.bold, letterSpacing: 0.6 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#EEF2FF' 
  },
  loadingText: { 
    fontSize: 18, 
    color: '#6B7280',
    fontWeight: '600' 
  },
  /* mockup layout */
  bigBox: { marginTop: 16, padding: 14, borderRadius: tokens.radii.lg, backgroundColor: colors.surface, borderWidth: tokens.stroke.width, borderColor: colors.border },
  fullBox: { marginTop: 16, minHeight: 56, borderRadius: tokens.radii.lg, backgroundColor: colors.surface, borderWidth: tokens.stroke.width, borderColor: colors.border, paddingHorizontal: 16, justifyContent: 'center' },
  rowBoxes: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  halfBox: { width: '48%', height: 88, borderRadius: tokens.radii.lg, backgroundColor: colors.surface, borderWidth: tokens.stroke.width, borderColor: colors.border, padding: 12, alignItems: 'center', justifyContent: 'center' },
  statLabel: { color: '#6B7280', fontFamily: font.regular },
  statValue: { color: colors.text, fontFamily: font.extrabold, fontSize: 18, marginTop: 4 },
  navBox: { width: '48%', height: 56, borderRadius: tokens.radii.lg, backgroundColor: colors.surface, borderWidth: tokens.stroke.width, borderColor: colors.border, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  navText: { color: colors.text, fontFamily: font.bold },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginHorizontal: 16, marginBottom: 12, marginTop: 16 },
  /* legacy styles kept for reference */
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: tokens.radii.lg, padding: 14, borderWidth: tokens.stroke.width, borderColor: colors.border },
  avatar: { width: 58, height: 58, borderRadius: 16, marginRight: 12, backgroundColor: '#F1F5F9' },
  userName: { fontSize: 18, fontWeight: '800', fontFamily: font.extrabold, color: colors.text },
  rowMiddle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  contactText: { color: '#6B7280', marginRight: 4, fontFamily: font.regular },
  donorId: { color: '#111827', fontWeight: '700' },
  editBtn: { alignSelf: 'flex-start', backgroundColor: '#EAD9D5', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8, marginLeft: 8, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: tokens.stroke.width, borderColor: colors.border },
  editText: { fontWeight: '800', fontFamily: font.bold, color: colors.text },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 14 },
  statCard: { width: '48%', borderRadius: 16, padding: 14, marginBottom: 12 },
  statLabel: { color: '#374151', fontWeight: '700', fontFamily: font.semibold },
  statValue: { color: '#111827', fontSize: 18, fontWeight: '800', fontFamily: font.extrabold, marginTop: 4 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 4 },
  tile: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: tokens.radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    minHeight: 110,
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tileTitle: { fontWeight: '800', fontFamily: font.bold, color: colors.text, fontSize: 16, letterSpacing: -0.2 },
  tileValue: { color: colors.textMuted, fontSize: 12, marginTop: 2, fontFamily: font.regular },

  menuRow: { backgroundColor: colors.surface, borderRadius: tokens.radii.lg, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: tokens.stroke.width, borderColor: colors.border },
  menuIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  menuText: { flex: 1, fontWeight: '800', fontFamily: font.extrabold, color: colors.text },
  
  logoutBtn: { 
    backgroundColor: '#FEF2F2', 
    borderRadius: tokens.radii.lg, 
    paddingHorizontal: 14, 
    paddingVertical: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20, 
    marginBottom: 10, 
    borderWidth: tokens.stroke.width, 
    borderColor: colors.border 
  },
  logoutText: { 
    flex: 1, 
    fontWeight: '800', 
    fontFamily: font.bold,
    color: '#DC2626',
    marginLeft: 10
  },
});


