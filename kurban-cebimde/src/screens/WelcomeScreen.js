import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const features = [
    {
      icon: 'heart',
      color: '#22C55E',
      text: 'Bağışlarınızı yönetme',
    },
    {
      icon: 'gift',
      color: '#3B82F6',
      text: 'Yetimlere sponsor olma',
    },
    {
      icon: 'moon',
      color: '#F59E0B',
      text: 'Kurban hisselerinizi yönetme',
    },
    {
      icon: 'flash',
      color: '#8B5CF6',
      text: 'Hızlı ve kolay bağış yapma',
    },
    {
      icon: 'help-circle',
      color: '#EF4444',
      text: 'Destek talebi oluşturma',
    },
    {
      icon: 'checkmark-circle',
      color: '#22C55E',
      text: 'Otomatik bilgi doldurma',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
                 <View style={styles.content}>
           {/* Welcome Card */}
           <View style={styles.welcomeCard}>
             {/* Logo inside the card */}
             <View style={styles.logoSection}>
               <Image 
                 source={require('../../assets/kurbancebimdelogo1.png')} 
                 style={styles.logo} 
                 resizeMode="contain" 
               />
             </View>
             
             <Text style={styles.welcomeTitle}>Hoşgeldiniz</Text>
            <Text style={styles.welcomeSubtitle}>
              Oturum açarak ya da yeni bir hesap oluşturarak kullanabileceğiniz özellikler:
            </Text>

            {/* Features List */}
            <View style={styles.featuresList}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                    <Ionicons name={feature.icon} size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Ionicons name="person" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Oturum Aç / Kaydol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
  },
  logo: {
    width: 150,
    height: 150,
  },
  welcomeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 24,
    marginBottom: height * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresList: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
