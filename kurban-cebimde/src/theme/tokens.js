import { colors } from './colors';
import { StyleSheet } from 'react-native';

export const tokens = {
  radii: {
    xl: 28,
    lg: 22,
    md: 16,
    sm: 12,
    full: 999,
  },
  stroke: {
    width: StyleSheet.hairlineWidth,
    color: colors.border,
  },
};

export const radii = tokens.radii;
export const stroke = tokens.stroke;


