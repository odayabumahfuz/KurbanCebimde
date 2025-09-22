import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { donationsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function DonationsHistoryScreen({ navigation }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchDonations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchDonations = async () => {
    try {
      const response = await donationsAPI.getMyDonations();
      setDonations(response.data || []);
    } catch (error) {
      console.error('Donations fetch error:', error);
      Alert.alert('Hata', 'Bağışlar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDonations();
  };

  const handlePayment = async (donationId) => {
    try {
      Alert.alert(
        'Ödeme İşlemi',
        'Bu bağış için ödeme işlemini başlatmak istediğinizden emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Ödeme Yap',
            onPress: async () => {
              const response = await donationsAPI.processPayment(donationId);
              Alert.alert('Başarılı', 'Ödeme işlemi tamamlandı!');
              fetchDonations(); // Listeyi yenile
            }
          }
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Hata', 'Ödeme işlemi başarısız.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'PAID': return '#10B981';
      case 'ASSIGNED': return '#3B82F6';
      case 'COMPLETED': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Bekliyor';
      case 'PAID': return 'Ödendi';
      case 'ASSIGNED': return 'Atandı';
      case 'COMPLETED': return 'Tamamlandı';
      default: return status;
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Giriş Gerekli</Text>
          <Text style={styles.emptySubtitle}>Bağış geçmişinizi görmek için giriş yapmalısınız.</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Bağışlar yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Bağış Geçmişim</Text>
        <Text style={styles.subtitle}>
          {donations.length} bağış
        </Text>
      </View>

      {donations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Henüz Bağış Yok</Text>
          <Text style={styles.emptySubtitle}>
            İlk bağışınızı yapmak için kurban sayfasına gidin.
          </Text>
          <TouchableOpacity
            style={styles.donateButton}
            onPress={() => navigation.navigate('Donate')}
          >
            <Text style={styles.donateButtonText}>Bağış Yap</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.donationsList}>
          {donations.map((donation) => (
            <View key={donation.id} style={styles.donationCard}>
              <View style={styles.donationHeader}>
                <View style={styles.donationInfo}>
                  <Text style={styles.donationAmount}>
                    {donation.amount} {donation.currency}
                  </Text>
                  <Text style={styles.donationDate}>
                    {new Date(donation.created_at).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(donation.status) }
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(donation.status)}
                  </Text>
                </View>
              </View>

              {donation.status === 'PENDING' && (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handlePayment(donation.id)}
                >
                  <Ionicons name="card-outline" size={16} color="#fff" />
                  <Text style={styles.payButtonText}>Ödeme Yap</Text>
                </TouchableOpacity>
              )}

              {donation.video_url && (
                <TouchableOpacity style={styles.videoButton}>
                  <Ionicons name="play-circle-outline" size={16} color={colors.primary} />
                  <Text style={styles.videoButtonText}>Videoyu İzle</Text>
                </TouchableOpacity>
              )}

              {donation.certificate_url && (
                <TouchableOpacity style={styles.certificateButton}>
                  <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                  <Text style={styles.certificateButtonText}>Sertifikayı Görüntüle</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
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
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  donateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  donationsList: {
    padding: 20,
  },
  donationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  donationInfo: {
    flex: 1,
  },
  donationAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  donationDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  payButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  videoButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  certificateButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});
