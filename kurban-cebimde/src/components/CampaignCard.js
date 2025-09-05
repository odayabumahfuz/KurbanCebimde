import React from 'react';
import { Text, StyleSheet, ImageBackground, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CampaignCard({ title, image, onDonate }) {
  return (
    <ImageBackground source={image} style={styles.card} imageStyle={styles.img}>
      <LinearGradient colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.55)"]} style={styles.gradient} />
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity style={styles.cta} onPress={onDonate}>
        <Text style={styles.ctaText}>Bağış Yap</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: { width: 320, height: 200, borderRadius: 20, overflow: 'hidden', justifyContent: 'flex-end', padding: 16 },
  img: { resizeMode: 'cover' },
  gradient: { ...StyleSheet.absoluteFillObject },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  cta: { backgroundColor: '#F4C20D', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, marginTop: 10 },
  ctaText: { color: '#111', fontWeight: '800' },
});


