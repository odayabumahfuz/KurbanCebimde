import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';
import { font } from '../theme/typography';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const iconByRoute = {
  Anasayfa: 'home-outline',
  'Bağış Yap': 'heart-outline',
  'Bağış Sepeti': 'bag-handle-outline',
  Hesabım: 'person-outline',
  Yayın: 'videocam-outline',
  Profil: 'person-outline',
};

export default function TabBar({ state, descriptors, navigation }) {
  const { count } = useCart();
  const { t } = useLanguage();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          // Dil desteği için label çevirisi
          const getTranslatedLabel = (routeName) => {
            const translations = {
              'Anasayfa': t('home.navigation.home'),
              'Bağış Yap': t('home.navigation.donate'),
              'Bağış Sepeti': t('home.navigation.cart'),
              'Hesabım': t('home.navigation.account'),
              'Yayın': t('home.navigation.streams'),
              'Profil': t('home.navigation.profile')
            };
            return translations[routeName] || routeName;
          };

          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : getTranslatedLabel(route.name);

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
  wrapper: { 
    backgroundColor: 'transparent', 
    borderTopWidth: 0,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 10,
    elevation: 0,
    borderTopLeftRadius: tokens.radii.xl,
    borderTopRightRadius: tokens.radii.xl,
    borderWidth: tokens.stroke.width,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },
  tab: { 
    flex: 1, 
    alignItems: 'center',
  },
  label: { 
    fontSize: 12, 
    marginTop: 6, 
    fontWeight: '700',
    fontFamily: font.bold,
  },
  badge: {
    position: 'absolute', 
    right: -10, 
    top: -6, 
    backgroundColor: colors.danger, 
    borderRadius: 10, 
    paddingHorizontal: 5, 
    height: 18, 
    minWidth: 18, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  badgeText: { 
    color: '#fff', 
    fontSize: 11, 
    fontWeight: '700',
    fontFamily: font.bold,
  },
});


