import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import SectionHeader from '../components/SectionHeader';
import DonateModal from '../components/DonateModal';
import { Ionicons } from '@expo/vector-icons';
import { regions, animalMeta } from '../data/kurban';
import AnimalCard from '../components/AnimalCard';
import { getAnimalImage } from '../helpers/animalAssets';
import DonationProductCard from '../components/DonationProductCard';

function RegionTab({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.regionTab, active && styles.regionTabActive]}>
      <Text style={[styles.regionTabText, active && styles.regionTabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DonateScreen() {
  const [modal, setModal] = useState({ open: false, label: '', category: '', region: '', qty: 1, unitPrice: 0, intention: '' });
  const listAnim = useRef(new Animated.Value(1)).current;

  const animals = useMemo(() => {
    const union = new Set();
    regions.forEach(r => r.animals.forEach(a => union.add(a)));
    return Array.from(union); // tüm eklenen hayvanlar
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionHeader title="Kurban" />

      <Animated.View style={{ opacity: listAnim, transform: [{ translateY: listAnim.interpolate({ inputRange: [0,1], outputRange: [8,0] }) }] }}>
        <View style={styles.cardGrid}>
          {animals.map(name => {
            const allowedRegions = regions.filter(r => r.animals.includes(name)).map(r => r.name);
            const defaultRegion = allowedRegions[0];
            return (
            <DonationProductCard
              key={name}
              image={getAnimalImage(name)}
              animalName={name}
              regionName={''}
              regionOptions={allowedRegions}
              defaultAmount={animalMeta[name]?.defaultAmount || 0}
              onDonate={({ amount, qty, region, intention, image }) => setModal({ open: true, label: name, category: `${region || defaultRegion} - ${name}` , region: region || defaultRegion, qty, unitPrice: amount, intention: intention || '', image })}
              style={styles.cardItem}
            />
            );
          })}
        </View>
      </Animated.View>

      <DonateModal
        visible={modal.open}
        onClose={() => setModal({ open: false, label: '', category: '', region: '', qty: 1, unitPrice: 0 })}
        category={modal.category}
        product={`${modal.label} Bağışı`}
        region={modal.region}
        qty={modal.qty}
        unitPrice={modal.unitPrice}
        intention={modal.intention}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8, paddingBottom: 40 },
  heading: { fontSize: 30, fontWeight: '800', marginHorizontal: 16, marginBottom: 12 },
  regionTabs: { paddingHorizontal: 12, paddingVertical: 8 },
  regionTab: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#F3F4F6', marginRight: 8 },
  regionTabActive: { backgroundColor: '#DCFCE7' },
  regionTabText: { color: '#6B7280', fontWeight: '600' },
  regionTabTextActive: { color: '#059669' },
  animalsWrap: { marginTop: 16, marginHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
  animalCard: { width: '47%', borderRadius: 18, paddingVertical: 20, paddingHorizontal: 16, gap: 10 },
  animalName: { fontWeight: '700', fontSize: 16 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  cardItem: { width: '48%' },
});


