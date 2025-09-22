import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import LiveKitPlayer from '../components/live/LiveKitPlayer';

export default function LiveKitStreamScreen({ route, navigation }) {
  const { roomName, participantName, participantIdentity, streamId } = route.params;

  useEffect(() => {
    // Screen'e geldiğinde başlığı güncelle
    navigation.setOptions({
      title: `LiveKit Yayını - ${roomName}`,
      headerShown: true,
    });
  }, [roomName, navigation]);

  const handleJoin = () => {
    console.log('LiveKit room\'a katıldı:', roomName);
  };

  const handleLeave = () => {
    console.log('LiveKit room\'dan ayrıldı:', roomName);
    navigation.goBack();
  };

  const handleError = (error) => {
    console.error('LiveKit error:', error);
    Alert.alert(
      'LiveKit Hatası',
      'Yayın bağlantısında sorun oluştu. Tekrar denemek ister misiniz?',
      [
        { text: 'Geri Dön', onPress: () => navigation.goBack() },
        { text: 'Tekrar Dene', onPress: () => {/* Retry logic */} }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LiveKitPlayer
        roomName={roomName}
        participantName={participantName}
        participantIdentity={participantIdentity}
        streamId={streamId}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onError={handleError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
