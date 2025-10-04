import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import api from '../lib/api';

const { width } = Dimensions.get('window');
const GAP = 12;
const COLS = 2;
const TILE = (width - 16 * 2 - GAP) / COLS; // padding 16, gap

export default function MediaPackageScreen({ route, navigation }) {
  const { packageId } = route.params || {};
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/user/media-packages/${packageId}`);
        setPkg(data);
      } catch (e) {
        Alert.alert('Hata', 'Medya paketi getirilemedi');
      } finally {
        setLoading(false);
      }
    })();
  }, [packageId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pkg?.title || 'Medya Paketi'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!loading && pkg ? (
          <>
            {pkg.note ? <Text style={styles.note}>{pkg.note}</Text> : null}
            <View style={styles.grid}>
              {(pkg.items || []).map((it) => (
                <View key={it.id} style={styles.tile}>
                  {it.type === 'video' ? (
                    <View style={[styles.thumb, { backgroundColor: '#111827' }]}>
                      <Ionicons name="videocam" size={24} color={colors.surface} />
                      <Text style={styles.thumbText}>Video</Text>
                    </View>
                  ) : (
                    <Image source={{ uri: it.previewUrl }} style={styles.image} resizeMode="cover" />
                  )}
                  <View style={styles.tileFooter}>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Medya Görüntüle', { item: it })}>
                      <Ionicons name="eye-outline" size={16} color={colors.surface} />
                      <Text style={styles.primaryButtonText}>Görüntüle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => {
                      Alert.alert('İndir', 'Dosya indiriliyor...');
                    }}>
                      <Ionicons name="download-outline" size={16} color={colors.primary} />
                      <Text style={styles.secondaryButtonText}>İndir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: { width: TILE, marginBottom: GAP },
  thumb: { width: '100%', height: TILE, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  thumbText: { color: colors.surface, marginTop: 6, fontWeight: '700' },
  image: { width: '100%', height: TILE, borderRadius: 12 },
  tileFooter: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primaryButton: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },
  primaryButtonText: { color: colors.surface, fontWeight: '700', fontSize: 12 },
  secondaryButton: { backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },
  secondaryButtonText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  note: { color: '#4B5563', marginBottom: 12 },
});


