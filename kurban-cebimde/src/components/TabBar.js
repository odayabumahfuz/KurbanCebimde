import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useCart } from '../context/CartContext';

const iconByRoute = {
  Anasayfa: 'home-outline',
  'Bağış Yap': 'heart-outline',
  'Bağış Sepeti': 'bag-handle-outline',
  Hesabım: 'person-outline',
};

export default function TabBar({ state, descriptors, navigation }) {
  const { count } = useCart();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          const color = isFocused ? colors.brand : '#9CA3AF';
          const icon = iconByRoute[route.name] || 'ellipse-outline';

          return (
            <TouchableOpacity key={route.key} accessibilityRole="button" accessibilityState={isFocused ? { selected: true } : {}} accessibilityLabel={options.tabBarAccessibilityLabel} testID={options.tabBarTestID} onPress={onPress} style={styles.tab}>
              <View style={{ alignItems: 'center' }}>
                <View>
                  <Ionicons name={icon} size={22} color={color} />
                  {route.name === 'Bağış Sepeti' && count > 0 && (
                    <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>
                  )}
                </View>
                <Text style={[styles.label, { color }]}>{label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: 'transparent' },
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
  },
  tab: { flex: 1, alignItems: 'center' },
  label: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  badge: {
    position: 'absolute', right: -10, top: -6, backgroundColor: colors.brand, borderRadius: 10, paddingHorizontal: 5, height: 18, minWidth: 18, alignItems: 'center', justifyContent: 'center'
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});


