import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import DonateModal from '../components/DonateModal';
import { Ionicons } from '@expo/vector-icons';
import CampaignCard from '../components/CampaignCard';
import SectionHeader from '../components/SectionHeader';
import AnimalCard from '../components/AnimalCard';
import { regions } from '../data/kurban';
import { getAnimalImage } from '../helpers/animalAssets';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [modal, setModal] = useState({ open: false, category: '', product: '' });
  const [activeRegion, setActiveRegion] = useState(regions[0].key);
  const current = useMemo(() => regions.find(r => r.key === activeRegion), [activeRegion]);

  function openKurban(category, product) {
    setModal({ open: true, category, product });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with Profile and Settings */}
      <View style={styles.header}>
        <Image source={require('../../assets/kurbancebimdeYlogo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Canlı Yayınlar')}>
            <Ionicons name="videocam" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Profil')}>
            <Ionicons name="person" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Ayarlarım')}>
            <Ionicons name="settings" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bildirim Kartı */}
      <View style={styles.notice}>
        <Ionicons name="notifications-outline" size={18} color="#111827" />
        <Text style={styles.noticeText}>Kesim başlamadan 30 dk önce SMS/uygulama bildirimi alacaksınız.</Text>
      </View>

      {/* Canlı Yayın Kartı */}
      <TouchableOpacity style={styles.liveStreamCard} onPress={() => navigation.navigate('Canlı Yayınlar')}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>CANLI</Text>
        </View>
        <Text style={styles.liveTitle}>Kurban Kesimi - Türkiye</Text>
        <Text style={styles.liveSubtitle}>Şu anda 1,250 kişi izliyor</Text>
        <View style={styles.liveStats}>
          <View style={styles.liveStat}>
            <Ionicons name="time" size={16} color="#6b7280" />
            <Text style={styles.liveStatText}>2:15:30</Text>
          </View>
          <View style={styles.liveStat}>
            <Ionicons name="people" size={16} color="#6b7280" />
            <Text style={styles.liveStatText}>15 hayvan</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Kurban Kampanyaları */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.banners}>
        <CampaignCard title="Kurban 2025" image={require('../../assets/koç.png')} onDonate={() => openKurban('Türkiye - koç', 'Koç Bağışı')} />
        <CampaignCard title="Büyükbaş Hisse" image={require('../../assets/büyükbaş.png')} onDonate={() => openKurban('Türkiye - büyükbaş', 'Büyükbaş Bağışı')} />
        <CampaignCard title="Koyun Bağışı" image={require('../../assets/koyun.png')} onDonate={() => openKurban('Filistin - koyun', 'Koyun Bağışı')} />
      </ScrollView>

      {/* Öne Çıkan Bağışlar (sade) */}
      <SectionHeader title="Öne Çıkan Bağışlar" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionTabs}>
        {[regions[0], regions[1], regions[2]].filter(Boolean).map(r => (
          <TouchableOpacity key={r.key} onPress={() => setActiveRegion(r.key)} style={[styles.regionPill, activeRegion === r.key && styles.regionPillActive]}>
            <Text style={[styles.regionPillText, activeRegion === r.key && styles.regionPillTextActive]}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.animalsWrap}>
        {current.animals.slice(0, 3).map(name => (
          <AnimalCard key={name} name={name} image={getAnimalImage(name)} onPress={() => openKurban(`${current.name} - ${name}`, `${name} Bağışı`)} />
        ))}
      </View>

      {/* Hızlı Erişim Butonları */}
      <SectionHeader title="Hızlı Erişim" />
      <View style={styles.quickAccess}>
        <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate('Bağışlarım')}>
          <Ionicons name="time" size={24} color="#3b82f6" />
          <Text style={styles.quickButtonText}>Bağış Geçmişi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate('Canlı Yayınlar')}>
          <Ionicons name="videocam" size={24} color="#ef4444" />
          <Text style={styles.quickButtonText}>Canlı Yayınlar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => Alert.alert('Yardım', 'Yardım sayfası açılıyor...')}>
          <Ionicons name="help-circle" size={24} color="#10b981" />
          <Text style={styles.quickButtonText}>Yardım</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => Alert.alert('İletişim', 'İletişim sayfası açılıyor...')}>
          <Ionicons name="call" size={24} color="#f59e0b" />
          <Text style={styles.quickButtonText}>İletişim</Text>
        </TouchableOpacity>
      </View>

      <DonateModal
        visible={modal.open}
        onClose={() => setModal({ open: false, category: '', product: '' })}
        category={modal.category}
        product={modal.product}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16
  },
  logo: { width: '50%', height: 100 },
  headerButtons: { flexDirection: 'row', gap: 12 },
  headerButton: { 
    padding: 8, 
    backgroundColor: '#f3f4f6', 
    borderRadius: 8 
  },
  notice: { backgroundColor: '#F1F5F9', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  noticeText: { color: '#111827', flex: 1 },
  liveStreamCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4
  },
  liveText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 12
  },
  liveTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  liveSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 12
  },
  liveStats: {
    flexDirection: 'row',
    gap: 16
  },
  liveStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  liveStatText: {
    color: '#6b7280',
    fontSize: 12
  },
  banners: { gap: 12, paddingVertical: 16 },
  bannerCard: { backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden', elevation: 1, width: 320, marginRight: 12 },
  bannerImage: { width: '100%', height: 180 },
  primaryBtn: { backgroundColor: '#F4C20D', paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#111', fontWeight: '700', fontSize: 16 },
  quickTitle: { marginTop: 4, fontWeight: '800', fontSize: 18, color: '#111827' },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  quickBtn: { backgroundColor: '#F3F4F6', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  quickText: { fontWeight: '700', color: '#111827' },
  regionTabs: { paddingVertical: 8, gap: 8 },
  regionPill: { backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, marginRight: 8 },
  regionPillActive: { backgroundColor: '#DCFCE7' },
  regionPillText: { color: '#6B7280', fontWeight: '700' },
  regionPillTextActive: { color: '#059669' },
  animalsWrap: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickAccess: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12
  },
  quickButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '47%',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  quickButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center'
  }
});


