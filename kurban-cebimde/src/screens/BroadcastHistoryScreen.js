import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import api from '../lib/api';

export default function BroadcastHistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/user/broadcast-history', { params: { limit: 20 } });
        setItems(data || []);
      } catch (e) {
        Alert.alert('Hata', 'Yayın geçmişi alınamadı');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yayın Geçmişi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!loading && items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Henüz katıldığın yayın yok</Text>
            <Text style={styles.emptySubtitle}>Yayınlara katıldığında burada görünecek</Text>
          </View>
        ) : (
          items.map((it) => (
            <TouchableOpacity key={`${it.broadcastId}-${it.donationId}`} style={styles.item} onPress={() => {
              if (it.hasMediaPackage && it.mediaPackageId) {
                navigation.navigate('Medya Paketi', { packageId: it.mediaPackageId });
              }
            }}>
              <View style={styles.itemHeader}>
                <Text style={styles.title}>{it.title || 'Kurban Yayını'}</Text>
                <View style={[styles.badge, { backgroundColor: '#16A34A' }]}>
                  <Text style={styles.badgeText}>{it.status === 'completed' ? 'Tamamlandı' : (it.status || 'Arşiv')}</Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{it.startedAt ? new Date(it.startedAt).toLocaleString() : '-'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{it.durationSec ? `${Math.floor(it.durationSec/60)} dk` : '-'}</Text>
              </View>
              {it.hasMediaPackage ? (
                <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Medya Paketi', { packageId: it.mediaPackageId })}>
                  <Ionicons name="images-outline" size={16} color={colors.surface} />
                  <Text style={styles.primaryButtonText}>Medya Paketini Gör</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.infoBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
                  <Text style={styles.infoText}>Medya paketi henüz hazır değil</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  item: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '800', color: colors.text, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: colors.surface, fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { marginLeft: 6, color: '#374151', fontWeight: '500' },
  primaryButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, alignSelf: 'flex-start' },
  primaryButtonText: { color: colors.surface, fontWeight: '700', fontSize: 14 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FEF3C7', borderRadius: 8, marginTop: 12, alignSelf: 'flex-start' },
  infoText: { color: '#92400E', fontWeight: '600' },
});


