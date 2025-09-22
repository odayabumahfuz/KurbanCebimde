import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import LivePlayer from '../components/live/LivePlayer';

// Placeholder UI - Agora RN SDK entegrasyonu burada yapılacak
export default function WatchLiveScreen({ route }) {
  const { channel, role, token } = route.params || {};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Canlı Yayın</Text>
      <Text style={styles.meta}>Kanal: {channel}</Text>
      <Text style={styles.meta}>Rol: {role}</Text>
      <LivePlayer channel={channel} token={token} role={role} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 },
  meta: { color: '#6B7280', marginBottom: 4 },
  videoPlaceholder: { flex: 1, backgroundColor: '#000', borderRadius: 12, marginTop: 12 },
});


