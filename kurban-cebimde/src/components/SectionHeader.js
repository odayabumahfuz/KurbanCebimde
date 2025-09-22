import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';

export default function SectionHeader({ title, right }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 28, marginBottom: 6,
    borderBottomWidth: tokens.stroke.width, borderColor: colors.border, paddingBottom: 8
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
});


