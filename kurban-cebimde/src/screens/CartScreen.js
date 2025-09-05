import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useCart } from '../context/CartContext';
import { colors } from '../theme/colors';

export default function CartScreen({ navigation }) {
  const { items, removeItemById, total, clearCart, updateItemQuantity } = useCart();
  function goCheckout(navigation, amount) {
    navigation.navigate('Checkout', { total: amount });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sepetim</Text>
      <FlatList
        data={items}
        keyExtractor={it => String(it.id)}
        ListEmptyComponent={<Text style={{ color: '#6B7280' }}>Sepet boş</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={item?.meta?.image || require('../../assets/favicon.png')} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.category}</Text>
              {!!item?.meta && (
                <Text style={styles.metaDetail}>
                  {item?.meta?.region ? `${item.meta.region} • ` : ''}
                  {item?.meta?.intention ? `${item.meta.intention} • ` : ''}
                  {item?.onBehalf ? `Adına: ${item.onBehalf}` : ''}
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>₺ {Number(item.amount).toLocaleString('tr-TR')}</Text>
              {/* Hisse/Adet sadece büyükbaş için hisse olarak gösterilir */}
              {String(item?.meta?.animal || '').toLowerCase().includes('büyükbaş') ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <Text style={{ color: '#6B7280', marginRight: 6 }}>Hisse:</Text>
                  <TouchableOpacity onPress={() => updateItemQuantity(item.id, (Number(item.qty||1)-1)||1)}><Text style={{ paddingHorizontal: 8 }}>-</Text></TouchableOpacity>
                  <Text>{item.qty || 1}</Text>
                  <TouchableOpacity onPress={() => updateItemQuantity(item.id, Number(item.qty||1)+1)}><Text style={{ paddingHorizontal: 8 }}>+</Text></TouchableOpacity>
                </View>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => removeItemById(item.id)}>
              <Text style={{ color: colors.danger, marginLeft: 8 }}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Toplam bağış tutarı:</Text>
        <Text style={styles.totalValue}>₺ {Number(total).toLocaleString('tr-TR')}</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => goCheckout(navigation, total)}>
        <Text style={styles.primaryBtnText}>Bağışı Tamamla</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 12 },
  heading: { fontSize: 28, fontWeight: '800', marginBottom: 24, marginTop: 24, alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  thumb: { width: 54, height: 54, borderRadius: 10, marginRight: 12 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  meta: { color: '#6B7280' },
  metaDetail: { color: '#9CA3AF', fontSize: 12 },
  price: { fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  totalLabel: { color: colors.text, fontSize: 16 },
  totalValue: { color: colors.brand, fontWeight: '800', fontSize: 18 },
  primaryBtn: { backgroundColor: colors.brand, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});


