import React, { useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Animated } from 'react-native';

export default function AnimalCard({ name, color = '#F1F5F9', onPress, image }) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  }
  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    onPress?.();
  }

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }] }>
      <TouchableOpacity activeOpacity={0.9} onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ flex: 1 }}>
        <ImageBackground source={image} style={styles.bg} imageStyle={styles.bgImage} resizeMode="cover">
          <View style={styles.overlay} />
          <Text style={styles.title}>{name[0].toUpperCase() + name.slice(1)}</Text>
          <View style={styles.selectBtn}><Text style={styles.selectText}>Seç</Text></View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    height: 160,
  },
  bg: { flex: 1, justifyContent: 'flex-end', padding: 12 },
  bgImage: { resizeMode: 'cover', width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  title: { fontWeight: '800', fontSize: 16, color: '#fff' },
  selectBtn: { backgroundColor: 'rgba(255,255,255,0.95)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginTop: 8 },
  selectText: { fontWeight: '700', color: '#111827' },
});


