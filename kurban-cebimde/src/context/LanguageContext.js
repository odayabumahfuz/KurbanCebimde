import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Dil dosyalarını import et
import trTranslations from '../locales/tr.json';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

const LanguageContext = createContext();

const translations = {
  tr: trTranslations,
  en: enTranslations,
  ar: arTranslations,
};

const STORAGE_KEY = 'app_language';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tr');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage);
      } else {
        // Cihazın dilini algıla
        const deviceLanguage = Localization.locale?.split('-')[0] || 'tr';
        if (translations[deviceLanguage]) {
          setLanguage(deviceLanguage);
        } else {
          setLanguage('tr'); // Varsayılan dil
        }
      }
    } catch (error) {
      console.error('Dil yükleme hatası:', error);
      setLanguage('tr');
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      if (translations[newLanguage]) {
        await AsyncStorage.setItem(STORAGE_KEY, newLanguage);
        setLanguage(newLanguage);
      }
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
    }
  };

  const t = (key, params = {}) => {
    if (!key) return '';
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        // Fallback to Turkish
        translation = translations.tr;
        for (const fallbackKey of keys) {
          if (translation && translation[fallbackKey]) {
            translation = translation[fallbackKey];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }
    
    // Replace parameters if any
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => params[param] || match);
    }
    
    return translation || key;
  };

  const getCurrentLanguage = () => {
    return {
      code: language,
      name: translations[language]?.settings?.languages?.[language] || language.toUpperCase(),
      isRTL: language === 'ar'
    };
  };

  const value = {
    language,
    changeLanguage,
    t,
    getCurrentLanguage,
    isLoading,
    availableLanguages: [
      { code: 'tr', name: 'Türkçe', isRTL: false },
      { code: 'en', name: 'English', isRTL: false },
      { code: 'ar', name: 'العربية', isRTL: true }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
