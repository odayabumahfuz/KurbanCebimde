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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (phoneNumber.length < 10) {
      Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası giriniz.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Tam telefon numarasını oluştur
      const fullPhoneNumber = `+90${phoneNumber}`;
      const result = await login(fullPhoneNumber, password);
      if (result.success) {
        // Başarılı giriş - authentication state değişecek ve otomatik yönlendirilecek
        console.log('✅ Login başarılı, authentication state değişecek');
      } else {
        Alert.alert('Hata', result.error || 'Giriş yapılamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş sırasında bir hata oluştu');
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

  const renderLoginForm = () => (
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
            <Ionicons name="person" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.stepTitle}>Giriş Yap</Text>
          <Text style={styles.stepDescription}>
            Kurban bağışı yapabilmek için bilgilerinizi giriniz
          </Text>
        </View>

        <View style={styles.inputContainer}>
          {/* Phone Number Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={24} color="#6B7280" />
            <Text style={styles.countryCodeText}>+90</Text>
            <TextInput
              style={styles.textInput}
              placeholder="5XX XXX XX XX"
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, ''))}
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={24} color="#6B7280" />
            <TextInput
              style={styles.textInput}
              placeholder="Şifre"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoCapitalize="none"
              maxLength={50}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>Giriş Yapılıyor...</Text>
            ) : (
              <>
                <Ionicons name="log-in" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Giriş Yap</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.registerLink}>
          <Text style={styles.registerText}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLinkText}>Hesap Oluştur</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gradient}>
              <View style={styles.header}>
                <Image 
                  source={require('../../assets/kurbancebimdelogo1.png')} 
                  style={styles.logo} 
                  resizeMode="contain" 
                />
                <Text style={styles.appName}>Kurban Cebimde</Text>
                <Text style={styles.appSubtitle}>Güvenli ve Kolay Kurban Bağışı</Text>
              </View>

              {renderLoginForm()}

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Güvenli giriş için kişisel bilgilerinizi kullanıyoruz
                </Text>
                <View style={styles.securityIcons}>
                  <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                  <Text style={styles.securityText}>SSL Güvenli</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

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
    minHeight: height,
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.06,
    paddingBottom: height * 0.04,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: height * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIndicator: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.7,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  countryCodeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginRight: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  disabledResendButton: {
    opacity: 0.5,
  },
  resendText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  disabledResendText: {
    color: '#9CA3AF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  registerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  registerLinkText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: height * 0.04,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  securityIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});
