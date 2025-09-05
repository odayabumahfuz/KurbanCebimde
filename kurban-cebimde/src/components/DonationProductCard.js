import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../theme/colors';

export default function DonationProductCard({
  image,
  animalName,
  regionName,
  regionOptions = [],
  defaultAmount = 0,
  onDonate,
  style,
}) {
  const [region, setRegion] = useState(regionName || '');
  const [intention, setIntention] = useState('');
  const [amount, setAmount] = useState(String(defaultAmount));
  const [qty, setQty] = useState('1');
  const [showRegion, setShowRegion] = useState(false);
  const [showIntention, setShowIntention] = useState(false);

  const unitLabel = useMemo(() => (animalName?.toLowerCase() === 'büyükbaş' ? 'Hisse' : 'Adet'), [animalName]);
  const intentionOptions = ['Adak Kurban', 'Şükür Kurbanı', 'Akika'];

  // Ülke seçimine göre fiyatı güncelle
  useEffect(() => {
    if (!region) return;
    try {
      // lazy import to avoid circular
      const meta = require('../data/kurban').animalMeta[animalName];
      const prices = meta?.prices || {};
      const next = prices[region] ?? meta?.defaultAmount ?? 0;
      setAmount(String(next));
    } catch {}
  }, [region, animalName]);

  function handleDonate() {
    onDonate?.({ animal, region, intention, amount: Number(amount || 0), qty: Number(qty || 1) });
  }

  const canDonate = Boolean(region) && Boolean(intention) && Number(amount || 0) > 0;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.heroWrap}>
        <Image source={image} style={styles.hero} resizeMode="cover" />
        <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>{(animalName || '').toUpperCase()}</Text></View>
      </View>

      {/* Ülke seçimi (tıklayınca açılan liste) */}
      <TouchableOpacity style={styles.selectRow} activeOpacity={0.8} onPress={() => { setShowRegion(!showRegion); setShowIntention(false); }}>
        <Text style={styles.selectLabel}>{region || 'Ülke Seç'}</Text>
      </TouchableOpacity>
      {showRegion && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 120 }} showsVerticalScrollIndicator={false}>
            {regionOptions.map(opt => (
              <TouchableOpacity key={opt} style={styles.optionRow} onPress={() => { setRegion(opt); setShowRegion(false); }}>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Niyet seçimi */}
      <TouchableOpacity style={styles.selectRow} activeOpacity={0.8} onPress={() => { setShowIntention(!showIntention); setShowRegion(false); }}>
        <Text style={styles.selectLabel}>{intention || 'Niyet Seç'}</Text>
      </TouchableOpacity>
      {showIntention && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 120 }} showsVerticalScrollIndicator={false}>
            {intentionOptions.map(opt => (
              <TouchableOpacity key={opt} style={styles.optionRow} onPress={() => { setIntention(opt); setShowIntention(false); }}>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.row}>
        <View style={[styles.inputWrap, { flex: 1.2 }]}>
          <Text style={styles.readonly}>{amount}</Text>
          <Text style={styles.inputSuffix}>₺</Text>
        </View>
        <View style={[styles.inputWrap, { flex: 1 }]}>
          <TextInput value={qty} onChangeText={setQty} inputMode="numeric" keyboardType="number-pad" style={styles.input} />
          <Text style={styles.inputSuffix}>{unitLabel}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.cta, !canDonate && { opacity: 0.6 }]} disabled={!canDonate} onPress={() => onDonate?.({ animal: animalName, region, intention, amount: Number(amount || 0), qty: Number(qty || 1), image })}>
        <Text style={styles.ctaText}>Bağış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 },
  heroWrap: { position: 'relative' },
  hero: { width: '100%', height: 130 },
  heroBadge: { position: 'absolute', left: 8, bottom: 8, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  heroBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  field: { backgroundColor: '#F8FAFC', marginHorizontal: 8, marginTop: 6, borderRadius: 10, overflow: 'hidden', height: 36 },
  pillRow: { paddingHorizontal: 8, paddingTop: 6, gap: 6 },
  pill: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  pillActive: { backgroundColor: '#DCFCE7' },
  pillText: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
  pillTextActive: { color: '#065F46' },
  selectRow: { backgroundColor: '#F8FAFC', marginHorizontal: 8, marginTop: 6, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  selectLabel: { fontWeight: '800', color: '#111827', fontSize: 13 },
  dropdown: { backgroundColor: '#FFFFFF', marginHorizontal: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 6 },
  optionRow: { paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  optionText: { color: '#111827', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 8, marginTop: 6 },
  inputWrap: { backgroundColor: '#F8FAFC', height: 36, borderRadius: 10, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 13, color: colors.text },
  inputSuffix: { color: '#6B7280', fontWeight: '700', marginLeft: 6, fontSize: 12 },
  readonly: { flex: 1, fontSize: 13, color: '#111827', fontWeight: '800' },
  cta: { backgroundColor: '#EF4444', height: 38, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8, marginVertical: 8, borderRadius: 20 },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});


