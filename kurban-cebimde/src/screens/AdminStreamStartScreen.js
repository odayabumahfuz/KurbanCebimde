import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Clipboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { liveAPI } from '../lib/liveAPI';
import adminAPI from '../lib/adminAPI';

export default function AdminStreamStartScreen({ route, navigation }) {
  const { userId, donationInfo } = route.params || {};
  const { user } = useAuth();
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamCreated, setStreamCreated] = useState(false);
  const [streamData, setStreamData] = useState(null);

  useEffect(() => {
    // Otomatik olarak bağış bilgilerini doldur
    if (donationInfo) {
      setStreamTitle(`${donationInfo.animal_type} Kesimi - ${donationInfo.user_name}`);
      setStreamDescription(`${donationInfo.user_name} için ${donationInfo.animal_type} kurban kesimi canlı yayını`);
    }
    
    // Admin token'ı set et
    getAdminToken();
  }, [donationInfo]);

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
      } else {
        console.error('❌ Admin token alınamadı:', response.status);
      }
    } catch (error) {
      console.error('❌ Admin token hatası:', error);
    }
  };

  const createAndStartStream = async () => {
    if (!userId) {
      Alert.alert('Hata', 'Kullanıcı ID gerekli');
      return;
    }

    if (!streamTitle.trim()) {
      Alert.alert('Hata', 'Yayın başlığı gerekli');
      return;
    }

    try {
      setLoading(true);
      
      // Stream oluştur
      const response = await adminAPI.createStreamForUser(userId, {
        title: streamTitle.trim(),
        description: streamDescription.trim(),
        animal_type: donationInfo?.animal_type || 'Kurban',
        donor_name: donationInfo?.user_name || 'Bilinmeyen'
      });

      setStreamData(response.data);
      setStreamCreated(true);
      
      Alert.alert(
        'Başarılı!', 
        `Yayın oluşturuldu!\nStream ID: ${response.data.stream_id}\n\nŞimdi yayını başlatmak istiyor musunuz?`,
        [
          { text: 'Hayır', style: 'cancel' },
          { text: 'Evet', onPress: () => startStream(response.data.stream_id) }
        ]
      );
      
    } catch (error) {
      console.error('Stream oluşturulamadı:', error);
      Alert.alert('Hata', 'Stream oluşturulamadı: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startStream = async (streamId) => {
    try {
      setLoading(true);
      
      // Stream'i başlat
      await liveAPI.startStream(streamId);
      
      // Yayın sayfasına git
      navigation.navigate('StartLive', {
        streamId: streamId,
        channel: streamData?.channel,
        isAdmin: true,
        donationInfo: donationInfo
      });
      
    } catch (error) {
      console.error('Stream başlatılamadı:', error);
      Alert.alert('Hata', 'Stream başlatılamadı: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyStreamId = () => {
    if (streamData?.stream_id) {
      Clipboard.setString(streamData.stream_id);
      Alert.alert('Kopyalandı', 'Stream ID kopyalandı');
    }
  };

  const copyUserId = () => {
    Clipboard.setString(userId);
    Alert.alert('Kopyalandı', 'Kullanıcı ID kopyalandı');
  };

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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Yayın Başlat</Text>
      </View>

      {/* Donation Info */}
      {donationInfo && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Bağış Bilgileri</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kullanıcı:</Text>
            <Text style={styles.infoValue}>{donationInfo.user_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bağış:</Text>
            <Text style={styles.infoValue}>{donationInfo.animal_type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tutar:</Text>
            <Text style={styles.infoValue}>{donationInfo.amount} TL</Text>
          </View>
        </View>
      )}

      {/* User ID Section */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Kullanıcı ID</Text>
        <View style={styles.userIdContainer}>
          <Text style={styles.userIdText}>{userId}</Text>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={copyUserId}
          >
            <Ionicons name="copy-outline" size={16} color="#3b82f6" />
            <Text style={styles.copyText}>Kopyala</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stream Details */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Yayın Detayları</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Yayın Başlığı</Text>
          <TextInput
            style={styles.textInput}
            value={streamTitle}
            onChangeText={setStreamTitle}
            placeholder="Yayın başlığını girin"
            multiline
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Açıklama</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={streamDescription}
            onChangeText={setStreamDescription}
            placeholder="Yayın açıklamasını girin"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Stream Data Display */}
      {streamCreated && streamData && (
        <View style={styles.streamDataCard}>
          <Text style={styles.streamDataTitle}>Stream Oluşturuldu!</Text>
          <View style={styles.streamDataRow}>
            <Text style={styles.streamDataLabel}>Stream ID:</Text>
            <TouchableOpacity 
              style={styles.streamIdContainer}
              onPress={copyStreamId}
            >
              <Text style={styles.streamIdText}>{streamData.stream_id}</Text>
              <Ionicons name="copy-outline" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          <View style={styles.streamDataRow}>
            <Text style={styles.streamDataLabel}>Channel:</Text>
            <Text style={styles.streamDataValue}>{streamData.channel}</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {!streamCreated ? (
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={createAndStartStream}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="videocam-outline" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Yayın Oluştur</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={() => startStream(streamData.stream_id)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="play-outline" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Yayını Başlat</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Super Admin Features */}
      {user?.is_super_admin && (
        <View style={styles.superAdminSection}>
          <Text style={styles.superAdminTitle}>Super Admin Özellikleri</Text>
          <TouchableOpacity
            style={styles.superAdminButton}
            onPress={() => navigation.navigate('AdminPanel')}
          >
            <Ionicons name="settings-outline" size={20} color="#8b5cf6" />
            <Text style={styles.superAdminButtonText}>Admin Panel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  userIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  userIdText: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  copyText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  streamDataCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  streamDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 12,
  },
  streamDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streamDataLabel: {
    fontSize: 14,
    color: '#0c4a6e',
    fontWeight: '500',
  },
  streamIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  streamIdText: {
    fontSize: 12,
    color: '#0c4a6e',
    fontFamily: 'monospace',
    marginRight: 8,
  },
  streamDataValue: {
    fontSize: 14,
    color: '#0c4a6e',
    fontWeight: '600',
  },
  actionContainer: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  superAdminSection: {
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  superAdminTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c3aed',
    marginBottom: 12,
  },
  superAdminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8b5cf6',
    gap: 8,
  },
  superAdminButtonText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    fontSize: 16,
    marginTop: 50,
  },
});
