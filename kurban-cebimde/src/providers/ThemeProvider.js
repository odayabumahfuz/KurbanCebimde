import React from 'react';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat';
import { View, ActivityIndicator, Text } from 'react-native';

export default function ThemeProvider({ children }) {
  const [loaded] = useFonts({ Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold });
  if (!loaded) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
  if (Text?.defaultProps == null) {
    Text.defaultProps = {};
  }
  Text.defaultProps.style = [{ fontFamily: 'Montserrat_400Regular' }, Text.defaultProps.style].filter(Boolean);
  return children;
}


