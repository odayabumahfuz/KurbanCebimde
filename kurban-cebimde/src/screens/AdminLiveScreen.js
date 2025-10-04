import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  Clipboard,
  Image,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';
import { font } from '../theme/typography';
import adminAPI from '../lib/adminAPI';

export default function AdminLiveScreen({ navigation }) {
  const { user } = useAuth();
  const [kurbanId, setKurbanId] = useState('');
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streamsLoading, setStreamsLoading] = useState(true);

  useEffect(() => {
    if (user?.is_admin || user?.is_super_admin) {
      // Admin token'ı set et
      getAdminToken();
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
        // Token set edildikten sonra streams'i getir
        fetchStreams();
      } else {
        console.error('❌ Admin token alınamadı:', response.status);
      }
    } catch (error) {
      console.error('❌ Admin token hatası:', error);
    }
  };

  const fetchStreams = async () => {
    try {
      setStreamsLoading(true);
      const response = await adminAPI.getStreams();
      setStreams(response.items || []);
    } catch (error) {
      console.error('Streams yüklenemedi:', error);
      Alert.alert('Hata', 'Streams yüklenemedi');
    } finally {
      setStreamsLoading(false);
    }
  };

  const createStream = async () => {
    if (!kurbanId.trim()) {
      Alert.alert('Hata', 'Kullanıcı ID gerekli');
      return;
    }

    try {
      setLoading(true);
      
      // Direkt kullanıcı ID'si ile stream oluştur
      const response = await adminAPI.createStreamForUser(kurbanId.trim(), {
        title: `Kurban Kesimi - ${kurbanId}`,
        description: 'Admin tarafından oluşturulan kurban kesimi yayını',
        animal_type: 'Kurban',
        donor_name: 'Admin'
      });
      
      Alert.alert('Başarılı', `Stream oluşturuldu!\nStream ID: ${response.stream_id}`);
      setKurbanId('');
      fetchStreams();
    } catch (error) {
      console.error('Stream oluşturulamadı:', error);
      Alert.alert('Hata', `Stream oluşturulamadı: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startStream = async (streamId) => {
    try {
      await adminAPI.startStream(streamId);
      Alert.alert('Başarılı', 'Stream başlatıldı', [
        {
          text: 'Yayın Ekranına Git',
          onPress: () => {
            // LiveKitStream ekranına yönlendir
            const roomName = `admin_${streamId}`;
            const participantName = 'Admin Yayıncı';
            const participantIdentity = `admin_${Date.now()}`;
            
            navigation.navigate('LiveKitStream', {
              roomName,
              participantName,
              participantIdentity,
              streamId,
              mode: 'publisher'
            });
          }
        },
        {
          text: 'Tamam',
          onPress: () => fetchStreams()
        }
      ]);
    } catch (error) {
      console.error('Stream başlatılamadı:', error);
      Alert.alert('Hata', 'Stream başlatılamadı');
    }
  };

  const stopStream = async (streamId) => {
    Alert.alert(
      'Stream Durdur',
      'Stream\'i durdurmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Durdur',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.stopStream(streamId);
              Alert.alert('Başarılı', 'Stream durduruldu');
              fetchStreams();
            } catch (error) {
              console.error('Stream durdurulamadı:', error);
              Alert.alert('Hata', 'Stream durdurulamadı');
            }
          }
        }
      ]
    );
  };

  const deleteStream = async (streamId) => {
    Alert.alert(
      'Yayın Sil',
      'Bu yayını silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteStream(streamId);
              Alert.alert('Başarılı', 'Yayın silindi');
              fetchStreams();
            } catch (error) {
              console.error('Yayın silinemedi:', error);
              Alert.alert('Hata', 'Yayın silinemedi');
            }
          }
        }
      ]
    );
  };

  const copyStreamId = (streamId) => {
    Clipboard.setString(streamId);
    Alert.alert('Kopyalandı', 'Stream ID kopyalandı');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return '#ef4444';
      case 'scheduled': return '#3b82f6';
      case 'draft': return '#8b5cf6';
      case 'ended': return '#6b7280';
      default: return '#f59e0b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'live': return 'Canlı';
      case 'scheduled': return 'Planlandı';
      case 'draft': return 'Taslak';
      case 'ended': return 'Bitti';
      default: return status;
    }
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

  const renderStreamItem = ({ item }) => (
    <View style={styles.streamCard}>
      <View style={styles.streamHeader}>
        <Text style={styles.userName}>
          {item.donor_name || item.user_name || 'Bilinmeyen Kullanıcı'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.streamDetails}>
        <Text style={styles.detailLabel}>Kullanıcı ID:</Text>
        <TouchableOpacity 
          style={styles.streamIdContainer}
          onPress={() => copyStreamId(item.created_by || item.user_id)}
        >
          <Text style={styles.streamId} numberOfLines={1} ellipsizeMode="middle">
            {(item.created_by || item.user_id) && (item.created_by || item.user_id).length > 20 ? 
              `${(item.created_by || item.user_id).substring(0, 8)}...${(item.created_by || item.user_id).substring((item.created_by || item.user_id).length - 8)}` : 
              (item.created_by || item.user_id)}
          </Text>
          <Ionicons name="copy-outline" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.streamDetails}>
        <Text style={styles.detailLabel}>Kesilen Hayvan:</Text>
        <Text style={styles.detailValue}>{item.animal_type || item.kurban_type || 'Belirtilmemiş'}</Text>
      </View>
      
      <View style={styles.streamDetails}>
        <Text style={styles.detailLabel}>Donation ID:</Text>
        <Text style={styles.detailValue}>{item.donation_id || 'Belirtilmemiş'}</Text>
      </View>
      
      <View style={styles.streamDetails}>
        <Text style={styles.detailLabel}>Yayın Tarihi:</Text>
        <Text style={styles.detailValue}>{formatDate(item.created_at)}</Text>
      </View>
      
      <View style={styles.streamActions}>
        <TouchableOpacity 
          style={styles.viewStreamButton}
          onPress={() => navigation.navigate('Streams')}
        >
          <Ionicons name="list-outline" size={16} color="white" />
          <Text style={styles.viewStreamText}>Yayınları Görüntüle</Text>
        </TouchableOpacity>
        {(item.status === 'draft' || item.status === 'scheduled') && (
          <TouchableOpacity 
            style={styles.startStreamButton}
            onPress={() => startStream(item.id)}
          >
            <Ionicons name="videocam-outline" size={16} color="white" />
            <Text style={styles.startStreamText}>Yayın Başlat</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteStream(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="white" />
          <Text style={styles.deleteButtonText}>Sil</Text>
        </TouchableOpacity>
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
      
      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Create Stream Section */}
        <View style={styles.createSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yeni Stream Oluştur</Text>
            <View style={styles.sectionDivider} />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Kullanıcı ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı ID girin"
              value={kurbanId}
              onChangeText={setKurbanId}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={createStream}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.createButtonText}>Stream Oluştur</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Streams Section */}
        <View style={styles.streamsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mevcut Streams</Text>
            <View style={styles.sectionDivider} />
          </View>
          
          {streamsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.brand} />
              <Text style={styles.loadingText}>Streams yükleniyor...</Text>
            </View>
          ) : streams.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-off-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>Henüz stream oluşturulmamış</Text>
              <Text style={styles.emptySubtext}>Yukarıdaki formu kullanarak yeni stream oluşturun</Text>
            </View>
          ) : (
            <View style={styles.streamsList}>
              {streams.map((item) => (
                <View key={item.id} style={styles.streamCard}>
                  {renderStreamItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  createSection: {
    backgroundColor: colors.surface,
    margin: 20,
    marginBottom: 16,
    borderRadius: tokens.radii.xl,
    padding: 24,
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: font.extrabold,
    color: '#111827',
    marginBottom: 8,
  },
  sectionDivider: {
    height: 3,
    backgroundColor: colors.brand,
    borderRadius: tokens.radii.full,
    width: 40,
  },
  inputContainer: {
    marginBottom: 20,
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
    borderRadius: tokens.radii.md,
    padding: 16,
    fontSize: 16,
    fontFamily: font.regular,
    backgroundColor: '#FAFAFA',
    color: '#111827',
  },
  createButton: {
    backgroundColor: colors.brand,
    borderRadius: tokens.radii.md,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: font.bold,
  },
  streamsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: font.regular,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.surface,
    borderRadius: tokens.radii.xl,
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: font.semibold,
    color: '#374151',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: font.regular,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  streamsList: {
    gap: 16,
  },
  streamCard: {
    backgroundColor: colors.surface,
    borderRadius: tokens.radii.xl,
    padding: 24,
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: font.bold,
    color: '#111827',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: tokens.radii.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: font.bold,
    letterSpacing: 0.5,
  },
  streamDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: font.semibold,
    color: '#374151',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: font.regular,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  streamIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tokens.radii.md,
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  streamId: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    fontFamily: font.regular,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: tokens.radii.md,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  stopButton: {
    backgroundColor: colors.danger,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tokens.radii.sm,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: font.bold,
    marginLeft: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: font.bold,
    color: '#111827',
    flex: 1,
  },
  streamActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  viewStreamButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tokens.radii.sm,
    marginRight: 8,
  },
  viewStreamText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
  },
  startStreamButton: {
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tokens.radii.sm,
  },
  startStreamText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: font.bold,
    marginLeft: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: font.bold,
    marginLeft: 6,
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
