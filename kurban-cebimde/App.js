import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Constants from 'expo-constants';
import { NativeModules } from 'react-native';
import { registerGlobals, AudioSession } from '@livekit/react-native';

import ThemeProvider from './src/providers/ThemeProvider';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LanguageProvider } from './src/context/LanguageContext';
import TabBar from './src/components/TabBar';
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DonateScreen from './src/screens/DonateScreen';
import CartScreen from './src/screens/CartScreen';
import AccountScreen from './src/screens/AccountScreen';
import LiveStreamsScreen from './src/screens/LiveStreamsScreen';
import LiveStreamScreen from './src/screens/LiveStreamScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MyDonationsScreen from './src/screens/MyDonationsScreen';
// import CertificatesScreen from './src/screens/CertificatesScreen';
import MyCardsScreen from './src/screens/MyCardsScreen';
// import ReportsScreen from './src/screens/ReportsScreen';
import BroadcastHistoryScreen from './src/screens/BroadcastHistoryScreen';
import MediaPackageScreen from './src/screens/MediaPackageScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import WatchLiveScreen from './src/screens/WatchLiveScreen';
import StartLiveScreen from './src/screens/StartLiveScreen';
import LiveKitStreamScreen from './src/screens/LiveKitStreamScreen';
import LiveKitStreamsScreen from './src/screens/LiveKitStreamsScreen';
import AdminDonationsScreen from './src/screens/AdminDonationsScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import AdminStreamStartScreen from './src/screens/AdminStreamStartScreen';
import AdminLiveScreen from './src/screens/AdminLiveScreen';
import StreamsScreen from './src/screens/StreamsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function RootTabs() {
  const { user } = useAuth();
  
  // Admin kullanıcıları için farklı tab yapısı
  if (user?.is_admin || user?.is_super_admin) {
    return (
      <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
        <Tab.Screen name="Anasayfa" component={AdminHomeScreen} />
        <Tab.Screen name="Yayın" component={AdminLiveScreen} />
        <Tab.Screen name="Profil" component={AccountScreen} />
      </Tab.Navigator>
    );
  }
  
  // Normal kullanıcılar için standart tab yapısı
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Anasayfa" component={HomeScreen} />
      <Tab.Screen name="Bağış Yap" component={DonateScreen} />
      <Tab.Screen name="Bağış Sepeti" component={CartScreen} />
      <Tab.Screen name="Hesabım" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="RootTabs" component={RootTabs} />
          <Stack.Screen name="Canlı Yayınlar" component={LiveStreamsScreen} />
          <Stack.Screen name="Canlı Yayın" component={LiveStreamScreen} />
          <Stack.Screen name="WatchLive" component={WatchLiveScreen} />
          <Stack.Screen name="Profil" component={ProfileScreen} />
          <Stack.Screen name="Ayarlarım" component={SettingsScreen} />
          <Stack.Screen name="Bağışlarım" component={MyDonationsScreen} />
          {/* Sertifikalar kaldırıldı */}
          <Stack.Screen name="Kartlarım" component={MyCardsScreen} />
          {/* Raporlar kaldırıldı */}
          <Stack.Screen name="Yayın Geçmişi" component={BroadcastHistoryScreen} />
          <Stack.Screen name="Medya Paketi" component={MediaPackageScreen} />
          <Stack.Screen name="Kurban" component={DonateScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="StartLive" component={StartLiveScreen} />
          <Stack.Screen name="LiveKitStream" component={LiveKitStreamScreen} />
          <Stack.Screen name="LiveKitStreams" component={LiveKitStreamsScreen} />
          <Stack.Screen name="AdminDonations" component={AdminDonationsScreen} />
          <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
          <Stack.Screen name="AdminStreamStart" component={AdminStreamStartScreen} />
          <Stack.Screen name="Streams" component={StreamsScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

// WebRTC global'lerini register et
registerGlobals();

export default function App() {
  useEffect(() => {
    // Native modül testi
    console.log('🔍 Native Modül Testi:');
    console.log('Has LiveKit native? ->', !!NativeModules.LiveKitReactNative);
    console.log('Has WebRTC native?  ->', !!NativeModules.WebRTCModule);
    console.log('Has RTCPeerConnection global? ->', !!global.RTCPeerConnection);
    
    // Audio session'ı başlat
    AudioSession.startAudioSession();
    console.log('✅ WebRTC globals register edildi, AudioSession başlatıldı');
    
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
