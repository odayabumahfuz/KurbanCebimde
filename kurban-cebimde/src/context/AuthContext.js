import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Uygulama başladığında token kontrolü
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('access');
      if (storedToken) {
        setToken(storedToken);
        // Token ile kullanıcı bilgilerini al
        await fetchCurrentUser(storedToken);
      }
    } catch (error) {
      console.error('Token kontrol hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async (authToken) => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data) {
        setUser({ ...response.data, token: authToken });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      // Token geçersizse temizle ama sonsuz döngüyü önle
      if (error.response?.status === 401) {
        // Sadece token'ları temizle, logout fonksiyonunu çağırma
        await SecureStore.deleteItemAsync('access');
        await SecureStore.deleteItemAsync('refresh');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };

  const login = async (phone, password) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({
        phone: phone, // Backend phone ile giriş yapıyor
        password: password
      });

      // authAPI.login normalize obje döndürüyor
      const { access_token, refresh_token } = response || {};
      if (!access_token) {
        console.log('⚠️ LOGIN_UNEXPECTED_RESPONSE_IN_CTX', response);
        throw new Error('Giriş başarısız');
      }

      // Token'ları sakla (SecureStore kullan)
      await SecureStore.setItemAsync('access', String(access_token));
      if (refresh_token) {
        await SecureStore.setItemAsync('refresh', String(refresh_token));
      }
      setToken(String(access_token));
      // Global erişim: CartContext backend'e post atsın
      try { global.accessTokenForCart = String(access_token); } catch {}

      // Kullanıcı bilgilerini API'den çek
      await fetchCurrentUser(String(access_token));
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login hatası:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Giriş yapılamadı' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      // Kayıt sonrası otomatik giriş yapma, sadece başarı mesajı döndür
      return { success: true, data: response };
    } catch (error) {
      console.error('Kayıt hatası:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Kayıt yapılamadı' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('access');
      await SecureStore.deleteItemAsync('refresh');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.data) {
        setUser(response.data);
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Profil güncellenemedi' 
      };
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    fetchCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
