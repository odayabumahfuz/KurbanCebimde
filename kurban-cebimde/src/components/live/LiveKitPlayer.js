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
import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import { LIVEKIT_CONFIG } from '../../lib/livekitConfig';
import { livekitAPI } from '../../lib/api';

// API Base URL
const API_BASE_URL = 'http://185.149.103.247:8000/api';

const { width, height } = Dimensions.get('window');

const LiveKitPlayer = ({ 
  roomName, 
  participantName, 
  participantIdentity,
  streamId,
  onJoin,
  onLeave,
  onError 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [localParticipant, setLocalParticipant] = useState(null);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [recording, setRecording] = useState(null);
  
  const roomRef = useRef(null);

  useEffect(() => {
    requestPermissions();
    initializeLiveKit();
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

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
      
      // Mikrofon izni
      console.log('Mikrofon izni isteniyor...');
      const audioStatus = await Audio.requestPermissionsAsync();
      console.log('Mikrofon izni sonucu:', audioStatus);
      setMicrophonePermission(audioStatus.status === 'granted');
      
      if (audioStatus.status !== 'granted') {
        Alert.alert(
          'Mikrofon İzni Gerekli', 
          'Canlı yayın için mikrofon erişimi gereklidir. Ayarlardan izin verebilirsiniz.',
          [
            { text: 'Tamam', style: 'default' }
          ]
        );
      }
      
      console.log('İzin durumu:', {
        kamera: cameraPermission?.granted,
        mikrofon: audioStatus.status === 'granted'
      });
      
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Hata', 'İzin isteği başarısız: ' + error.message);
    }
  };

  const initializeLiveKit = async () => {
    try {
      // Get LiveKit token from backend
      const response = await livekitAPI.post(`/streams/${streamId}/token`);

      setToken(response.data.token);
      
      // Initialize LiveKit room
      await connectToRoom(response.data.token);
      
    } catch (error) {
      console.error('LiveKit initialization error:', error);
      setError('LiveKit bağlantısı kurulamadı');
      onError?.(error);
    }
  };

  const connectToRoom = async (accessToken) => {
    try {
      console.log('LiveKit token alındı:', accessToken);
      console.log('LiveKit URL:', LIVEKIT_CONFIG.url);
      console.log('Room Name:', roomName);
      
      // Platform kontrolü
      const isWeb = Platform.OS === 'web';
      const isExpoGo = !isWeb && Constants?.appOwnership === 'expo';
      
      if (isWeb) {
        // Web versiyonu - Gerçek LiveKit bağlantısı
        console.log('🌐 Web versiyonu - Gerçek LiveKit bağlantısı...');
        
        // Web için LiveKit import
        const { Room, RoomEvent, LocalParticipant, RemoteParticipant, registerGlobals } = await import('livekit-client');
        
        // WebRTC globals'ı register et
        try {
          if (registerGlobals) {
            registerGlobals();
            console.log('✅ WebRTC globals register edildi');
          }
        } catch (regError) {
          console.log('⚠️ WebRTC globals register edilemedi:', regError);
        }
        
        
        // Web'de medya izinleri kontrolü
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log('✅ Web: getUserMedia destekleniyor');
            
            // HTTPS kontrolü - sadece uyarı ver, durma
            if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
              console.log('⚠️ Web: HTTPS gerekli, medya izinleri sınırlı olabilir');
              // Uyarı ver ama devam et
            }
            
          } else {
            console.log('❌ Web: getUserMedia desteklenmiyor');
            throw new Error('getUserMedia desteklenmiyor');
          }
        } catch (mediaError) {
          console.error('❌ Web: Medya izinleri hatası:', mediaError);
          
          // Medya izinleri olmasa bile room'a bağlan
          console.log('🔄 Web: Medya izinleri olmadan room\'a bağlanılıyor...');
          
          // Room objesini oluştur
          const room = new Room({
            adaptiveStream: true,
            dynacast: true,
          });
          
          room.on(RoomEvent.Connected, () => {
            console.log('✅ Web: LiveKit room\'a bağlandı (dinleyici)');
            setIsConnected(true);
            setLocalParticipant(room.localParticipant);
            onJoin?.();
          });
          
          room.on(RoomEvent.ParticipantConnected, (participant) => {
            console.log('👥 Web: Katılımcı bağlandı:', participant.identity);
            setRemoteParticipants(prev => [...prev, participant]);
          });
          
          room.on(RoomEvent.ParticipantDisconnected, (participant) => {
            console.log('👥 Web: Katılımcı ayrıldı:', participant.identity);
            setRemoteParticipants(prev => prev.filter(p => p.identity !== participant.identity));
          });
          
          await room.connect(LIVEKIT_CONFIG.url, accessToken);
          roomRef.current = room;
          
          // Sadece dinleyici olarak katıl
          console.log('👂 Web: Dinleyici olarak katıldı');
          return;
        }
        
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        
        room.on(RoomEvent.Connected, () => {
          console.log('✅ Web: LiveKit room\'a bağlandı');
          setIsConnected(true);
          setLocalParticipant(room.localParticipant);
          onJoin?.();
        });
        
        room.on(RoomEvent.ParticipantConnected, (participant) => {
          console.log('👥 Web: Katılımcı bağlandı:', participant.identity);
          setRemoteParticipants(prev => [...prev, participant]);
        });
        
        room.on(RoomEvent.ParticipantDisconnected, (participant) => {
          console.log('👥 Web: Katılımcı ayrıldı:', participant.identity);
          setRemoteParticipants(prev => prev.filter(p => p.identity !== participant.identity));
        });
        
        // Web kamera ve mikrofon izinleri
        try {
          console.log('🎥 Web: Kamera ve mikrofon izinleri isteniyor...');
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          
          console.log('✅ Web: Medya izinleri alındı');
          
          // Room'a bağlan
          await room.connect(LIVEKIT_CONFIG.url, accessToken);
          roomRef.current = room;
          
          // Track'leri publish et
          await room.localParticipant.setMicrophoneEnabled(true);
          await room.localParticipant.setCameraEnabled(true);
          
          console.log('📹 Web: Kamera ve mikrofon track\'leri publish edildi');
          
        } catch (mediaError) {
          console.error('❌ Web: Medya izinleri hatası:', mediaError);
          
          // Medya izinleri olmasa bile room'a bağlan
          console.log('🔄 Web: Medya izinleri olmadan room\'a bağlanılıyor...');
          await room.connect(LIVEKIT_CONFIG.url, accessToken);
          roomRef.current = room;
          
          // Sadece dinleyici olarak katıl
          console.log('👂 Web: Dinleyici olarak katıldı');
        }
        
      } else if (isExpoGo) {
        // Expo Go: WebRTC native modüller desteklenmez. Development build gerekli.
        console.log('⛔ Expo Go tespit edildi: Development build olmadan WebRTC çalışmaz');
        setError('Expo Go üzerinde WebRTC desteklenmiyor. Lütfen development build kullanın.');
        return;
      } else {
        // Development Build - Gerçek LiveKit bağlantısı
        console.log('📱 Development Build - Gerçek LiveKit bağlantısı...');
        const { Room, RoomEvent, LocalParticipant, RemoteParticipant } = await import('livekit-client');
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        
        room.on(RoomEvent.Connected, () => {
          console.log('✅ Dev Build: LiveKit room\'a bağlandı');
          setIsConnected(true);
          setLocalParticipant(room.localParticipant);
          onJoin?.();
        });
        
        room.on(RoomEvent.ParticipantConnected, (participant) => {
          console.log('👥 Dev Build: Katılımcı bağlandı:', participant.identity);
          setRemoteParticipants(prev => [...prev, participant]);
        });
        
        room.on(RoomEvent.ParticipantDisconnected, (participant) => {
          console.log('👥 Dev Build: Katılımcı ayrıldı:', participant.identity);
          setRemoteParticipants(prev => prev.filter(p => p.identity !== participant.identity));
        });
        
        // Room'a bağlan
        await room.connect(LIVEKIT_CONFIG.url, accessToken);
        roomRef.current = room;
      }
      
    } catch (error) {
      console.error('Room connection error:', error);
      setError('Odaya bağlanılamadı: ' + error.message);
      onError?.(error);
    }
  };

  const toggleMute = async () => {
    try {
      if (isMuted) {
        // Mikrofonu aç
        if (!recording && microphonePermission) {
          const { recording: newRecording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
          );
          setRecording(newRecording);
        }
        setIsMuted(false);
        console.log('Mikrofon açıldı');
      } else {
        // Mikrofonu kapat
        if (recording) {
          await recording.stopAndUnloadAsync();
          setRecording(null);
        }
        setIsMuted(true);
        console.log('Mikrofon kapatıldı');
      }
    } catch (error) {
      console.error('Mute toggle error:', error);
      Alert.alert('Hata', 'Ses kontrolü yapılamadı: ' + error.message);
    }
  };

  const toggleCamera = async () => {
    try {
      if (isCameraOn) {
        // Kamerayı kapat
        setIsCameraOn(false);
        console.log('Kamera kapatıldı');
      } else {
        // Kamerayı aç
        setIsCameraOn(true);
        console.log('Kamera açıldı');
      }
    } catch (error) {
      console.error('Camera toggle error:', error);
      Alert.alert('Hata', 'Kamera kontrolü yapılamadı: ' + error.message);
    }
  };

  const leaveRoom = async () => {
    try {
      console.log('Leaving room...');
      setIsConnected(false);
      setLocalParticipant(null);
      setRemoteParticipants([]);
      onLeave?.();
    } catch (error) {
      console.error('Leave room error:', error);
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        
        {/* Web için özel bilgilendirme */}
        {Platform.OS === 'web' && error.includes('HTTPS') && (
          <View style={styles.webInfoContainer}>
            <Text style={styles.webInfoTitle}>🌐 Web Tarayıcısı Bilgisi</Text>
            <Text style={styles.webInfoText}>
              • Medya izinleri için HTTPS gerekli{'\n'}
              • localhost'ta HTTP çalışır{'\n'}
              • Simülasyon modu aktif
            </Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.retryButton} onPress={initializeLiveKit}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video Container */}
      <View style={styles.videoContainer}>
        <Text style={styles.roomInfo}>
          Oda: {roomName} | Katılımcı: {participantName}
        </Text>
        
        {/* Kamera Preview */}
        {cameraPermission?.granted && isCameraOn ? (
          <CameraView
            style={styles.cameraPreview}
            facing="back"
            ref={setCameraRef}
          />
        ) : (
          <View style={styles.noCameraView}>
            <Text style={styles.noCameraText}>
              {!cameraPermission?.granted ? '📷 Kamera İzni Gerekli' : '📷 Kamera Kapalı'}
            </Text>
          </View>
        )}
        
        {isConnected ? (
          <View style={styles.connectedView}>
            <Text style={styles.connectedText}>✅ LiveKit'e Bağlandı</Text>
            <Text style={styles.participantCount}>
              Katılımcı Sayısı: {remoteParticipants.length + (localParticipant ? 1 : 0)}
            </Text>
            {localParticipant && (
              <Text style={styles.localParticipantText}>
                👤 Sen: {localParticipant.name || localParticipant.identity}
              </Text>
            )}
            {/* İzin Durumu */}
        <View style={styles.permissionStatus}>
          <Text style={styles.permissionText}>
            📹 Kamera: {cameraPermission?.granted ? '✅' : '❌'}
          </Text>
          <Text style={styles.permissionText}>
            🎤 Mikrofon: {microphonePermission ? '✅' : '❌'}
          </Text>
        </View>
          </View>
        ) : (
          <View style={styles.connectingView}>
            <Text style={styles.connectingText}>🔄 Bağlanıyor...</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Text style={styles.controlButtonText}>
            {isMuted ? '🔇' : '🎤'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !isCameraOn && styles.controlButtonActive]}
          onPress={toggleCamera}
        >
          <Text style={styles.controlButtonText}>
            {isCameraOn ? '📹' : '📷'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.leaveButton]}
          onPress={leaveRoom}
        >
          <Text style={styles.controlButtonText}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Participants List */}
      <View style={styles.participantsContainer}>
        <Text style={styles.participantsTitle}>Katılımcılar:</Text>
        {localParticipant && (
          <Text style={styles.participantText}>
            👤 {localParticipant.name || localParticipant.identity} (Sen)
          </Text>
        )}
        {remoteParticipants.map((participant, index) => (
          <Text key={participant.identity || index} style={styles.participantText}>
            👥 {participant.name || participant.identity}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  roomInfo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  connectedView: {
    alignItems: 'center',
  },
  connectedText: {
    color: '#4ade80',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  participantCount: {
    color: '#fff',
    fontSize: 14,
  },
  localParticipantText: {
    color: '#4ade80',
    fontSize: 12,
    marginTop: 5,
  },
  cameraPreview: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  noCameraView: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
  },
  noCameraText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  permissionStatus: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  permissionText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
  connectingView: {
    alignItems: 'center',
  },
  connectingText: {
    color: '#fbbf24',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#2a2a2a',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4a4a4a',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  controlButtonActive: {
    backgroundColor: '#ef4444',
  },
  leaveButton: {
    backgroundColor: '#ef4444',
  },
  controlButtonText: {
    fontSize: 24,
  },
  participantsContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    maxHeight: 150,
  },
  participantsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  participantText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  webInfoContainer: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    maxWidth: 400,
  },
  webInfoTitle: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  webInfoText: {
    color: '#93c5fd',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
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

export default LiveKitPlayer;
