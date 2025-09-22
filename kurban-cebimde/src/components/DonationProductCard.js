import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';

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
  card: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: tokens.stroke.width, borderColor: colors.border, marginBottom: 12 },
  heroWrap: { position: 'relative' },
  hero: { width: '100%', height: 140 },
  heroBadge: { position: 'absolute', left: 10, bottom: 10, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  heroBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  field: { backgroundColor: '#F8FAFC', marginHorizontal: 10, marginTop: 8, borderRadius: 12, overflow: 'hidden', height: 38 },
  pillRow: { paddingHorizontal: 10, paddingTop: 8, gap: 6 },
  pill: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  pillActive: { backgroundColor: '#EAD9D5' },
  pillText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  pillTextActive: { color: colors.primary },
  selectRow: { backgroundColor: '#FAFAFA', marginHorizontal: 10, marginTop: 8, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, borderWidth: tokens.stroke.width, borderColor: colors.border },
  selectLabel: { fontWeight: '800', color: colors.text, fontSize: 13 },
  dropdown: { backgroundColor: '#FFFFFF', marginHorizontal: 10, borderRadius: 12, borderWidth: tokens.stroke.width, borderColor: colors.border, marginTop: 6 },
  optionRow: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  optionText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 10, marginTop: 8 },
  inputWrap: { backgroundColor: '#FAFAFA', height: 40, borderRadius: 12, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', borderWidth: tokens.stroke.width, borderColor: colors.border },
  input: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  inputSuffix: { color: colors.textMuted, fontWeight: '800', marginLeft: 8, fontSize: 12 },
  readonly: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '800' },
  cta: { backgroundColor: colors.primary, height: 44, alignItems: 'center', justifyContent: 'center', marginHorizontal: 10, marginVertical: 10, borderRadius: 24, borderWidth: tokens.stroke.width, borderColor: colors.border },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.3 },
});


