import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { colors } from '../theme/colors';

export default function CheckoutScreen({ route, navigation }) {
  const { total = 0 } = route.params || {};

  function handleStartPayment() {
    // Test aşamasında: Ödeme sayfası atlanır, direkt başarı mesajı gösterilir
    Alert.alert(
      'Başarılı! 🎉',
      'Bağışınız alındı. Teşekkür ederiz!',
      [
        {
          text: 'Tamam',
          onPress: () => {
            // Ana sayfaya dön
            navigation.navigate('Home');
          }
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ödeme</Text>
      <Text style={styles.sub}>Toplam bağış tutarı</Text>
      <Text style={styles.total}>₺ {Number(total).toLocaleString('tr-TR')}</Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleStartPayment}>
        <Text style={styles.primaryBtnText}>Bağışı Onayla</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryBtnText}>Sepete Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, padding: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  sub: { color: '#6B7280' },
  total: { fontSize: 26, fontWeight: '800', color: colors.brand, marginVertical: 16 },
  primaryBtn: { backgroundColor: colors.brand, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, alignSelf: 'stretch', marginHorizontal: 16 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: { marginTop: 14, paddingVertical: 12, paddingHorizontal: 18 },
  secondaryBtnText: { color: '#111827', fontWeight: '700' },
});



