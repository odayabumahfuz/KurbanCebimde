import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { liveAPI } from '../lib/liveAPI';
import { LIVEKIT_CONFIG } from '../lib/livekitConfig';
import LiveKitPlayer from '../components/live/LiveKitPlayer';

export default function StartLiveScreen({ route, navigation }) {
  const { streamId, channel } = route.params || {};
  const [token, setToken] = useState(null);
  const [joining, setJoining] = useState(false);
  const [useLiveKit, setUseLiveKit] = useState(true); // LiveKit kullanımını aktif et

  async function ensurePermissions() {
    if (Platform.OS !== 'android') return true;
    const cam = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    const mic = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return cam === PermissionsAndroid.RESULTS.GRANTED && mic === PermissionsAndroid.RESULTS.GRANTED;
  }

  async function fetchToken() {
    try {
      const data = await liveAPI.getToken({ role: 'publisher', channel });
      setToken(data?.rtcToken);
    } catch (e) {
      Alert.alert('Hata', 'Token alınamadı');
    }
  }

  async function startStream() {
    try {
      setJoining(true);
      
      if (useLiveKit) {
        // LiveKit ile yayın başlat
        const roomName = channel || `room_${Date.now()}`;
        const participantName = 'Yayıncı';
        const participantIdentity = `publisher_${Date.now()}`;
        
        // Önce stream'i başlat
        await liveAPI.startStream(streamId);
        
        // Sonra LiveKit yayın sayfasına git
        navigation.navigate('LiveKitStream', { 
          roomName, 
          participantName, 
          participantIdentity,
          streamId 
        });
      } else {
        // Agora ile yayın başlat (eski sistem)
        await liveAPI.startStream(streamId);
        
        navigation.navigate('WatchLive', { 
          channel, 
          role: 'publisher', 
          token,
          streamId 
        });
      }
    } catch (e) {
      Alert.alert('Hata', 'Yayın başlatılamadı: ' + e.message);
    } finally {
      setJoining(false);
    }
  }

  useEffect(() => {
    fetchToken();
  }, [channel]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yayıncı Ekranı</Text>
      <Text style={styles.meta}>Kanal: {channel}</Text>
      
      {/* LiveKit/Agora Seçimi */}
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
        <Text style={styles.meta}>LiveKit URL: {LIVEKIT_CONFIG.url}</Text>
      ) : (
        <Text style={styles.meta}>AppID: {AGORA_APP_ID.slice(0,6)}…</Text>
      )}
      
      <TouchableOpacity
        style={[styles.primaryBtn, joining && { opacity: 0.5 }]}
        disabled={joining}
        onPress={async () => {
          const ok = await ensurePermissions();
          if (!ok) return;
          await startStream();
        }}
      >
        <Ionicons name="radio-outline" size={18} color="#fff" />
        <Text style={styles.primaryBtnText}>
          {useLiveKit ? 'LiveKit Yayını Başlat' : 'Agora Yayını Başlat'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 },
  meta: { color: '#6B7280', marginBottom: 4 },
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
  primaryBtn: { backgroundColor: colors.primary, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 16 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});


