import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Clipboard,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import adminAPI from '../lib/adminAPI';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';
import { font } from '../theme/typography';

export default function AdminHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeStreams: 0,
    totalStreams: 0,
    totalUsers: 0
  });

  useEffect(() => {
    if (user?.is_admin || user?.is_super_admin) {
      console.log('🔍 Admin user:', user);
      console.log('🔍 User token:', user?.token);
      // Token'ı adminAPI'ye set et
      if (user?.token) {
        adminAPI.setToken(user.token);
        console.log('✅ Token adminAPI\'ye set edildi');
      } else {
        console.log('❌ User token yok!');
      }
      fetchDonations();
      fetchStats();
    }
  }, [user]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      console.log('🚀 fetchDonations başladı');
      const response = await adminAPI.getDonations();
      console.log('📊 fetchDonations response:', response);
      console.log('📊 response.items:', response.items);
      console.log('📊 response.items.length:', response.items?.length);
      setDonations(response.items || []);
      console.log('✅ Donations set edildi:', response.items?.length || 0);
    } catch (error) {
      console.error('Bağışlar yüklenemedi:', error);
      Alert.alert('Hata', 'Bağışlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🚀 fetchStats başladı');
      const response = await adminAPI.getStats();
      console.log('📊 fetchStats response:', response);
      setStats(response.data || stats);
      console.log('✅ Stats set edildi:', response);
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  const copyUserId = (userId) => {
    Clipboard.setString(userId);
    Alert.alert('Kopyalandı', 'Kullanıcı ID kopyalandı');
  };


  const renderDonationItem = ({ item }) => (
    <View style={styles.donationCard}>
      <View style={styles.donationHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.name && item.surname ? `${item.name} ${item.surname}` : 'Bilinmeyen Kullanıcı'}
          </Text>
          <Text style={styles.donationType}>{item.animal_type}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.donationDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Kullanıcı ID:</Text>
          <TouchableOpacity 
            style={styles.userIdContainer}
            onPress={() => copyUserId(item.user_id)}
          >
            <Text style={styles.userId} numberOfLines={1} ellipsizeMode="middle">
              {item.user_id.length > 20 ? `${item.user_id.substring(0, 8)}...${item.user_id.substring(item.user_id.length - 8)}` : item.user_id}
            </Text>
            <Ionicons name="copy-outline" size={16} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Bağış:</Text>
          <Text style={styles.detailValue}>{item.animal_type} - {item.amount} TL</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tarih:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.created_at).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>
      
    </View>
  );

  if (!user?.is_admin && !user?.is_super_admin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Bu sayfaya erişim yetkiniz yok</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/kurbancebimdeYlogo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.liveButton}>
          <Text style={styles.liveButtonText}>CANLI YAYINLAR</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="gift-outline" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{stats.totalDonations}</Text>
          <Text style={styles.statLabel}>Toplam Bağış</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="videocam-outline" size={24} color="#ef4444" />
          <Text style={styles.statNumber}>{stats.activeStreams}</Text>
          <Text style={styles.statLabel}>Beklenen Yayın</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="videocam-outline" size={24} color="#3b82f6" />
          <Text style={styles.statNumber}>{stats.totalStreams}</Text>
          <Text style={styles.statLabel}>Oluşturulan Yayın</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('AdminDonations')}
        >
          <Ionicons name="gift-outline" size={20} color="#10b981" />
          <Text style={styles.navText}>Bağış Yönetimi</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Yayın')}
        >
          <Ionicons name="videocam-outline" size={20} color="#ef4444" />
          <Text style={styles.navText}>Yayın Yönetimi</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Donations */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Son Bağışlar</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
        ) : (
          <FlatList
            data={donations.slice(0, 5)}
            renderItem={renderDonationItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: tokens.stroke.width,
    borderColor: colors.border,
  },
  headerLeft: {
    flex: 1,
    paddingLeft: 0,
  },
  logoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: -20,
  },
  logoImage: {
    width: 250,
    height: 75,
  },
  liveButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: tokens.radii.full,
  },
  liveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: font.bold,
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: tokens.radii.md,
    alignItems: 'center',
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: font.bold,
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: font.regular,
    color: '#6b7280',
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: tokens.radii.md,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
  },
  navText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: font.bold,
    color: '#111827',
    marginTop: 8,
  },
  sectionContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: font.bold,
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  donationCard: {
    backgroundColor: colors.surface,
    borderRadius: tokens.radii.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: font.bold,
    color: '#111827',
    marginBottom: 4,
  },
  donationType: {
    fontSize: 14,
    fontFamily: font.regular,
    color: '#6b7280',
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: tokens.radii.full,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: font.bold,
  },
  donationDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: font.semibold,
    color: '#374151',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: font.regular,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  userIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: tokens.radii.sm,
  },
  userId: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
    marginRight: 8,
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    color: colors.danger,
    fontSize: 16,
    marginTop: 50,
    fontFamily: font.regular,
  },
});
