import React from 'react';
import { Text, StyleSheet, ImageBackground, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';

export default function CampaignCard({ title, image, onDonate }) {
  return (
    <View style={styles.card}>
      <ImageBackground source={image} style={styles.imageContainer} imageStyle={styles.img}>
        <View style={styles.contentOverlay}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity style={styles.cta} onPress={onDonate}>
            <Text style={styles.ctaText}>Bağış Yap</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: colors.surface, 
    borderRadius: tokens.radii.lg, 
    overflow: 'hidden', 
    borderWidth: tokens.stroke.width, 
    borderColor: colors.border, 
    width: 320,
    height: 200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16
  },
  img: { 
    resizeMode: 'cover',
    borderRadius: tokens.radii.lg
  },
  contentOverlay: {
    flex: 1,
    justifyContent: 'space-between'
  },
  title: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#1f2937',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  cta: { 
    backgroundColor: '#8b4513',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 8,
    minWidth: 120
  },
  ctaText: { 
    color: '#fff', 
    fontWeight: '800',
    fontSize: 14
  },
});


