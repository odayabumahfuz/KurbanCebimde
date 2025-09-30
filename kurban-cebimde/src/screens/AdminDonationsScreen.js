import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Clipboard,
  RefreshControl,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminAPI from '../lib/adminAPI';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';
import { font } from '../theme/typography';

export default function AdminDonationsScreen({ navigation }) {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('🔍 AdminDonationsScreen useEffect çalıştı');
    console.log('👤 User:', user?.email, 'is_admin:', user?.is_admin, 'is_super_admin:', user?.is_super_admin);
    
    if (user?.is_admin || user?.is_super_admin) {
      console.log('✅ Admin kullanıcı tespit edildi, getAdminToken çağrılıyor');
      getAdminToken();
    } else {
      console.log('❌ Admin kullanıcı değil');
    }
  }, [user]);

  const getAdminToken = async () => {
    try {
      console.log('🔑 Admin token alınıyor...');
      const response = await fetch('http://185.149.103.247:8000/api/admin/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneOrEmail: 'admin@kurbancebimde.com',
          password: 'admin123'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin token alındı:', data.access_token.substring(0, 20) + '...');
        adminAPI.setToken(data.access_token);
        // Token set edildikten sonra bağışları getir
        setTimeout(() => {
          fetchDonations();
        }, 100);
      } else {
        console.error('❌ Admin token alınamadı:', response.status);
      }
    } catch (error) {
      console.error('❌ Admin token hatası:', error);
    }
  };

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDonations();
      setDonations(response.data?.items || []);
    } catch (error) {
      console.error('Bağışlar yüklenemedi:', error);
      Alert.alert('Hata', 'Bağışlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDonations();
    setRefreshing(false);
  };

  const copyUserId = (userId) => {
    Clipboard.setString(userId);
    Alert.alert('Kopyalandı', 'Kullanıcı ID kopyalandı');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'pending': return 'Beklemede';
      case 'failed': return 'Başarısız';
      default: return status;
    }
  };

  const renderDonationItem = ({ item }) => (
    <View style={styles.donationCard}>
      <View style={styles.donationHeader}>
        <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.user.name} {item.user.surname}</Text>
        <Text style={styles.userPhone}>{item.user.phone}</Text>
        {item.user.email && (
          <Text style={styles.userEmail}>{item.user.email}</Text>
        )}
      </View>
      
      <View style={styles.donationDetails}>
        <Text style={styles.detailLabel}>Kullanıcı ID:</Text>
        <TouchableOpacity 
          style={styles.userIdContainer}
          onPress={() => copyUserId(item.user.id)}
        >
          <Text style={styles.userId}>{item.user.id}</Text>
          <Text style={styles.copyText}>Kopyala</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.donationDetails}>
        <Text style={styles.detailLabel}>Rol:</Text>
        <Text style={styles.detailValue}>{item.user.role}</Text>
      </View>
      
      {item.payment_method && (
        <View style={styles.donationDetails}>
          <Text style={styles.detailLabel}>Ödeme Yöntemi:</Text>
          <Text style={styles.detailValue}>{item.payment_method}</Text>
        </View>
      )}
      
      {item.transaction_id && (
        <View style={styles.donationDetails}>
          <Text style={styles.detailLabel}>İşlem ID:</Text>
          <Text style={styles.detailValue}>{item.transaction_id}</Text>
        </View>
      )}
      
      {item.notes && (
        <View style={styles.donationDetails}>
          <Text style={styles.detailLabel}>Notlar:</Text>
          <Text style={styles.detailValue}>{item.notes}</Text>
        </View>
      )}
      
      <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
    </View>
  );

  if (!user?.is_admin && !user?.is_super_admin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Bu sayfaya erişim yetkiniz yok</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Bağışlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/kurbancebimdeYlogo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.liveButton}>
          <Text style={styles.liveButtonText}>CANLI YAYINLAR</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={donations}
        renderItem={renderDonationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  listContainer: {
    paddingBottom: 20,
  },
  donationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  donationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
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
    borderRadius: 6,
  },
  userId: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
    marginRight: 8,
  },
  copyText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#6b7280',
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    fontSize: 16,
    marginTop: 50,
  },
});
