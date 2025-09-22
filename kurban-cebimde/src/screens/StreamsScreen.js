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
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../lib/api';

export default function StreamsScreen({ navigation }) {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    getAdminToken();
  }, []);

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
        // Token set edildikten sonra streams'i getir
        setTimeout(() => {
          fetchStreams();
        }, 100);
      } else {
        console.error('❌ Admin token alınamadı:', response.status);
      }
    } catch (error) {
      console.error('❌ Admin token hatası:', error);
    }
  };

  const fetchStreams = async () => {
    try {
      const response = await adminAPI.getStreams();
      console.log('🔍 Streams response:', response);
      console.log('🔍 Streams items:', response?.items);
      console.log('🔍 First stream:', response?.items?.[0]);
      setStreams(response?.items || []);
    } catch (error) {
      console.error('Streams fetch error:', error);
      Alert.alert('Hata', 'Yayınlar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStreams();
  };

  const handleStartStream = async (streamId) => {
    try {
      console.log('🚀 Yayın başlatılıyor:', streamId);
      const response = await adminAPI.startStream(streamId);
      console.log('✅ Yayın başlatıldı:', response.data);
      Alert.alert('Başarılı', 'Yayın başlatıldı!');
      fetchStreams(); // Listeyi yenile
    } catch (error) {
      console.error('❌ Yayın başlatma hatası:', error);
      Alert.alert('Hata', 'Yayın başlatılamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleEndStream = async (streamId) => {
    try {
      console.log('🛑 Yayın sonlandırılıyor:', streamId);
      const response = await adminAPI.endStream(streamId);
      console.log('✅ Yayın sonlandırıldı:', response.data);
      Alert.alert('Başarılı', 'Yayın sonlandırıldı!');
      fetchStreams(); // Listeyi yenile
    } catch (error) {
      console.error('❌ Yayın sonlandırma hatası:', error);
      Alert.alert('Hata', 'Yayın sonlandırılamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleDeleteStream = async (streamId) => {
    Alert.alert(
      'Yayını Sil',
      'Bu yayını silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Yayın siliniyor:', streamId);
              const response = await adminAPI.deleteStream(streamId);
              console.log('✅ Yayın silindi:', response.data);
              Alert.alert('Başarılı', 'Yayın silindi!');
              fetchStreams(); // Listeyi yenile
            } catch (error) {
              console.error('❌ Yayın silme hatası:', error);
              Alert.alert('Hata', 'Yayın silinemedi. Lütfen tekrar deneyin.');
            }
          }
        }
      ]
    );
  };

  const handleViewStream = async (stream) => {
    try {
      // Navigate to LiveKit stream screen
      navigation.navigate('LiveKitStream', {
        roomName: stream.channel,
        participantName: 'Admin Yayıncı',
        participantIdentity: 'admin_broadcaster',
        streamId: stream.id
      });
    } catch (error) {
      console.error('Stream join error:', error);
      Alert.alert('Hata', 'Yayına katılamadı. Lütfen tekrar deneyin.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#F59E0B';
      case 'active': return '#EF4444';
      case 'live': return '#EF4444';
      case 'ended': return '#6B7280';
      case 'SCHEDULED': return '#F59E0B';
      case 'LIVE': return '#EF4444';
      case 'ENDED': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Bekleniyor';
      case 'active': return 'Canlı';
      case 'live': return 'Canlı';
      case 'ended': return 'Sonlandırılmış';
      case 'SCHEDULED': return 'Bekleniyor';
      case 'LIVE': return 'Canlı';
      case 'ENDED': return 'Sonlandırılmış';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Yayınlar yükleniyor...</Text>
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
        <Text style={styles.title}>Canlı Yayınlar</Text>
        <Text style={styles.subtitle}>
          {streams.length} yayın
        </Text>
      </View>

      {streams.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="videocam-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Henüz Yayın Yok</Text>
          <Text style={styles.emptySubtitle}>
            Şu anda aktif yayın bulunmuyor. Lütfen daha sonra tekrar kontrol edin.
          </Text>
        </View>
      ) : (
        <View style={styles.streamsList}>
          {streams.map((stream) => (
            <View key={stream.id} style={styles.streamCard}>
              <View style={styles.streamHeader}>
                <View style={styles.streamInfo}>
                  {/* Kullanıcı Adı */}
                  {stream.user_name && stream.user_surname && (
                    <Text style={styles.streamUser}>
                      👤 {stream.user_name} {stream.user_surname}
                    </Text>
                  )}
                  
                  {/* Kullanıcı ID */}
                  <Text style={styles.streamUserId}>
                    🆔 {stream.kurban_id?.substring(0, 8)}...
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(stream.status) }
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(stream.status)}
                  </Text>
                </View>
              </View>

              {/* Butonlar */}
              <View style={styles.buttonContainer}>
                {/* Yayını Başlat - sadece scheduled durumunda */}
                {stream.status === 'scheduled' && (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartStream(stream.id)}
                  >
                    <Ionicons name="play-circle-outline" size={16} color="#fff" />
                    <Text style={styles.buttonText}>Başlat</Text>
                  </TouchableOpacity>
                )}

                {/* Yayını Sonlandır - sadece live durumunda */}
                {stream.status === 'live' && (
                  <TouchableOpacity
                    style={styles.endButton}
                    onPress={() => handleEndStream(stream.id)}
                  >
                    <Ionicons name="stop-circle-outline" size={16} color="#fff" />
                    <Text style={styles.buttonText}>Sonlandır</Text>
                  </TouchableOpacity>
                )}

                {/* Yayını Görüntüle - her zaman */}
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewStream(stream)}
                >
                  <Ionicons name="eye-outline" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Görüntüle</Text>
                </TouchableOpacity>

                {/* Yayını Sil - her zaman */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteStream(stream.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Sil</Text>
                </TouchableOpacity>
              </View>
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
  },
  streamsList: {
    padding: 20,
  },
  streamCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  streamInfo: {
    flex: 1,
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  streamDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  streamUser: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  streamChannel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  streamAnimal: {
    fontSize: 12,
    color: colors.textMuted,
  },
  streamUserId: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  streamDonationDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  streamCreationDate: {
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  endButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  viewButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  streamMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streamDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  joinButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scheduledButton: {
    backgroundColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  scheduledButtonText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  endedButton: {
    backgroundColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  endedButtonText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
