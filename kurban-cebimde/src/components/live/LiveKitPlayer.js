import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-audio';
import Constants from 'expo-constants';
import { LIVEKIT_CONFIG } from '../../lib/livekitConfig';
import { livekitAPI } from '../../lib/api';
import { LiveKitRoom, VideoView, useParticipants, useLocalParticipant } from '@livekit/react-native';
import { atob as base64Atob } from 'react-native-quick-base64';

// API Base URL
const API_BASE_URL = 'http://185.149.103.247:8000/api';

const { width, height } = Dimensions.get('window');

const LiveKitPlayer = ({ 
  roomName, 
  participantName, 
  participantIdentity,
  streamId,
  mode = 'viewer', // 'viewer' | 'publisher'
  onJoin,
  onLeave,
  onError 
}) => {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const tokenRef = useRef(null);
  const isFetchingTokenRef = useRef(false);
  const shouldPublish = mode === 'publisher';
  const [canPublishGrant, setCanPublishGrant] = useState(null); // null=unknown, true/false from token
  
  const lastStreamIdRef = useRef(null);
  useEffect(() => {
    // Aynı streamId için tekrar tetiklemeyi engelle
    if (lastStreamIdRef.current === streamId) return;
    lastStreamIdRef.current = streamId;
    if (shouldPublish) {
    requestPermissions();
      }
    fetchToken();
  }, [streamId]);

  const requestPermissions = async () => {
    try {
      console.log('İzinler isteniyor...');
      
      // Kamera izni
      if (!cameraPermission?.granted) {
        console.log('Kamera izni isteniyor...');
        const cameraResult = await requestCameraPermission();
        console.log('Kamera izni sonucu:', cameraResult);
        if (!cameraResult.granted) {
          Alert.alert(
            'Kamera İzni Gerekli', 
            'Canlı yayın için kamera erişimi gereklidir. Ayarlardan izin verebilirsiniz.',
            [
              { text: 'Tamam', style: 'default' }
            ]
          );
        }
      } else {
        console.log('Kamera izni zaten verilmiş');
      }
      
      // Mikrofon izni - expo-camera ile
      console.log('Mikrofon izni isteniyor...');
      try {
        const { Camera } = await import('expo-camera');
        const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      console.log('Mikrofon izni sonucu:', audioStatus);
      setMicrophonePermission(audioStatus.status === 'granted');
      } catch (audioError) {
        console.log('⚠️ Mikrofon izni alınamadı, devam ediliyor:', audioError);
        setMicrophonePermission(false);
      }
      
      console.log('İzin durumu:', {
        kamera: cameraPermission?.granted,
        mikrofon: microphonePermission
      });
      
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Hata', 'İzin isteği başarısız: ' + error.message);
    }
  };

  const fetchToken = async () => {
    try {
      // Çift (eşzamanlı) token isteğini engelle
      if (tokenRef.current || isFetchingTokenRef.current) {
        console.log('🔄 Token zaten mevcut/isteniyor, tekrar alınmıyor');
        if (tokenRef.current) setToken(tokenRef.current);
        return;
      }
      isFetchingTokenRef.current = true;

      const role = shouldPublish ? 'publisher' : 'subscriber';
      const identityFallback = shouldPublish ? `publisher_${Date.now()}` : `viewer_${Date.now()}`;
      const identityToUse = participantIdentity || identityFallback;

      const url = `/streams/${streamId}/token?role=${encodeURIComponent(role)}&identity=${encodeURIComponent(identityToUse)}`;
      console.log('🚀 LiveKit API Request: GET ' + url);
      const response = await livekitAPI.get(url);
      console.log('🔑 LiveKit Token eklendi');
      console.log('✅ LiveKit API Response: 200 ' + url);

      const data = response?.data;
      const receivedToken = typeof data === 'string' ? data : data?.token;
      if (!receivedToken) {
        throw new Error('Token parse edilemedi');
      }
      console.log('LiveKit token alındı:', receivedToken);

      // JWT decode and grant check (debug)
      try {
        const [, payloadB64] = receivedToken.split('.') || [];
        if (payloadB64) {
          const json = JSON.parse(base64Atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
          console.log('TOKEN PAYLOAD =>', json);
          const canPub = json?.video?.canPublish === true;
          setCanPublishGrant(canPub);
          if (shouldPublish && !canPub) {
            console.warn('⚠️ Bu token yayın yetkisi taşımıyor; audio/video publish kapatılacak.');
          }
        } else {
          setCanPublishGrant(null);
        }
      } catch (e) {
        console.warn('JWT decode başarısız:', e?.message);
        setCanPublishGrant(null);
      }

      tokenRef.current = receivedToken;
      setToken(receivedToken);
    } catch (error) {
      console.error('LiveKit token alınamadı:', error);
      setError('Token alınamadı: ' + error.message);
      onError?.(error);
    } finally {
      isFetchingTokenRef.current = false;
    }
  };

  // LiveKitRoom içeriği
  const RoomContent = () => {
    const participants = useParticipants();
    const { localParticipant } = useLocalParticipant();
    const enableAttemptedRef = useRef(false);

    const getVideoPublications = (p) => {
      if (!p) return [];
      // RN SDK bazı sürümlerde videoTrackPublications yerine trackPublications map'i sağlar
      const videoPubsFromArray = Array.isArray(p.videoTrackPublications)
        ? p.videoTrackPublications
        : [];
      const mapValues = p.trackPublications && typeof p.trackPublications.values === 'function'
        ? Array.from(p.trackPublications.values())
        : [];
      const combined = [...videoPubsFromArray, ...mapValues];
      return combined.filter((pub) => pub && (pub.videoTrack || (pub.track && pub.track.kind === 'video')));
    };

    // Admin publish: mic/cam auto-enable ve publish garantisi
    useEffect(() => {
      let cancelled = false;
      const ensurePublishing = async () => {
        try {
          if (!shouldPublish || !localParticipant) return;
          if (enableAttemptedRef.current) return;
          enableAttemptedRef.current = true;

          console.log('🎛️ Mic/Camera publish başlatılıyor...');
          // Mikrofon ve kamera yayınını aç (varsayılan arka kamera)
          await localParticipant.setMicrophoneEnabled(true);
          try {
            // LiveKit VideoCaptureOptions ile facingMode: 'environment' (arka)
            await localParticipant.setCameraEnabled(true, { facingMode: 'environment' });
          } catch (optErr) {
            console.log('⚠️ facingMode desteklenmiyor olabilir, cameraFacing=back ile deniyorum...', optErr?.message || optErr);
            try {
              await localParticipant.setCameraEnabled(true, { cameraFacing: 'back' });
            } catch (optErr2) {
              console.log('⚠️ cameraFacing da desteklenmedi, generic enable fallback', optErr2?.message || optErr2);
              await localParticipant.setCameraEnabled(false);
              await localParticipant.setCameraEnabled(true);
            }
          }
          if (cancelled) return;
          console.log('✅ Mic/Camera enabled & publish denendi');

          // 2 saniye sonra track yoksa bir kez daha tetikle
          setTimeout(async () => {
            try {
              if (cancelled) return;
              const pubs = getVideoPublications(localParticipant);
              const hasVideo = pubs && pubs.length > 0;
              if (!hasVideo) {
                console.log('♻️ Video track görünmüyor, yeniden deniyorum...');
                await localParticipant.setCameraEnabled(false);
                try {
                  await localParticipant.setCameraEnabled(true, { facingMode: 'environment' });
                } catch (optErr2) {
                  try {
                    await localParticipant.setCameraEnabled(true, { cameraFacing: 'back' });
                  } catch (optErr3) {
                    await localParticipant.setCameraEnabled(true);
                  }
                }
                console.log('✅ Kamera yeniden etkinleştirildi');
              }
            } catch (retryErr) {
              console.warn('⚠️ Publish retry hatası:', retryErr?.message || retryErr);
            }
          }, 2000);
        } catch (e) {
          console.warn('⚠️ Mic/Camera enable hatası:', e?.message || e);
          enableAttemptedRef.current = false; // Sonraki renderda tekrar denesin
        }
      };
      ensurePublishing();
      return () => { cancelled = true; };
    }, [localParticipant, shouldPublish]);

    return (
      <View style={styles.container}>
        {/* Remote participants */}
        {participants.flatMap((participant) => {
          const pubs = getVideoPublications(participant);
          return pubs.map((pub) => {
            const videoTrack = pub.videoTrack || (pub.track && pub.track.kind === 'video' ? pub.track : undefined);
            if (!videoTrack) return null;
            return (
              <View key={`${participant.identity}-${pub.trackSid || pub.sid || Math.random()}`} style={styles.participantContainer}>
                <VideoView style={styles.videoView} videoTrack={videoTrack} />
                <Text style={styles.participantName}>{participant.identity}</Text>
              </View>
            );
          });
        })}
        
        {/* Local participant (only show in publish mode) */}
        {shouldPublish && (() => {
          const pubs = getVideoPublications(localParticipant);
          const first = pubs[0];
          const videoTrack = first && (first.videoTrack || (first.track && first.track.kind === 'video' ? first.track : undefined));
          if (!videoTrack) return null;
          return (
            <View style={styles.localParticipantContainer}>
              <VideoView style={styles.localVideoView} videoTrack={videoTrack} />
              <Text style={styles.localParticipantName}>Sen</Text>
            </View>
          );
        })()}
        
        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={onLeave}>
            <Text style={styles.controlButtonText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
        {shouldPublish && canPublishGrant === false && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Bu token yayın yetkisi taşımıyor (viewer). Yayın kapatıldı.</Text>
          </View>
        )}
      </View>
    );
  };

  // Ana render
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchToken}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!token) {
  return (
    <View style={styles.container}>
        <Text style={styles.loadingText}>Token alınıyor...</Text>
      </View>
    );
  }

  const enablePublish = shouldPublish && canPublishGrant === true; // sadece açıkça izin varsa yayınla

  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_CONFIG.url}
      token={token}
      connect={true}
      audio={enablePublish}
      video={enablePublish}
      onConnected={() => {
        console.log('✅ LiveKit room\'a bağlandı');
        onJoin?.();
      }}
      onDisconnected={() => {
        console.log('❌ LiveKit room\'dan ayrıldı');
        onLeave?.();
      }}
      onError={(error) => {
        console.error('LiveKit error:', error);
        setError('LiveKit hatası: ' + error.message);
        onError?.(error);
      }}
    >
      <RoomContent />
    </LiveKitRoom>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  participantContainer: {
    flex: 1,
    margin: 5,
  },
  videoView: {
    flex: 1,
    backgroundColor: '#333',
  },
  participantName: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
  localParticipantContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
  },
  localVideoView: {
    flex: 1,
  },
  localParticipantName: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 2,
    borderRadius: 3,
    fontSize: 12,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  banner: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    padding: 10,
    borderRadius: 8,
  },
  bannerText: {
    color: '#111827',
    textAlign: 'center',
    fontWeight: '600',
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 25,
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  retryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    margin: 20,
  },
  expoGoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  expoGoTitle: {
    color: '#fbbf24',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  expoGoText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorSubText: {
    color: '#999',
    textAlign: 'center',
    margin: 10,
    fontSize: 14,
  },
});

export default LiveKitPlayer;
