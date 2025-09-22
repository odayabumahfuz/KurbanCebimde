import React, { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Track } from 'livekit-client';

interface StreamViewerProps {
  streamId: string;
  roomName: string;
  token: string;
}

const StreamViewer: React.FC<StreamViewerProps> = ({ streamId, roomName, token }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const connectToRoom = async () => {
      if (!isMounted) return;
      
      try {
        console.log('🎥 StreamViewer başlatılıyor...');
        console.log('🔑 Token:', token?.substring(0, 20) + '...');
        console.log('🏠 Room Name:', roomName);
        
        if (!token || !roomName) {
          setError('Token veya room name eksik');
          return;
        }

        // Eski bağlantıyı temizle
        if (roomRef.current) {
          roomRef.current.disconnect();
          roomRef.current = null;
        }

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        roomRef.current = room;

        // Room event'leri
        room.on(RoomEvent.Connected, () => {
          if (!isMounted) return;
          console.log('✅ LiveKit room\'a bağlandı');
          setIsConnected(true);
          setError(null);
          
          // Mevcut yayınları kontrol et
          attachExistingTracks();
        });

        room.on(RoomEvent.Disconnected, () => {
          if (!isMounted) return;
          console.log('❌ LiveKit room\'dan bağlantı kesildi');
          setIsConnected(false);
        });

        room.on(RoomEvent.ParticipantConnected, (participant) => {
          if (!isMounted) return;
          console.log('👤 Katılımcı katıldı:', participant.identity);
          console.log('📊 Katılımcı track\'leri:', [...participant.tracks.values()].map(tp => ({
            kind: tp.kind,
            subscribed: tp.isSubscribed,
            hasTrack: !!tp.track
          })));
        });

        room.on(RoomEvent.TrackPublished, (publication, participant) => {
          if (!isMounted) return;
          console.log('📹 Track yayınlandı:', publication.kind, 'by', participant.identity);
        });

        // Video track geldiğinde - KRİTİK!
        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (!isMounted) return;
          console.log('📺 Track abone olundu:', track.kind, 'from', participant.identity);
          if (track.kind === Track.Kind.Video && videoRef.current) {
            console.log('🎬 Video track video element\'e bağlanıyor...');
            track.attach(videoRef.current);
            console.log('✅ Video track bağlandı!');
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (!isMounted) return;
          console.log('📺 Track abonelik iptal edildi:', track.kind, 'from', participant.identity);
          track.detach();
        });

        room.on(RoomEvent.TrackMuted, (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (!isMounted) return;
          console.log('🔇 Track susturuldu:', publication.trackName, 'by', participant.identity);
          if (publication.kind === Track.Kind.Video && videoRef.current) {
            videoRef.current.style.opacity = '0.2';
          }
        });

        room.on(RoomEvent.TrackUnmuted, (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (!isMounted) return;
          console.log('🔊 Track sesi açıldı:', publication.trackName, 'by', participant.identity);
          if (publication.kind === Track.Kind.Video && videoRef.current) {
            videoRef.current.style.opacity = '1';
          }
        });

        // Mevcut track'leri attach et
        const attachExistingTracks = () => {
          if (!isMounted || !roomRef.current) return;
          console.log('🔍 Mevcut track\'ler kontrol ediliyor...');
          
          roomRef.current.remoteParticipants.forEach(participant => {
            console.log('👤 Katılımcı:', participant.identity);
            participant.tracks.forEach(publication => {
              console.log('📺 Track:', publication.kind, 'subscribed:', publication.isSubscribed, 'hasTrack:', !!publication.track);
              
              if (publication.isSubscribed && publication.track && publication.kind === Track.Kind.Video && videoRef.current) {
                console.log('🎬 Mevcut video track attach ediliyor...');
                publication.track.attach(videoRef.current);
                console.log('✅ Mevcut video track bağlandı!');
              } else if (!publication.isSubscribed) {
                console.log('📡 Track abone olunuyor...');
                publication.setSubscribed(true);
              }
            });
          });
        };

        // Room'a bağlan
        console.log('🔌 LiveKit\'e bağlanılıyor...');
        await room.connect('wss://kurban-cebimde-q2l64d9v.livekit.cloud', token, { autoSubscribe: true });
        console.log('✅ Yayın izleme bağlantısı kuruldu');
      } catch (error) {
        if (!isMounted) return;
        console.error('❌ Yayın izleme hatası:', error);
        setError(error instanceof Error ? error.message : 'Bağlantı hatası');
      }
    };

    connectToRoom();

    return () => {
      isMounted = false;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, []); // Sadece bir kez çalıştır

  if (error) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-2">Bağlantı Hatası</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const handleUserGesture = () => {
    // User gesture ile bağlantıyı yeniden başlat
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsConnected(false);
    setError(null);
    
    // Bağlantıyı yeniden başlat
    setTimeout(() => {
      const connectToRoom = async () => {
        try {
          console.log('🎥 StreamViewer yeniden başlatılıyor...');
          console.log('🔑 Token:', token?.substring(0, 20) + '...');
          console.log('🏠 Room Name:', roomName);
          
          if (!token || !roomName) {
            setError('Token veya room name eksik');
            return;
          }

          const room = new Room({
            adaptiveStream: true,
            dynacast: true,
          });
          roomRef.current = room;

          // Room event'leri
          room.on(RoomEvent.Connected, () => {
            console.log('✅ LiveKit room\'a bağlandı');
            setIsConnected(true);
            setError(null);
            
            // Mevcut yayınları kontrol et
            attachExistingTracks();
          });

          room.on(RoomEvent.Disconnected, () => {
            console.log('❌ LiveKit room\'dan bağlantı kesildi');
            setIsConnected(false);
          });

          room.on(RoomEvent.ParticipantConnected, (participant) => {
            console.log('👤 Katılımcı katıldı:', participant.identity);
            console.log('📊 Katılımcı track\'leri:', [...participant.tracks.values()].map(tp => ({
              kind: tp.kind,
              subscribed: tp.isSubscribed,
              hasTrack: !!tp.track
            })));
          });

          room.on(RoomEvent.TrackPublished, (publication, participant) => {
            console.log('📹 Track yayınlandı:', publication.kind, 'by', participant.identity);
          });

          // Video track geldiğinde - KRİTİK!
          room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
            console.log('📺 Track abone olundu:', track.kind, 'from', participant.identity);
            if (track.kind === Track.Kind.Video && videoRef.current) {
              console.log('🎬 Video track video element\'e bağlanıyor...');
              track.attach(videoRef.current);
              console.log('✅ Video track bağlandı!');
            }
          });

          room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
            console.log('📺 Track abonelik iptal edildi:', track.kind, 'from', participant.identity);
            track.detach();
          });

          room.on(RoomEvent.TrackMuted, (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
            console.log('🔇 Track susturuldu:', publication.trackName, 'by', participant.identity);
            if (publication.kind === Track.Kind.Video && videoRef.current) {
              videoRef.current.style.opacity = '0.2';
            }
          });

          room.on(RoomEvent.TrackUnmuted, (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
            console.log('🔊 Track sesi açıldı:', publication.trackName, 'by', participant.identity);
            if (publication.kind === Track.Kind.Video && videoRef.current) {
              videoRef.current.style.opacity = '1';
            }
          });

          // Mevcut track'leri attach et
          const attachExistingTracks = () => {
            if (!roomRef.current) return;
            console.log('🔍 Mevcut track\'ler kontrol ediliyor...');
            
            roomRef.current.remoteParticipants.forEach(participant => {
              console.log('👤 Katılımcı:', participant.identity);
              participant.tracks.forEach(publication => {
                console.log('📺 Track:', publication.kind, 'subscribed:', publication.isSubscribed, 'hasTrack:', !!publication.track);
                
                if (publication.isSubscribed && publication.track && publication.kind === Track.Kind.Video && videoRef.current) {
                  console.log('🎬 Mevcut video track attach ediliyor...');
                  publication.track.attach(videoRef.current);
                  console.log('✅ Mevcut video track bağlandı!');
                } else if (!publication.isSubscribed) {
                  console.log('📡 Track abone olunuyor...');
                  publication.setSubscribed(true);
                }
              });
            });
            
            // Simülasyon modu için fake video oluştur
            if (roomRef.current.remoteParticipants.size === 0 && videoRef.current) {
              console.log('🎬 Simülasyon modu: Fake video oluşturuluyor...');
              // Fake video element oluştur
              const canvas = document.createElement('canvas');
              canvas.width = 640;
              canvas.height = 480;
              const ctx = canvas.getContext('2d');
              
              // Gradient background
              const gradient = ctx.createLinearGradient(0, 0, 640, 480);
              gradient.addColorStop(0, '#1e3a8a');
              gradient.addColorStop(1, '#3b82f6');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, 640, 480);
              
              // Text
              ctx.fillStyle = 'white';
              ctx.font = '24px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('KURBAN YAYINI', 320, 200);
              ctx.fillText('Simülasyon Modu', 320, 240);
              ctx.fillText('Development Build Gerekli', 320, 280);
              
              // Canvas'ı video element'e dönüştür
              const stream = canvas.captureStream(30);
              videoRef.current.srcObject = stream;
              videoRef.current.play();
              console.log('✅ Fake video oluşturuldu!');
            }
          };

          // Room'a bağlan
          console.log('🔌 LiveKit\'e bağlanılıyor...');
          await room.connect('wss://kurban-cebimde-q2l64d9v.livekit.cloud', token, { autoSubscribe: true });
          console.log('✅ Yayın izleme bağlantısı kuruldu');
        } catch (error) {
          console.error('❌ Yayın izleme hatası:', error);
          setError(error instanceof Error ? error.message : 'Bağlantı hatası');
        }
      };

      connectToRoom();
    }, 100);
  };

  const handleUnmute = async () => {
    try {
      if (roomRef.current) {
        await roomRef.current.startAudio();
        console.log('🔊 Ses açıldı');
      }
    } catch (error) {
      console.error('❌ Ses açma hatası:', error);
    }
  };

        return (
          <div className="w-full h-screen bg-black flex items-center justify-center">
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  minWidth: '320px', 
                  minHeight: '240px',
                  backgroundColor: '#000'
                }}
              />
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
                CANLI
              </div>
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                Yayın ID: {streamId}
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button 
                  onClick={handleUnmute}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  🔊 Sesi Aç
                </button>
                <button 
                  onClick={handleUserGesture}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  🔄 Yenile
                </button>
              </div>
              {!isConnected && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Bağlanıyor...</p>
                    <button 
                      onClick={handleUserGesture}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Bağlantıyı Yenile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
};

export default StreamViewer;
