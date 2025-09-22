import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { t, changeLanguage, getCurrentLanguage, availableLanguages } = useLanguage();
  const currentLang = getCurrentLanguage();

  const handleLanguageChange = (languageCode) => {
    Alert.alert(
      t('settings.language'),
      `${t('settings.languages.' + languageCode)} diline geçmek istediğinizden emin misiniz?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          onPress: () => {
            changeLanguage(languageCode);
            Alert.alert(t('common.success'), 'Dil başarıyla değiştirildi!');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Dil Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.languageContainer}>
          {availableLanguages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                currentLang.code === lang.code && styles.languageOptionActive
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={[
                  styles.languageName,
                  currentLang.code === lang.code && styles.languageNameActive
                ]}>
                  {lang.name}
                </Text>
                <Text style={[
                  styles.languageCode,
                  currentLang.code === lang.code && styles.languageCodeActive
                ]}>
                  {lang.code.toUpperCase()}
                </Text>
              </View>
              {currentLang.code === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color="#ef4444" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Diğer Ayarlar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={24} color="#6b7280" />
            <Text style={styles.settingText}>{t('settings.darkMode')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color="#6b7280" />
            <Text style={styles.settingText}>{t('settings.pushNotifications')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail" size={24} color="#6b7280" />
            <Text style={styles.settingText}>{t('settings.emailNotifications')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="shield-checkmark" size={24} color="#6b7280" />
            <Text style={styles.settingText}>{t('settings.privacyPolicy')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="document-text" size={24} color="#6b7280" />
            <Text style={styles.settingText}>{t('settings.termsOfService')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="information-circle" size={24} color="#6b7280" />
            <Text style={styles.settingText}>{t('settings.appInfo')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="star" size={24} color="#6b7280" />
            <Text style={styles.settingText}>{t('settings.rateApp')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Alt boşluk */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  languageContainer: {
    gap: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  languageNameActive: {
    color: '#ef4444',
    fontWeight: '600',
  },
  languageCode: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  languageCodeActive: {
    color: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
  },
  bottomSpacer: {
    height: 40,
  },
});