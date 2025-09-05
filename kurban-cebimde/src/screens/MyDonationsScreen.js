import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function MyDonationsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all'); // all, upcoming, completed

  // Mock bağış verileri
  const donations = [
    {
      id: '1',
      region: 'Türkiye',
      animal: 'Koç',
      shareCount: 1,
      amount: '₺ 8.500',
      date: '15.08.2025',
      status: 'completed',
      intention: 'Adak Kurbanı',
      onBehalfOf: 'Ahmet Yılmaz',
      image: require('../../assets/kurbancebimdelogo.png'),
    },
    {
      id: '2',
      region: 'Somali',
      animal: 'Büyükbaş',
      shareCount: 2,
      amount: '₺ 17.000',
      date: '10.08.2025',
      status: 'upcoming',
      intention: 'Şükür Kurbanı',
      onBehalfOf: 'Fatma Yılmaz',
      image: require('../../assets/kurbancebimdelogo.png'),
    },
    {
      id: '3',
      region: 'Bangladeş',
      animal: 'Koyun',
      shareCount: 1,
      amount: '₺ 6.500',
      date: '05.08.2025',
      status: 'completed',
      intention: 'Adak Kurbanı',
      onBehalfOf: 'Ahmet Yılmaz',
      image: require('../../assets/kurbancebimdelogo.png'),
    },
  ];

  const filteredDonations = donations.filter(d => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return d.status === 'upcoming';
    if (activeTab === 'completed') return d.status === 'completed';
    return true;
  });

  function DonationCard({ donation }) {
    const statusColor = donation.status === 'completed' ? '#16A34A' : '#F59E0B';
    const statusText = donation.status === 'completed' ? 'Tamamlandı' : 'Yaklaşıyor';
    
    return (
      <View style={styles.donationCard}>
        <Image source={donation.image} style={styles.animalImage} />
        <View style={styles.donationInfo}>
          <View style={styles.donationHeader}>
            <Text style={styles.animalName}>{donation.animal}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>
          
          <View style={styles.donationDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{donation.region}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="heart-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{donation.intention}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{donation.onBehalfOf}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{donation.date}</Text>
            </View>
          </View>
          
          <View style={styles.donationFooter}>
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Toplam Tutar:</Text>
              <Text style={styles.amountValue}>{donation.amount}</Text>
            </View>
            <View style={styles.shareSection}>
              <Text style={styles.shareLabel}>
                {donation.animal === 'Büyükbaş' ? 'Hisse:' : 'Adet:'}
              </Text>
              <Text style={styles.shareValue}>{donation.shareCount}</Text>
            </View>
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
        <Text style={styles.headerTitle}>Bağışlarım</Text>
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
          style={[styles.tabButton, activeTab === 'upcoming' && styles.activeTab]} 
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Yaklaşan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'completed' && styles.activeTab]} 
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Tamamlanan</Text>
        </TouchableOpacity>
      </View>

      {/* Donations List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredDonations.length > 0 ? (
          filteredDonations.map(donation => (
            <DonationCard key={donation.id} donation={donation} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Henüz Bağış Yapmadınız</Text>
            <Text style={styles.emptySubtitle}>İlk kurban bağışınızı yaparak burada görebilirsiniz</Text>
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
  
  donationCard: { 
    backgroundColor: colors.surface, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  animalImage: { width: 80, height: 80, borderRadius: 12, marginRight: 16 },
  donationInfo: { flex: 1 },
  
  donationHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  animalName: { fontSize: 18, fontWeight: '800', color: colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: colors.surface, fontSize: 12, fontWeight: '700' },
  
  donationDetails: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { marginLeft: 8, color: '#374151', fontWeight: '500' },
  
  donationFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  amountSection: { alignItems: 'flex-start' },
  amountLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  amountValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  shareSection: { alignItems: 'flex-end' },
  shareLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  shareValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  
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
