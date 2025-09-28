import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';
import LivePlayer from '../components/live/LivePlayer';
import LiveKitPlayer from '../components/live/LiveKitPlayer';
import { livekitAPI } from '../lib/api';

export default function WatchLiveScreen({ route, navigation }) {
  const { channel, role, token, streamId } = route.params || {};
  const [livekitToken, setLivekitToken] = useState(null);
  const [useLiveKit, setUseLiveKit] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (streamId && useLiveKit) {
      fetchLiveKitToken();
    }
  }, [streamId, useLiveKit]);

  const fetchLiveKitToken = async () => {
    try {
      setLoading(true);
      const response = await livekitAPI.get(`/streams/${streamId}/token?role=subscriber`);
      setLivekitToken(response.data.token);
    } catch (error) {
      console.error('LiveKit token alınamadı:', error);
      Alert.alert('Hata', 'Yayın token\'ı alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    console.log('Yayına katıldı:', channel);
  };

  const handleLeave = () => {
    console.log('Yayından ayrıldı:', channel);
    navigation.goBack();
  };

  const handleError = (error) => {
    console.error('Yayın hatası:', error);
    Alert.alert(
      'Yayın Hatası',
      'Yayın bağlantısında sorun oluştu. Tekrar denemek ister misiniz?',
      [
        { text: 'Geri Dön', onPress: () => navigation.goBack() },
        { text: 'Tekrar Dene', onPress: fetchLiveKitToken }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Canlı Yayın</Text>
      <Text style={styles.meta}>Kanal: {channel}</Text>
      <Text style={styles.meta}>Rol: {role}</Text>
      
      {/* Sistem Seçimi */}
      <View style={styles.systemSelector}>
        <Text style={styles.selectorTitle}>Yayın Sistemi:</Text>
        <TouchableOpacity
          style={[styles.systemButton, useLiveKit && styles.systemButtonActive]}
          onPress={() => setUseLiveKit(true)}
        >
          <Text style={[styles.systemButtonText, useLiveKit && styles.systemButtonTextActive]}>
            🚀 LiveKit (Yeni)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.systemButton, !useLiveKit && styles.systemButtonActive]}
          onPress={() => setUseLiveKit(false)}
        >
          <Text style={[styles.systemButtonText, !useLiveKit && styles.systemButtonTextActive]}>
            📡 Agora (Eski)
          </Text>
        </TouchableOpacity>
      </View>

      {useLiveKit ? (
        <>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Yayın yükleniyor...</Text>
            </View>
          ) : livekitToken ? (
            <LiveKitPlayer
              roomName={`stream_${streamId}`}
              participantName="İzleyici"
              participantIdentity={`viewer_${Date.now()}`}
              streamId={streamId}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onError={handleError}
            />
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Yayın token'ı alınamadı</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchLiveKitToken}>
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <LivePlayer channel={channel} token={token} role={role} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 },
  meta: { color: '#6B7280', marginBottom: 4 },
  videoPlaceholder: { flex: 1, backgroundColor: '#000', borderRadius: 12, marginTop: 12 },
  systemSelector: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  systemButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  systemButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  systemButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  systemButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    marginTop: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginTop: 12,
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


