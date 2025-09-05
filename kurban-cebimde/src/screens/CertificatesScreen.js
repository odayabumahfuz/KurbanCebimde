import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function CertificatesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all'); // all, recent, downloaded

  // Mock sertifika verileri
  const certificates = [
    {
      id: '1',
      animal: 'Büyükbaş',
      region: 'Somali',
      date: '15.08.2025',
      status: 'ready',
      type: 'Kurban Sertifikası',
      size: '2.4 MB',
      image: require('../../assets/kurbancebimdelogo.png'),
      downloadUrl: 'https://certificates.example.com/somali_buyukbas_001.pdf',
      isDownloaded: false,
    },
    {
      id: '2',
      animal: 'Koç',
      region: 'Türkiye',
      date: '10.08.2025',
      status: 'ready',
      type: 'Kurban Sertifikası',
      size: '1.8 MB',
      image: require('../../assets/kurbancebimdelogo.png'),
      downloadUrl: 'https://certificates.example.com/turkiye_koc_001.pdf',
      isDownloaded: true,
    },
    {
      id: '3',
      animal: 'Koyun',
      region: 'Bangladeş',
      date: '05.08.2025',
      status: 'processing',
      type: 'Kurban Sertifikası',
      size: '--',
      image: require('../../assets/kurbancebimdelogo.png'),
      downloadUrl: null,
      isDownloaded: false,
    },
  ];

  const filteredCertificates = certificates.filter(cert => {
    if (activeTab === 'all') return true;
    if (activeTab === 'recent') return cert.status === 'ready';
    if (activeTab === 'downloaded') return cert.isDownloaded;
    return true;
  });

  function CertificateCard({ certificate }) {
    const statusColor = certificate.status === 'ready' ? '#16A34A' : '#F59E0B';
    const statusText = certificate.status === 'ready' ? 'Hazır' : 'Hazırlanıyor';
    
    const handleDownload = () => {
      if (certificate.status === 'ready') {
        Alert.alert(
          'Sertifika İndir',
          `${certificate.animal} - ${certificate.region} sertifikasını indirmek istiyor musunuz?`,
          [
            { text: 'İptal', style: 'cancel' },
            { 
              text: 'İndir', 
              onPress: () => {
                // Burada gerçek indirme işlemi yapılacak
                Alert.alert('Başarılı', 'Sertifika indirildi!');
              }
            }
          ]
        );
      }
    };

    const handleShare = () => {
      Alert.alert(
        'Sertifika Paylaş',
        'Sertifikayı sosyal medyada paylaşmak istiyor musunuz?',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Paylaş', 
            onPress: () => {
              // Burada gerçek paylaşım işlemi yapılacak
              Alert.alert('Başarılı', 'Sertifika paylaşıldı!');
            }
          }
        ]
      );
    };

    return (
      <View style={styles.certificateCard}>
        <Image source={certificate.image} style={styles.animalImage} />
        <View style={styles.certificateInfo}>
          <View style={styles.certificateHeader}>
            <Text style={styles.animalName}>{certificate.animal}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>
          
          <View style={styles.certificateDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{certificate.region}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{certificate.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{certificate.type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{certificate.size}</Text>
            </View>
          </View>
          
          <View style={styles.certificateActions}>
            {certificate.status === 'ready' ? (
              <>
                <TouchableOpacity style={styles.primaryButton} onPress={handleDownload}>
                  <Ionicons name="download-outline" size={16} color={colors.surface} />
                  <Text style={styles.primaryButtonText}>
                    {certificate.isDownloaded ? 'Tekrar İndir' : 'İndir'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
                  <Ionicons name="share-outline" size={16} color={colors.primary} />
                  <Text style={styles.secondaryButtonText}>Paylaş</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.processingState}>
                <Ionicons name="time-outline" size={16} color="#F59E0B" />
                <Text style={styles.processingText}>Sertifika hazırlanıyor...</Text>
              </View>
            )}
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
        <Text style={styles.headerTitle}>Sertifikalarım</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Tümü</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'recent' && styles.activeTab]} 
          onPress={() => setActiveTab('recent')}
        >
          <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>Hazır</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'downloaded' && styles.activeTab]} 
          onPress={() => setActiveTab('downloaded')}
        >
          <Text style={[styles.tabText, activeTab === 'downloaded' && styles.activeTabText]}>İndirilen</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredCertificates.length > 0 ? (
          filteredCertificates.map(certificate => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Henüz Sertifika Yok</Text>
            <Text style={styles.emptySubtitle}>Kurban bağışlarınız tamamlandıktan sonra sertifikalar burada görünecek</Text>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Kurban')}
            >
              <Text style={styles.ctaButtonText}>Şimdi Kurban Bağışla</Text>
            </TouchableOpacity>
          </View>
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
  
  certificateCard: { 
    backgroundColor: colors.surface, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  animalImage: { width: 80, height: 80, borderRadius: 12, marginRight: 16 },
  certificateInfo: { flex: 1 },
  
  certificateHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  animalName: { fontSize: 18, fontWeight: '800', color: colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: colors.surface, fontSize: 12, fontWeight: '700' },
  
  certificateDetails: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { marginLeft: 8, color: '#374151', fontWeight: '500' },
  
  certificateActions: { 
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
  
  processingState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    flex: 1
  },
  processingText: { color: '#92400E', fontWeight: '600' },
  
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 64,
    paddingHorizontal: 32
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  ctaButton: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 12 
  },
  ctaButtonText: { color: colors.surface, fontWeight: '700', fontSize: 16 },
});
