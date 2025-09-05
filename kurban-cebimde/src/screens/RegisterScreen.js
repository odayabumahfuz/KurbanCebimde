import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const inFlight = useRef(null); // yeniden tıklama koruması

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!firstName.trim()) {
      Alert.alert('Hata', 'Lütfen adınızı giriniz.');
      return;
    }
    
    if (!lastName.trim()) {
      Alert.alert('Hata', 'Lütfen soyadınızı giriniz.');
      return;
    }
    
    // Telefon numarası validation - 5 ile başlayan 10 haneli olmalı
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !cleanPhone.startsWith('5')) {
      Alert.alert('Hata', 'Telefon numarası 5 ile başlayan 10 haneli olmalıdır (5XX XXX XX XX)');
      return;
    }

    if (email && !email.includes('@')) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (!password || password.length < 8) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    // Double submit koruması
    if (isLoading || inFlight.current) return;

    setIsLoading(true);
    
    try {
      const userData = {
        name: firstName.trim(),
        surname: lastName.trim(),
        phone: cleanPhone, // Temizlenmiş telefon numarası
        email: email.trim() || null, // E-posta opsiyonel
        password: password,
      };

      console.log('🔍 Kayıt isteği gönderiliyor...', userData);
      
      // Gerçek API çağrısı
      const result = await register(userData);
      
      if (result.success) {
        console.log('✅ Kayıt başarılı:', result.data);
        
        Alert.alert('Başarılı', 'Hesabınız oluşturuldu! Giriş yapabilirsiniz.', [
          { text: 'Tamam', onPress: () => navigation.replace('Login') }
        ]);
      } else {
        throw new Error(result.error || 'Kayıt yapılamadı');
      }
      
    } catch (error) {
      inFlight.current = null;
      console.error('❌ Kayıt hatası:', error);
      
      // Artık gerçek hatayı gösterelim:
      if (error?.name === 'AbortError') {
        Alert.alert('Bağlantı kesildi', 'İstek iptal oldu veya zaman aşımına uğradı.');
      } else if (error?.response) {
        const { status, data } = error.response;
        const errorMessage = typeof data === 'string' ? data : data?.detail || JSON.stringify(data);
        Alert.alert(`Sunucu Hatası (${status})`, errorMessage);
      } else if (error?.message?.includes('Network request failed')) {
        Alert.alert('Hata', 'Backend bağlantısı kurulamadı. Lütfen backend\'in çalıştığından emin olun.');
      } else {
        Alert.alert('Hata', error?.message || 'Bilinmeyen hata');
      }
      
      console.log('REGISTER_ERROR', JSON.stringify(error, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `+${cleaned}`;
    if (cleaned.length <= 6) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.gradient}>
            <View style={styles.header}>
                             <Image 
                 source={require('../../assets/kurbancebimdelogo1.png')} 
                 style={styles.logo} 
                 resizeMode="contain" 
               />
            </View>

            <Animated.View 
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIndicator}>
                    <Ionicons name="person-add" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.stepTitle}>Yeni Hesap</Text>
                  <Text style={styles.stepDescription}>
                    Kurban bağışı yapabilmek için hesap oluşturunuz
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={24} color="#6B7280" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Adınız"
                      placeholderTextColor="#9CA3AF"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoFocus
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={24} color="#6B7280" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Soyadınız"
                      placeholderTextColor="#9CA3AF"
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="call-outline" size={24} color="#6B7280" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="5XX XXX XX XX"
                      placeholderTextColor="#9CA3AF"
                      value={phone}
                      onChangeText={(text) => setPhone(formatPhoneNumber(text))}
                      keyboardType="phone-pad"
                      maxLength={15}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={24} color="#6B7280" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="E-posta Adresi (Opsiyonel)"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={24} color="#6B7280" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Şifre"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={24} color="#6B7280" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Şifre Tekrar"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.primaryButton, isLoading && styles.disabledButton]}
                    onPress={handleRegister}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Text style={styles.buttonText}>Hesap Oluşturuluyor...</Text>
                    ) : (
                      <>
                        <Ionicons name="person-add" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Hesap Oluştur</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.loginLink}>
                  <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLinkText}>Giriş Yap</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Güvenli hesap oluşturma için tüm bilgileriniz şifrelenir
              </Text>
              <View style={styles.securityIcons}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.securityText}>SSL Güvenli</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.02,
    paddingBottom: height * 0.01,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },


  formContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  eyeButton: {
    padding: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: height * 0.03,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  securityIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
});
