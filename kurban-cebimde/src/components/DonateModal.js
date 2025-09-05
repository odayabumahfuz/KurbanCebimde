import React, { useMemo, useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../theme/colors';
import { useCart } from '../context/CartContext';

export default function DonateModal({ visible, onClose, category = 'Acil Yardım', product = 'Bağış', region = '', qty = 1, unitPrice = 0, intention = '', image }) {
  const { addItem } = useCart();
  const [donorType, setDonorType] = useState('Benim Adıma');
  const [onBehalf, setOnBehalf] = useState(false);
  const [quantity, setQuantity] = useState(qty || 1);
  const [onBehalfName, setOnBehalfName] = useState('');
  const total = useMemo(() => Number(unitPrice) * Number(quantity || 1), [unitPrice, quantity]);

  const canAdd = useMemo(() => total > 0 && (!onBehalf || onBehalfName.trim().length > 1), [total, onBehalf, onBehalfName]);

  function handleAdd() {
    if (!canAdd) return;
    addItem({ id: Date.now().toString(), title: product, category, amount: total, unitPrice, qty: quantity, onBehalf: onBehalf ? onBehalfName.trim() : undefined, meta: { region, intention, image, animal: product } });
    onClose?.();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.category}>{category}</Text>
              <Text style={styles.title}>{product}</Text>
              <Text style={styles.subtitle}>{region ? `${region} • ${intention || 'Niyet seçilmedi'}` : 'Ülke/niyet seçin'}</Text>
            </View>
            <Pressable hitSlop={16} onPress={onClose}>
              <Ionicons name="close" size={24} color={'#9CA3AF'} />
            </Pressable>
          </View>

          <View style={styles.rowBetween}>
            <View style={[styles.amountInputWrap, { flex: 1, marginRight: 8 }] }>
              <Text style={styles.currency}>₺</Text>
              <Text style={styles.amountRead}>{String(total)}</Text>
            </View>
            <View style={[styles.amountInputWrap, { width: 120 }] }>
              <Text style={styles.currency}>x</Text>
              <TextInput
                style={styles.amountInput}
                value={String(quantity)}
                onChangeText={setQuantity}
                inputMode="numeric"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Bağış Türü</Text>
          <View style={styles.rowBetween}>
            <TouchableOpacity style={[styles.tag, donorType==='Benim Adıma' && styles.tagActive]} onPress={() => { setDonorType('Benim Adıma'); setOnBehalf(false); }}>
              <Text style={[styles.tagText, donorType==='Benim Adıma' && styles.tagTextActive]}>Benim Adıma</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tag, (donorType==='Başkası Adına' || onBehalf) && styles.tagActive]} onPress={() => { setDonorType('Başkası Adına'); setOnBehalf(true); }}>
              <Text style={[styles.tagText, (donorType==='Başkası Adına' || onBehalf) && styles.tagTextActive]}>Başkası Adına</Text>
            </TouchableOpacity>
          </View>

          {onBehalf && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Ad Soyad</Text>
              <View style={styles.amountInputWrap}>
                <TextInput
                  style={styles.amountInput}
                  value={onBehalfName}
                  onChangeText={setOnBehalfName}
                  placeholder="Kimin adına kesilecek?"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          )}

          <View style={styles.rowBetween}>
            <Text style={styles.metaText}>Ülke: <Text style={{ fontWeight: '800' }}>{region}</Text></Text>
            <Text style={styles.metaText}>Birim: <Text style={{ fontWeight: '800' }}>{unitPrice} ₺</Text></Text>
          </View>

          <TouchableOpacity style={[styles.primaryBtn, !canAdd && { opacity: 0.5 }]} onPress={handleAdd} disabled={!canAdd}>
            <Text style={styles.primaryBtnText}>Sepete Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  category: { color: '#EF4444', fontWeight: '700', marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { marginTop: 2, color: '#6B7280', fontSize: 12 },
  label: { marginTop: 16, marginBottom: 6, color: colors.textMuted },
  amountInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 14, paddingHorizontal: 12, height: 52 },
  currency: { fontSize: 18, color: colors.textMuted, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 18, color: colors.text },
  amountRead: { flex: 1, fontSize: 18, color: colors.text, fontWeight: '800' },
  pickerWrap: { backgroundColor: '#F3F4F6', borderRadius: 14, overflow: 'hidden' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  checkboxLabel: { color: colors.text, flex: 1, marginRight: 12 },
  tag: { backgroundColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999 },
  tagActive: { backgroundColor: '#DCFCE7' },
  tagText: { color: '#6B7280', fontWeight: '700' },
  tagTextActive: { color: '#065F46' },
  metaText: { color: colors.textMuted },
  primaryBtn: { backgroundColor: colors.brand, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});


