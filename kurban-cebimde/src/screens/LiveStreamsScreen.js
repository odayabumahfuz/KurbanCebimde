import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { liveAPI } from '../lib/liveAPI';

const { width } = Dimensions.get('window');

export default function LiveStreamsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, archive

  // Mock canlı yayın verileri
  const upcomingStreams = [
    {
      id: '1',
      animal: 'Büyükbaş',
      region: 'Somali',
      date: '20.08.2025',
      time: '14:00',
      timeLeft: '2 gün 5 saat',
      status: 'scheduled',
      image: require('../../assets/kurbancebimdelogo.png'),
      rtmpKey: 'somali_buyukbas_001',
      liveUrl: 'https://stream.example.com/somali_buyukbas_001',
      channel: 'kc_demo_somali_001',
      description: 'Somali bölgesinde büyükbaş kurban kesimi canlı yayını',
      organizer: 'Somali İnsani Yardım Vakfı',
      targetAmount: 5000,
      currentAmount: 3200,
      viewers: 0,
    },
    {
      id: '2',
      animal: 'Koç',
      region: 'Türkiye',
      date: '22.08.2025',
      time: '10:00',
      timeLeft: '4 gün 1 saat',
      status: 'scheduled',
      image: require('../../assets/kurbancebimdelogo.png'),
      rtmpKey: 'turkiye_koc_002',
      liveUrl: 'https://stream.example.com/turkiye_koc_002',
      channel: 'kc_demo_tr_002',
      description: 'Türkiye\'de koç kurban kesimi canlı yayını',
      organizer: 'Türkiye Diyanet İşleri',
      targetAmount: 3000,
      currentAmount: 1800,
      viewers: 0,
    },
    {
      id: '3',
      animal: 'Koyun',
      region: 'Afganistan',
      date: '25.08.2025',
      time: '16:00',
      timeLeft: '7 gün 7 saat',
      status: 'scheduled',
      image: require('../../assets/kurbancebimdelogo.png'),
      rtmpKey: 'afganistan_koyun_003',
      liveUrl: 'https://stream.example.com/afganistan_koyun_003',
      description: 'Afganistan\'da koyun kurban kesimi canlı yayını',
      organizer: 'Afganistan Yardım Kuruluşu',
      targetAmount: 2000,
      currentAmount: 500,
      viewers: 0,
    },
  ];

  const archivedStreams = [
    {
      id: '1',
      animal: 'Koyun',
      region: 'Türkiye',
      date: '15.08.2025',
      time: '12:00',
      status: 'completed',
      image: require('../../assets/kurbancebimdelogo.png'),
      finalAmount: 2800,
      viewers: 1250,
      duration: '2 saat 15 dakika',
      certificateCount: 45,
      channel: 'kc_demo_tr_archive_001'
    },
    {
      id: '2',
      animal: 'Büyükbaş',
      region: 'Pakistan',
      date: '10.08.2025',
      time: '14:30',
      status: 'completed',
      image: require('../../assets/kurbancebimdelogo.png'),
      finalAmount: 4500,
      viewers: 2100,
      duration: '3 saat 45 dakika',
      certificateCount: 78,
      channel: 'kc_demo_pk_archive_002'
    },
  ];

  const myStreams = [
    {
      id: '1',
      animal: 'Koç',
      region: 'Türkiye',
      date: '18.08.2025',
      time: '11:00',
      status: 'draft',
      image: require('../../assets/kurbancebimdelogo.png'),
      description: 'Kişisel kurban kesimi yayını',
      targetAmount: 1500,
      currentAmount: 0,
    },
  ];

  function UpcomingStreamCard({ stream }) {
    return (
      <View style={styles.streamCard}>
        <Image source={stream.image} style={styles.animalImage} />
        <View style={styles.streamInfo}>
          <View style={styles.streamHeader}>
            <Text style={styles.animalName}>{stream.animal}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.statusText}>Yaklaşıyor</Text>
            </View>
          </View>
          
          <View style={styles.streamDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{stream.region}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{stream.date} - {stream.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{stream.timeLeft}</Text>
            </View>
          </View>
          
          <View style={styles.streamActions}>
            <TouchableOpacity style={styles.primaryButton}>
              <Ionicons name="notifications-outline" size={16} color={colors.surface} />
              <Text style={styles.primaryButtonText}>Hatırlatıcı Kur</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="share-outline" size={16} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Paylaş</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  function ArchivedStreamCard({ stream, onWatch }) {
    return (
      <View style={styles.streamCard}>
        <Image source={stream.image} style={styles.animalImage} />
        <View style={styles.streamInfo}>
          <View style={styles.streamHeader}>
            <Text style={styles.animalName}>{stream.animal}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#16A34A' }]}>
              <Text style={styles.statusText}>Tamamlandı</Text>
            </View>
          </View>
          
          <View style={styles.streamDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{stream.region}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{stream.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="play-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{stream.duration}</Text>
            </View>
          </View>
          
          <View style={styles.streamActions}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => onWatch?.(stream)}>
              <Ionicons name="play-circle-outline" size={16} color={colors.surface} />
              <Text style={styles.primaryButtonText}>İzle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="document-text-outline" size={16} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Rapor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  function MyStreamCard({ stream }) {
    return (
      <View style={styles.streamCard}>
        <Image source={stream.image} style={styles.animalImage} />
        <View style={styles.streamInfo}>
          <View style={styles.streamHeader}>
            <Text style={styles.animalName}>{stream.animal}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.statusText}>TASLAK</Text>
            </View>
          </View>
          
          <View style={styles.streamDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{stream.region}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{stream.date} - {stream.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>Hedef: ₺{stream.targetAmount} (₺{stream.currentAmount} toplandı)</Text>
            </View>
            <Text style={styles.streamDescription}>{stream.description}</Text>
          </View>
          
          <View style={styles.streamActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => Alert.alert('Düzenle', 'Yayın düzenleme yakında eklenecek!')}
            >
              <Ionicons name="create-outline" size={16} color="#059669" />
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.startButton]}
              onPress={() => Alert.alert('Yayını Başlat', 'Yayın başlatma yakında eklenecek!')}
            >
              <Ionicons name="play" size={16} color={colors.surface} />
              <Text style={styles.startButtonText}>Yayını Başlat</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => Alert.alert('Sil', 'Yayın silme yakında eklenecek!')}
            >
              <Ionicons name="trash-outline" size={16} color="#DC2626" />
              <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Canlı Yayın & Arşiv</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'upcoming' && styles.activeTab]} 
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Yaklaşan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'archive' && styles.activeTab]} 
          onPress={() => setActiveTab('archive')}
        >
          <Text style={[styles.tabText, activeTab === 'archive' && styles.activeTabText]}>Arşiv</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'my-streams' && styles.activeTab]} 
          onPress={() => setActiveTab('my-streams')}
        >
          <Text style={[styles.tabText, activeTab === 'my-streams' && styles.activeTabText]}>Yayınlarım</Text>
        </TouchableOpacity>
      </View>

      {/* Admin-only kontroller mobilde gösterilmiyor */}

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'upcoming' ? (
          upcomingStreams.length > 0 ? (
            upcomingStreams.map(stream => (
              <UpcomingStreamCard key={stream.id} stream={stream} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="videocam-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Yaklaşan Yayın Yok</Text>
              <Text style={styles.emptySubtitle}>Yaklaşan kurban kesim yayınları burada görünecek</Text>
            </View>
          )
        ) : (
          archivedStreams.length > 0 ? (
            archivedStreams.map(stream => (
              <ArchivedStreamCard
                key={stream.id}
                stream={stream}
                onWatch={async (s) => {
                  try {
                    const data = await liveAPI.getToken({ role: 'audience', channel: s.channel || 'kc_demo' });
                    navigation.navigate('WatchLive', { channel: data.channel, role: 'audience', token: data.rtcToken });
                  } catch (e) {
                    Alert.alert('Hata', 'Yayın izleme başlatılamadı');
                  }
                }}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="archive-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Arşiv Boş</Text>
              <Text style={styles.emptySubtitle}>Tamamlanan yayınlar burada görünecek</Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  
  tabContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 8,
    marginHorizontal: 4
  },
  activeTab: { backgroundColor: colors.primary },
  tabText: { fontWeight: '600', color: '#6B7280' },
  activeTabText: { color: colors.surface, fontWeight: '700' },
  
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  
  streamCard: { 
    backgroundColor: colors.surface, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  animalImage: { width: 80, height: 80, borderRadius: 12, marginRight: 16 },
  streamInfo: { flex: 1 },
  
  streamHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  animalName: { fontSize: 18, fontWeight: '800', color: colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: colors.surface, fontSize: 12, fontWeight: '700' },
  
  streamDetails: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { marginLeft: 8, color: '#374151', fontWeight: '500' },
  
  streamActions: { 
    flexDirection: 'row', 
    gap: 12
  },
  primaryButton: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  primaryButtonText: { color: colors.surface, fontWeight: '700', fontSize: 14 },
  secondaryButton: { 
    backgroundColor: 'transparent', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  secondaryButtonText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 64,
    paddingHorizontal: 32
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },

  createStreamContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  createStreamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  createStreamText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  streamDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#D1FAE5',
  },
  editButtonText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  startButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
});
