import React from 'react';
import { View } from 'react-native';

export default function BgPattern() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
      <View style={{ position: 'absolute', inset: 0, backgroundColor: 'transparent' }} />
      {/* Üst sağ halka (daha küçük ve biraz daha belirgin) */}
      <View style={{ position: 'absolute', width: 460, height: 460, borderRadius: 230, borderWidth: 80, borderColor: 'rgba(0,0,0,0.065)', top: -120, right: -100 }} />
      {/* Alt sol halka */}
      <View style={{ position: 'absolute', width: 520, height: 520, borderRadius: 260, borderWidth: 90, borderColor: 'rgba(0,0,0,0.05)', bottom: -160, left: -140 }} />
    </View>
  );
}


