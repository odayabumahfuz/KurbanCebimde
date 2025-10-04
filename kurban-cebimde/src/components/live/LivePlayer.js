import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AGORA_APP_ID } from '../../lib/agoraConfig';

// Conditional import to avoid web build issues
let AgoraRtcEngine, AgoraRtcTextureView;
if (Platform.OS !== 'web') {
  try {
    const agoraSDK = require('react-native-agora');
    AgoraRtcEngine = agoraSDK.default;
    AgoraRtcTextureView = agoraSDK.AgoraRtcTextureView;
  } catch (error) {
    console.log('Agora SDK not available:', error.message);
  }
}

// Gerçek Agora SDK ile yayın
export default function LivePlayer({ channel, token, role = 'audience' }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [audioPermission, setAudioPermission] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const cameraRef = useRef(null);
  const agoraEngineRef = useRef(null);

  const isPublisher = role === 'publisher';

  useEffect(() => {
    initializePermissions();
    initializeAgora();
    
    // Simüle edilmiş izleyici sayısı
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 2000);
    
    return () => {
      clearInterval(interval);
      cleanupAgora();
    };
  }, []);

  const initializePermissions = async () => {
    try {
      // Kamera izni kontrol et
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }

      // Ses izni için basit çözüm - varsayılan olarak true
      setAudioPermission(true);
    } catch (error) {
      console.error('İzin hatası:', error);
    }
  };

  const initializeAgora = async () => {
    try {
      // Agora SDK'yı başlat
      const AgoraRtcEngine = require('react-native-agora').default;
      
      const engine = await AgoraRtcEngine.create(AGORA_APP_ID);
      agoraEngineRef.current = engine;

      // Event handler'ları ayarla
      engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
        console.log('✅ Kanala basariyla katildi:', channel);
        setIsJoined(true);
      });

      engine.addListener('UserJoined', (uid, elapsed) => {
        console.log('👤 Kullanici katildi:', uid);
        setViewerCount(prev => prev + 1);
      });

      engine.addListener('UserOffline', (uid, reason) => {
        console.log('👤 Kullanici ayrildi:', uid);
        setViewerCount(prev => Math.max(0, prev - 1));
      });

      engine.addListener('Error', (err, msg) => {
        console.error('❌ Agora hatasi:', err, msg);
        Alert.alert('Hata', `Agora hatasi: ${msg}`);
      });

      // Video görünümünü etkinleştir
      await engine.enableVideo();
      await engine.startPreview();

      // Kanal profili ayarla
      await engine.setChannelProfile(1); // 1 = Live Broadcasting

      // Rol ayarla
      const clientRole = isPublisher ? 1 : 2; // 1 = Broadcaster, 2 = Audience
      await engine.setClientRole(clientRole);

      // Kanal'a katıl
      await engine.joinChannel(token, channel, 0, {
        clientRoleType: clientRole,
        channelProfile: 1,
      });

    } catch (error) {
      console.error('❌ Agora baslatma hatasi:', error);
      Alert.alert('Hata', 'Agora baslatilamadi: ' + error.message);
    }
  };

  const cleanupAgora = async () => {
    if (agoraEngineRef.current) {
      try {
        await agoraEngineRef.current.leaveChannel();
        await agoraEngineRef.current.release();
        agoraEngineRef.current = null;
      } catch (error) {
        console.error('❌ Agora temizlik hatasi:', error);
      }
    }
  };

  const toggleStreaming = async () => {
    if (!cameraPermission?.granted) {
      Alert.alert('İzin Gerekli', 'Kamera izni gerekli');
      return;
    }

    if (!audioPermission) {
      Alert.alert('İzin Gerekli', 'Mikrofon izni gerekli');
      return;
    }

    if (!agoraEngineRef.current) {
      Alert.alert('Hata', 'Agora engine hazır değil');
      return;
    }

    try {
      if (isStreaming) {
        // Yayını durdur
        await agoraEngineRef.current.stopPreview();
        setIsStreaming(false);
        setIsCameraOn(false);
      } else {
        // Yayını başlat
        await agoraEngineRef.current.startPreview();
        setIsStreaming(true);
        setIsCameraOn(true);
      }
    } catch (error) {
      console.error('❌ Yayin kontrol hatasi:', error);
      Alert.alert('Hata', 'Yayin kontrol edilemedi: ' + error.message);
    }
  };

  const toggleMute = async () => {
    if (!audioPermission) {
      Alert.alert('İzin Gerekli', 'Mikrofon izni gerekli');
      return;
    }

    if (!agoraEngineRef.current) {
      Alert.alert('Hata', 'Agora engine hazır değil');
      return;
    }

    try {
      await agoraEngineRef.current.muteLocalAudioStream(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('❌ Ses kontrol hatasi:', error);
    }
  };

  const toggleCamera = async () => {
    if (!agoraEngineRef.current) {
      Alert.alert('Hata', 'Agora engine hazır değil');
      return;
    }

    try {
      await agoraEngineRef.current.muteLocalVideoStream(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    } catch (error) {
      console.error('❌ Kamera kontrol hatasi:', error);
    }
  };

  const leaveChannel = async () => {
    try {
      if (agoraEngineRef.current) {
        await agoraEngineRef.current.leaveChannel();
      }
      setIsStreaming(false);
      setIsCameraOn(false);
      setIsJoined(false);
      Alert.alert('Bilgi', 'Kanal\'dan ayrıldınız');
    } catch (error) {
      console.error('❌ Kanal ayrilma hatasi:', error);
    }
  };

  // İzinler yükleniyor
  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>İzinler kontrol ediliyor...</Text>
        </View>
      </View>
    );
  }

  // Kamera izni yok
  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={60} color="#666" />
          <Text style={styles.permissionText}>Kamera izni gerekli</Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestCameraPermission}
          >
            <Text style={styles.permissionButtonText}>İzin Ver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video görünümü */}
      <View style={styles.videoContainer}>
        {isPublisher ? (
          <View style={styles.publisherView}>
            {isCameraOn ? (
              <View style={styles.cameraContainer}>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                  mode="video"
                />
                <View style={styles.cameraOverlay}>
                  <View style={styles.cameraInfo}>
                    <Text style={styles.channelText}>Kanal: {channel}</Text>
                    <Text style={styles.roleText}>Rol: Yayıncı</Text>
                    <View style={styles.statusIndicator}>
                      <View style={[styles.statusDot, { backgroundColor: isStreaming ? '#10b981' : '#ef4444' }]} />
                      <Text style={styles.statusText}>
                        {isStreaming ? 'Canlı Yayın' : 'Hazır'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Ionicons name="videocam-off" size={60} color="#ef4444" />
                <Text style={styles.placeholderText}>Kamera Kapalı</Text>
                <Text style={styles.channelText}>Kanal: {channel}</Text>
                <Text style={styles.roleText}>Rol: Yayıncı</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.audienceView}>
            <Ionicons name="play-circle" size={60} color="#666" />
            <Text style={styles.placeholderText}>Yayın İzleniyor</Text>
            <Text style={styles.channelText}>Kanal: {channel}</Text>
            <Text style={styles.roleText}>Rol: İzleyici</Text>
          </View>
        )}
      </View>

      {/* Kontroller */}
      <View style={styles.controls}>
        {isPublisher ? (
          <View style={styles.publisherControls}>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: isStreaming ? '#ef4444' : '#10b981' }]}
              onPress={toggleStreaming}
            >
              <Ionicons 
                name={isStreaming ? "stop" : "play"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.controlText}>
                {isStreaming ? 'Yayını Durdur' : 'Yayını Başlat'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: isMuted ? '#ef4444' : '#6b7280' }]}
              onPress={toggleMute}
            >
              <Ionicons 
                name={isMuted ? "mic-off" : "mic"} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: isCameraOn ? '#10b981' : '#ef4444' }]}
              onPress={toggleCamera}
            >
              <Ionicons 
                name={isCameraOn ? "videocam" : "videocam-off"} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.audienceControls}>
            <View style={styles.viewerInfo}>
              <Ionicons name="people" size={20} color="#666" />
              <Text style={styles.viewerCount}>{Math.max(0, viewerCount)} izleyici</Text>
            </View>
          </View>
        )}
        </View>

      {/* Çıkış butonu */}
      <TouchableOpacity 
        style={[styles.controlButton, { backgroundColor: '#ef4444', marginTop: 10 }]}
        onPress={leaveChannel}
      >
        <Ionicons name="exit" size={20} color="white" />
        <Text style={styles.controlText}>Çıkış</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  publisherView: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 20,
  },
  cameraInfo: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  audienceView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
    fontWeight: '600',
  },
  channelText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  roleText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  publisherControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  audienceControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  controlText: {
    color: 'white',
    fontWeight: '600',
  },
  viewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewerCount: {
    color: '#666',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});