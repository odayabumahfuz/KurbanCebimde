import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ReportsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all'); // all, distribution, slaughter, financial, audit, monthly
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Mock rapor verileri
  const reports = [
    {
      id: '1',
      type: 'Dağıtım Raporu',
      animal: 'Büyükbaş',
      region: 'Somali',
      date: '15.08.2025',
      status: 'ready',
      size: '3.2 MB',
      image: require('../../assets/kurbancebimdelogo.png'),
      downloadUrl: 'https://reports.example.com/somali_buyukbas_001_distribution.pdf',
      isDownloaded: false,
      priority: 'high',
      tags: ['Dağıtım', 'Somali', 'Büyükbaş'],
      details: {
        beneficiaries: 45,
        meatDistributed: '180 kg',
        distributionDate: '16.08.2025',
        location: 'Mogadişu, Somali',
        coordinator: 'Ahmed Hassan',
        notes: 'Başarılı dağıtım, tüm aileler memnun'
      }
    },
    {
      id: '2',
      type: 'Kesim Detay Raporu',
      animal: 'Koç',
      region: 'Türkiye',
      date: '10.08.2025',
      status: 'ready',
      size: '2.8 MB',
      image: require('../../assets/kurbancebimdelogo.png'),
      downloadUrl: 'https://reports.example.com/turkiye_koc_001_slaughter.pdf',
      isDownloaded: true,
      priority: 'medium',
      tags: ['Kesim', 'Türkiye', 'Koç'],
      details: {
        slaughterDate: '10.08.2025',
        slaughterTime: '14:30',
        butcher: 'Mehmet Usta',
        halalCertified: true,
        meatQuality: 'A+',
        weight: '45 kg',
        notes: 'Profesyonel kesim, hijyenik koşullar'
      }
    },
    {
      id: '3',
      type: 'Finansal Rapor',
      animal: 'Koyun',
      region: 'Bangladeş',
      date: '05.08.2025',
      status: 'processing',
      size: '--',
      image: require('../../assets/kurbancebimdelogo.png'),
      downloadUrl: null,
      isDownloaded: false,
      priority: 'high',
      tags: ['Finansal', 'Bangladeş', 'Koyun'],
      details: {
        totalCost: '₺ 6.500',
        transportationCost: '₺ 800',
        processingCost: '₺ 400',
        netAmount: '₺ 5.300',
        currency: 'TRY',
        exchangeRate: '1 USD = 28.5 TRY',
        notes: 'Bütçe dahilinde tamamlandı'
      }
    },
    {
      id: '4',
      type: 'Denetim Raporu',
      animal: 'Büyükbaş',
      region: 'Pakistan',
      date: '20.08.2025',
      status: 'ready',
      size: '4.1 MB',
      image: require('../../assets/kurbancebimdelogo.png'),
      downloadUrl: 'https://reports.example.com/pakistan_buyukbas_002_audit.pdf',
      isDownloaded: false,
      priority: 'high',
      tags: ['Denetim', 'Pakistan', 'Büyükbaş'],
      details: {
        auditor: 'Dr. Fatima Khan',
        auditDate: '20.08.2025',
        complianceScore: '95%',
        findings: '2 minor issues found',
        recommendations: 'Process improvement suggested',
        notes: 'Overall excellent compliance with standards'
      }
    },
    {
      id: '5',
      type: 'Aylık Özet Raporu',
      animal: 'Tümü',
      region: 'Genel',
      date: '01.09.2025',
      status: 'ready',
      size: '8.5 MB',
      image: require('../../assets/kurbancebimdelogo.png'),
      downloadUrl: 'https://reports.example.com/monthly_summary_august_2025.pdf',
      isDownloaded: false,
      priority: 'medium',
      tags: ['Aylık', 'Özet', 'Genel'],
      details: {
        totalAnimals: 156,
        totalBeneficiaries: 1240,
        totalAmount: '₺ 89.500',
        regions: ['Türkiye', 'Somali', 'Pakistan', 'Bangladeş'],
        highlights: 'Record breaking month for donations',
        notes: 'Successful implementation of new donation system'
      }
    },
  ];

  const filteredReports = reports.filter(report => {
    // Tab filtreleme
    if (activeTab === 'all') return true;
    if (activeTab === 'distribution') return report.type.includes('Dağıtım');
    if (activeTab === 'slaughter') return report.type.includes('Kesim');
    if (activeTab === 'financial') return report.type.includes('Finansal');
    if (activeTab === 'audit') return report.type.includes('Denetim');
    if (activeTab === 'monthly') return report.type.includes('Aylık');
    
    // Arama filtreleme
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.type.toLowerCase().includes(searchLower) ||
        report.animal.toLowerCase().includes(searchLower) ||
        report.region.toLowerCase().includes(searchLower) ||
        report.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  function ReportCard({ report }) {
    const statusColor = report.status === 'ready' ? '#16A34A' : '#F59E0B';
    const statusText = report.status === 'ready' ? 'Hazır' : 'Hazırlanıyor';
    
    const handleDownload = () => {
      if (report.status === 'ready') {
        Alert.alert(
          'Rapor İndir',
          `${report.type} - ${report.animal} - ${report.region} raporunu indirmek istiyor musunuz?`,
          [
            { text: 'İptal', style: 'cancel' },
            { 
              text: 'İndir', 
              onPress: () => {
                // Burada gerçek indirme işlemi yapılacak
                Alert.alert('Başarılı', 'Rapor indirildi!');
              }
            }
          ]
        );
      }
    };

    const handleShare = () => {
      Alert.alert(
        'Rapor Paylaş',
        'Raporu sosyal medyada paylaşmak istiyor musunuz?',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Paylaş', 
            onPress: () => {
              // Burada gerçek paylaşım işlemi yapılacak
              Alert.alert('Başarılı', 'Rapor paylaşıldı!');
            }
          }
        ]
      );
    };

    const renderReportDetails = () => {
      if (report.type.includes('Dağıtım')) {
        return (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Dağıtım Bilgileri:</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Faydalanan Kişi:</Text>
                <Text style={styles.detailValue}>{report.details.beneficiaries}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Dağıtılan Et:</Text>
                <Text style={styles.detailValue}>{report.details.meatDistributed}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Dağıtım Tarihi:</Text>
                <Text style={styles.detailValue}>{report.details.distributionDate}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Konum:</Text>
                <Text style={styles.detailValue}>{report.details.location}</Text>
              </View>
            </View>
          </View>
        );
      } else if (report.type.includes('Kesim')) {
        return (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Kesim Bilgileri:</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Kesim Tarihi:</Text>
                <Text style={styles.detailValue}>{report.details.slaughterDate}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Kesim Saati:</Text>
                <Text style={styles.detailValue}>{report.details.slaughterTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Kasap:</Text>
                <Text style={styles.detailValue}>{report.details.butcher}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Helal Sertifikalı:</Text>
                <Text style={styles.detailValue}>{report.details.halalCertified ? '✅ Evet' : '❌ Hayır'}</Text>
              </View>
            </View>
          </View>
        );
      } else if (report.type.includes('Finansal')) {
        return (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Finansal Detaylar:</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Toplam Maliyet:</Text>
                <Text style={styles.detailValue}>{report.details.totalCost}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Nakliye:</Text>
                <Text style={styles.detailValue}>{report.details.transportationCost}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>İşleme:</Text>
                <Text style={styles.detailValue}>{report.details.processingCost}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Net Tutar:</Text>
                <Text style={styles.detailValue}>{report.details.netAmount}</Text>
              </View>
            </View>
          </View>
        );
      }
      return null;
    };

    return (
      <View style={styles.reportCard}>
        <Image source={report.image} style={styles.animalImage} />
        <View style={styles.reportInfo}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportType}>{report.type}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) }]}>
                <Text style={styles.priorityText}>{getPriorityText(report.priority)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{statusText}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.reportDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="paw-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{report.animal}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{report.region}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{report.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{report.size}</Text>
            </View>
          </View>
          
          {renderReportDetails()}

          <View style={styles.tagsContainer}>
            {report.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.reportActions}>
            {report.status === 'ready' ? (
              <>
                <TouchableOpacity style={styles.primaryButton} onPress={handleDownload}>
                  <Ionicons name="download-outline" size={16} color={colors.surface} />
                  <Text style={styles.primaryButtonText}>
                    {report.isDownloaded ? 'Tekrar İndir' : 'İndir'}
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
                <Text style={styles.processingText}>Rapor hazırlanıyor...</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Normal';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raporlarım</Text>
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
          style={[styles.tabButton, activeTab === 'distribution' && styles.activeTab]} 
          onPress={() => setActiveTab('distribution')}
        >
          <Text style={[styles.tabText, activeTab === 'distribution' && styles.activeTabText]}>Dağıtım</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'slaughter' && styles.activeTab]} 
          onPress={() => setActiveTab('slaughter')}
        >
          <Text style={[styles.tabText, activeTab === 'slaughter' && styles.activeTabText]}>Kesim</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'financial' && styles.activeTab]} 
          onPress={() => setActiveTab('financial')}
        >
          <Text style={[styles.tabText, activeTab === 'financial' && styles.activeTabText]}>Finansal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'audit' && styles.activeTab]} 
          onPress={() => setActiveTab('audit')}
        >
          <Text style={[styles.tabText, activeTab === 'audit' && styles.activeTabText]}>Denetim</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'monthly' && styles.activeTab]} 
          onPress={() => setActiveTab('monthly')}
        >
          <Text style={[styles.tabText, activeTab === 'monthly' && styles.activeTabText]}>Aylık</Text>
        </TouchableOpacity>
      </View>

      {/* Arama ve Filtreler */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rapor ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.createReportButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add-circle" size={20} color={colors.surface} />
          <Text style={styles.createReportText}>Yeni Rapor</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Henüz Rapor Yok</Text>
            <Text style={styles.emptySubtitle}>Kurban bağışlarınız tamamlandıktan sonra raporlar burada görünecek</Text>
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
  
  reportCard: { 
    backgroundColor: colors.surface, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  animalImage: { width: 80, height: 80, borderRadius: 12, marginRight: 16 },
  reportInfo: { flex: 1 },
  
  reportHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  reportType: { fontSize: 18, fontWeight: '800', color: colors.text, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: colors.surface, fontSize: 12, fontWeight: '700' },
  
  reportDetails: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { marginLeft: 8, color: '#374151', fontWeight: '500' },
  
  detailsSection: { 
    backgroundColor: '#F8FAFC', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  detailsTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { minWidth: '45%' },
  detailLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: '600', marginTop: 2 },
  
  reportActions: { 
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
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 40,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  createReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createReportText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
