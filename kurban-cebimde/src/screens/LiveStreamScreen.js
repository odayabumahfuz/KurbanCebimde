import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LiveStreamScreen() {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - gerçek API'den gelecek
    const mockStreams = [
      {
        id: 1,
        title: 'Kurban Kesimi - Türkiye Bölgesi',
        status: 'live',
        viewers: 1250,
        duration: '2:15:30',
        location: 'Türkiye',
        animal_count: 15,
        organizer: 'Türkiye Diyanet İşleri',
        target_amount: 5000,
        current_amount: 3200,
        description: 'Türkiye bölgesinde büyükbaş kurban kesimi canlı yayını',
        tags: ['Büyükbaş', 'Türkiye', 'Canlı'],
        quality: '1080p',
        thumbnail: require('../../assets/buyukbas.png')
      },
      {
        id: 2,
        title: 'Afrika Kurban Kesimi',
        status: 'scheduled',
        viewers: 0,
        duration: '00:00:00',
        location: 'Afrika',
        animal_count: 8,
        organizer: 'Afrika Yardım Kuruluşu',
        target_amount: 3000,
        current_amount: 0,
        description: 'Afrika bölgesinde koyun kurban kesimi planlanan yayını',
        tags: ['Koyun', 'Afrika', 'Planlandı'],
        quality: '720p',
        thumbnail: require('../../assets/koyun.png')
      },
      {
        id: 3,
        title: 'Kurban Bağışı Canlı Yayını',
        status: 'ended',
        viewers: 890,
        duration: '1:45:20',
        location: 'Türkiye',
        animal_count: 12,
        organizer: 'Türkiye İnsani Yardım Vakfı',
        target_amount: 4000,
        current_amount: 3800,
        description: 'Türkiye\'de koç kurban kesimi tamamlanan yayını',
        tags: ['Koç', 'Türkiye', 'Tamamlandı'],
        quality: '1080p',
        thumbnail: require('../../assets/koc.png')
      }
    ];
    
    setStreams(mockStreams);
    setLoading(false);
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      live: { label: 'CANLI', color: '#ef4444', bgColor: '#fee2e2' },
      scheduled: { label: 'PLANLANDI', color: '#f59e0b', bgColor: '#fef3c2' },
      ended: { label: 'BİTTİ', color: '#6b7280', bgColor: '#f3f4f6' }
    };
    return configs[status] || configs.scheduled;
  };

  const openStream = (stream) => {
    if (stream.status === 'live') {
      setSelectedStream(stream);
    } else if (stream.status === 'scheduled') {
      alert(`${stream.title} yayını henüz başlamadı. Lütfen bekleyin.`);
    } else {
      alert(`${stream.title} yayını tamamlandı.`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yayınlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Canlı Yayınlar</Text>
        <Text style={styles.headerSubtitle}>Kurban kesimi canlı yayınlarını izleyin</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{streams.filter(s => s.status === 'live').length}</Text>
          <Text style={styles.statLabel}>Canlı Yayın</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{streams.filter(s => s.status === 'scheduled').length}</Text>
          <Text style={styles.statLabel}>Planlandı</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{streams.filter(s => s.status === 'ended').length}</Text>
          <Text style={styles.statLabel}>Tamamlandı</Text>
        </View>
      </View>

      {/* Streams List */}
      <ScrollView style={styles.streamsContainer} showsVerticalScrollIndicator={false}>
        {streams.map((stream) => {
          const statusConfig = getStatusConfig(stream.status);
          
          return (
            <TouchableOpacity
              key={stream.id}
              style={styles.streamCard}
              onPress={() => openStream(stream)}
            >
              {/* Thumbnail */}
              <View style={styles.thumbnailContainer}>
                <Image source={stream.thumbnail} style={styles.thumbnail} resizeMode="cover" />
                
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>

                {/* Live Indicator */}
                {stream.status === 'live' && (
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>CANLI</Text>
                  </View>
                )}

                {/* Play Button */}
                <View style={styles.playButton}>
                  <Ionicons name="play" size={24} color="white" />
                </View>
              </View>

              {/* Stream Info */}
              <View style={styles.streamInfo}>
                <Text style={styles.streamTitle} numberOfLines={2}>
                  {stream.title}
                </Text>
                
                <Text style={styles.streamDescription} numberOfLines={2}>
                  {stream.description}
                </Text>

                <View style={styles.streamMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location" size={16} color="#6b7280" />
                    <Text style={styles.metaText}>{stream.location}</Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <Ionicons name="people" size={16} color="#6b7280" />
                    <Text style={styles.metaText}>{stream.viewers} izleyici</Text>
                  </View>
                </View>

                <View style={styles.streamMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={16} color="#6b7280" />
                    <Text style={styles.metaText}>{stream.duration}</Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <Ionicons name="paw" size={16} color="#6b7280" />
                    <Text style={styles.metaText}>{stream.animal_count} hayvan</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(stream.current_amount / stream.target_amount) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    ₺{stream.current_amount.toLocaleString()} / ₺{stream.target_amount.toLocaleString()}
                  </Text>
                </View>

                {/* Tags */}
                <View style={styles.tagsContainer}>
                  {stream.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Stream Modal */}
      {selectedStream && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedStream.title}</Text>
              <TouchableOpacity onPress={() => setSelectedStream(null)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.videoContainer}>
              <Image source={selectedStream.thumbnail} style={styles.videoThumbnail} resizeMode="cover" />
              <View style={styles.videoOverlay}>
                <TouchableOpacity style={styles.playButtonLarge}>
                  <Ionicons name="play" size={48} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.modalDescription}>{selectedStream.description}</Text>
            
            <View style={styles.modalStats}>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>İzleyici</Text>
                <Text style={styles.modalStatValue}>{selectedStream.viewers}</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>Süre</Text>
                <Text style={styles.modalStatValue}>{selectedStream.duration}</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>Kalite</Text>
                <Text style={styles.modalStatValue}>{selectedStream.quality}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.watchButton}>
              <Text style={styles.watchButtonText}>İzlemeye Başla</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  streamsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  streamCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  thumbnailContainer: {
    position: 'relative',
    height: 200,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    backgroundColor: 'white',
    borderRadius: 3,
    marginRight: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamInfo: {
    padding: 16,
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  streamDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  streamMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '500',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 16,
  },
  videoContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonLarge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  watchButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  watchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
