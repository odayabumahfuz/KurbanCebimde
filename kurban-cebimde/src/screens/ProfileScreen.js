import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';
import { font } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, updateProfile, logout } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    avatar: null
  });

  const [editData, setEditData] = useState({ ...profileData });
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    activeCampaigns: 0
  });

  useEffect(() => {
    loadUserProfile();
    loadUserStats();
  }, []);

  const loadUserProfile = async () => {
    try {
      if (user) {
        setProfileData({
          name: user.name || '',
          surname: user.surname || '',
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.avatar || null
        });
        setEditData({
          name: user.name || '',
          surname: user.surname || '',
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.avatar || null
        });
      }
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await api.get('/donations/stats');
      setStats(response.data);
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
      // Fallback stats
      setStats({
        totalDonations: 0,
        totalAmount: 0,
        activeCampaigns: 0
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // API çağrısı yap
      await updateProfile(editData);
      
      // Local state'i güncelle
      setProfileData(editData);
      setIsEditing(false);
      
      Alert.alert(t('common.success'), 'Profil bilgileri güncellendi');
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert(t('common.error'), 'Profil güncellenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: t('profile.personalInfo'),
      subtitle: t('profile.personalInfoSubtitle'),
      onPress: () => setIsEditing(true)
    },
    {
      icon: 'notifications-outline',
      title: t('profile.notifications'),
      subtitle: t('profile.notificationsSubtitle'),
      onPress: () => Alert.alert(t('profile.notifications'), 'Bildirim ayarları açılıyor...')
    },
    {
      icon: 'shield-outline',
      title: t('profile.security'),
      subtitle: t('profile.securitySubtitle'),
      onPress: () => Alert.alert(t('profile.security'), 'Güvenlik ayarları açılıyor...')
    },
    {
      icon: 'card-outline',
      title: t('profile.paymentMethods'),
      subtitle: t('profile.paymentMethodsSubtitle'),
      onPress: () => Alert.alert('Ödeme', 'Ödeme yöntemleri açılıyor...')
    },
    {
      icon: 'globe-outline',
      title: t('profile.language'),
      subtitle: t('profile.languageSubtitle'),
      onPress: () => navigation.navigate('Ayarlarım')
    },
    {
      icon: 'help-circle-outline',
      title: t('profile.help'),
      subtitle: t('profile.helpSubtitle'),
      onPress: () => Alert.alert(t('profile.help'), 'Yardım sayfası açılıyor...')
    },
    {
      icon: 'information-circle-outline',
      title: t('profile.about'),
      subtitle: t('profile.aboutSubtitle'),
      onPress: () => Alert.alert(t('profile.about'), 'Uygulama bilgileri açılıyor...')
    }
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <Text style={styles.headerSubtitle}>Hesap bilgilerinizi yönetin</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {profileData.avatar ? (
              <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="#9ca3af" />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData.name} {profileData.surname}</Text>
            <Text style={styles.profileEmail}>{profileData.email}</Text>
            <Text style={styles.profilePhone}>{profileData.phone}</Text>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Ad</Text>
                <TextInput
                  style={styles.input}
                  value={editData.name}
                  onChangeText={(text) => setEditData({ ...editData, name: text })}
                  placeholder="Adınız"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Soyad</Text>
                <TextInput
                  style={styles.input}
                  value={editData.surname}
                  onChangeText={(text) => setEditData({ ...editData, surname: text })}
                  placeholder="Soyadınız"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <TextInput
                style={styles.input}
                value={editData.email}
                onChangeText={(text) => setEditData({ ...editData, email: text })}
                placeholder="E-posta adresiniz"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Telefon</Text>
              <TextInput
                style={styles.input}
                value={editData.phone}
                onChangeText={(text) => setEditData({ ...editData, phone: text })}
                placeholder="Telefon numaranız"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.editButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Ionicons name="create-outline" size={18} color="#3b82f6" />
            <Text style={styles.editButtonText}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalDonations}</Text>
          <Text style={styles.statLabel}>{t('profile.stats.totalDonations')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₺{stats.totalAmount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>{t('profile.stats.totalAmount')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeCampaigns}</Text>
          <Text style={styles.statLabel}>{t('profile.stats.activeCampaigns')}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={24} color="#6b7280" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            t('profile.logout'),
            t('profile.logoutConfirm'),
            [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('profile.logout'), style: 'destructive', onPress: logout }
            ]
          );
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: tokens.stroke.width,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: font.extrabold,
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: '#6b7280',
  },
  profileCard: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: tokens.radii.lg,
    padding: 24,
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: font.extrabold,
    color: '#111827',
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 15,
    fontFamily: font.regular,
    color: '#6b7280',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 15,
    fontFamily: font.regular,
    color: '#6b7280',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontFamily: font.semibold,
    fontSize: 15,
  },
  editForm: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: font.semibold,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: tokens.radii.sm,
    padding: 12,
    fontSize: 16,
    fontFamily: font.semibold,
    backgroundColor: colors.surface,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: tokens.radii.lg,
    alignItems: 'center',
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: font.bold,
    color: '#111827',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: font.regular,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: tokens.radii.lg,
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: tokens.stroke.width,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 44,
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: font.semibold,
    color: '#111827',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    fontFamily: font.regular,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    margin: 20,
    padding: 16,
    borderRadius: tokens.radii.lg,
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontWeight: '800',
    fontFamily: font.bold,
    fontSize: 16,
  },
  bottomSpacer: {
    height: 40,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: font.regular,
  },
});
