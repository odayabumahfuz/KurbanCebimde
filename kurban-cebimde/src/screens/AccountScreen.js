import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

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
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Lütfen giriş yapın</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Gerçek kullanıcı verilerini kullan
  const userData = {
    name: `${user.name || ''} ${user.surname || ''}`.trim() || 'Kullanıcı',
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
      lastDonation: 'Henüz bağış yok', // TODO: Backend'den gerçek veri al
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.heading}>Hesabım</Text>

        {/* Kullanıcı Kartı */}
        <View style={styles.userCard}>
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
              <Text style={styles.donorId}>Bağışçı ID: {userData.donorId}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={18} color="#111827" />
            <Text style={styles.editText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Çıkış Yap Butonu */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* İstatistikler 2x2 */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={styles.statLabel}>Toplam Bağış</Text>
            <Text style={styles.statValue}>{userData.stats.totalAmount}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={styles.statLabel}>Kurban / Hisse</Text>
            <Text style={styles.statValue}>{userData.stats.kurbanCount} / {userData.stats.shareCount}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statLabel}>Katıldığı Bölge</Text>
            <Text style={styles.statValue}>{userData.stats.regionCount}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F5F3FF' }]}>
            <Text style={styles.statLabel}>Son Bağış</Text>
            <Text style={styles.statValue}>{userData.stats.lastDonation}</Text>
          </View>
        </View>

        {/* Menü Kartları */}
        <View style={{ marginTop: 12 }}>
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Bağışlarım')}>
            <View style={[styles.menuIcon, { backgroundColor: '#DCFCE7' }]}><Ionicons name="receipt-outline" size={18} color="#065F46" /></View>
            <Text style={styles.menuText}>Bağışlarım</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Canlı Yayın')}>
            <View style={[styles.menuIcon, { backgroundColor: '#E0F2FE' }]}><Ionicons name="videocam-outline" size={18} color="#075985" /></View>
            <Text style={styles.menuText}>Canlı Yayın & Arşiv</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Sertifikalarım')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFF7ED' }]}><Ionicons name="document-text-outline" size={18} color="#7C2D12" /></View>
            <Text style={styles.menuText}>Sertifikalarım</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Raporlarım')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FEF2F2' }]}><Ionicons name="analytics-outline" size={18} color="#991B1B" /></View>
            <Text style={styles.menuText}>Raporlarım</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Kartlarım')}>
            <View style={[styles.menuIcon, { backgroundColor: '#F5F3FF' }]}><Ionicons name="card-outline" size={18} color="#4C1D95" /></View>
            <Text style={styles.menuText}>Kartlarım</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Ayarlarım')}>
            <View style={[styles.menuIcon, { backgroundColor: '#F1F5F9' }]}><Ionicons name="settings-outline" size={18} color="#111827" /></View>
            <Text style={styles.menuText}>Ayarlarım</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF2FF', paddingHorizontal: 16 },
  heading: { fontSize: 30, fontWeight: '800', marginHorizontal: 16, marginTop: 36, marginBottom: 24 },
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
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  avatar: { width: 58, height: 58, borderRadius: 16, marginRight: 12, backgroundColor: '#F1F5F9' },
  userName: { fontSize: 18, fontWeight: '800', color: colors.text },
  rowMiddle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  contactText: { color: '#6B7280', marginRight: 4 },
  donorId: { color: '#111827', fontWeight: '700' },
  editBtn: { alignSelf: 'flex-start', backgroundColor: '#F3F4F6', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8, marginLeft: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  editText: { fontWeight: '700', color: '#111827' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 14 },
  statCard: { width: '48%', borderRadius: 16, padding: 14, marginBottom: 12 },
  statLabel: { color: '#374151', fontWeight: '700' },
  statValue: { color: '#111827', fontSize: 18, fontWeight: '800', marginTop: 4 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 4 },
  tile: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#E9EEF5',
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
  tileTitle: { fontWeight: '800', color: colors.text, fontSize: 16, letterSpacing: -0.2 },
  tileValue: { color: colors.textMuted, fontSize: 12, marginTop: 2 },

  menuRow: { backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  menuIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  menuText: { flex: 1, fontWeight: '800', color: colors.text },
  
  logoutBtn: { 
    backgroundColor: '#FEF2F2', 
    borderRadius: 16, 
    paddingHorizontal: 14, 
    paddingVertical: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#FECACA' 
  },
  logoutText: { 
    flex: 1, 
    fontWeight: '800', 
    color: '#DC2626',
    marginLeft: 10
  },
});


