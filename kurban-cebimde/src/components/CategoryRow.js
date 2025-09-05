import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const bgByTone = {
  pink: '#FCE7F3',
  blue: '#DBEAFE',
  yellow: '#FEF3C7',
  green: '#DCFCE7',
  purple: '#EDE9FE',
  orange: '#FFEDD5',
  gray: '#E5E7EB',
};

export default function CategoryRow({ icon, label, tone = 'gray', onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: bgByTone[tone] || bgByTone.gray }]}> 
        <Ionicons name={icon} size={22} color={'#444'} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  label: { flex: 1, fontSize: 20, fontWeight: '600', color: '#111827' },
});


