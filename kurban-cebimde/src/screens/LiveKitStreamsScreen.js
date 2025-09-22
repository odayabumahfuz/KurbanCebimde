import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { livekitAPI } from '../lib/api';

export default function LiveKitStreamsScreen({ navigation }) {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      setLoading(true);
      const response = await livekitAPI.get('/streams');
      setStreams(response.data.streams || []);
    } catch (error) {
      console.error('LiveKit streams load error:', error);
      Alert.alert('Hata', 'Yayınlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStreams();
    setRefreshing(false);
  };

  const endStream = async (roomName) => {
    try {
      await livekitAPI.post(`/streams/${roomName}/end`);
      Alert.alert('Başarılı', 'Yayın sonlandırıldı');
      loadStreams();
    } catch (error) {
      console.error('End stream error:', error);
      Alert.alert('Hata', 'Yayın sonlandırılamadı');
    }
  };

  const joinStream = (roomName) => {
    // LiveKit yayınına katıl
    navigation.navigate('LiveKitStream', {
      roomName,
      participantName: 'Admin',
      participantIdentity: `admin_${Date.now()}`,
      isAdmin: true
    });
  };

  const renderStream = ({ item }) => (
    <View style={styles.streamCard}>
      <View style={styles.streamHeader}>
        <Text style={styles.streamTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusText}>
            {item.status === 'active' ? 'Aktif' : 'Pasif'}
          </Text>
        </View>
      </View>
      
      <View style={styles.streamInfo}>
        <Text style={styles.streamInfoText}>Oda: {item.room_name}</Text>
        <Text style={styles.streamInfoText}>Yayıncı: {item.host_name}</Text>
        <Text style={styles.streamInfoText}>Katılımcı: {item.participant_count}</Text>
        <Text style={styles.streamInfoText}>Başlangıç: {new Date(item.started_at).toLocaleString('tr-TR')}</Text>
      </View>
      
      <View style={styles.streamActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.joinButton]}
          onPress={() => joinStream(item.room_name)}
        >
          <Ionicons name="videocam" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Katıl</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.endButton]}
          onPress={() => endStream(item.room_name)}
        >
          <Ionicons name="stop" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Sonlandır</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yayınlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LiveKit Yayınları</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{streams.length}</Text>
          <Text style={styles.statLabel}>Toplam Yayın</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {streams.filter(s => s.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Aktif Yayın</Text>
        </View>
      </View>
      
      <FlatList
        data={streams}
        renderItem={renderStream}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-off" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Aktif yayın bulunamadı</Text>
          </View>
        }
      />
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
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  refreshButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  streamCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#10b981',
  },
  inactiveBadge: {
    backgroundColor: '#6b7280',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  streamInfo: {
    marginBottom: 16,
  },
  streamInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  streamActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  joinButton: {
    backgroundColor: colors.primary,
  },
  endButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});
