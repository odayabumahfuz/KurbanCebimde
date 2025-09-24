import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bildirim ayarları
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationData {
  type: 'kurban' | 'donation' | 'stream' | 'test';
  kurban_id?: string;
  amount?: number;
  donor?: string;
  stream_title?: string;
  timestamp: number;
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Push notification izinlerini iste ve token al
   */
  public async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications sadece fiziksel cihazlarda çalışır');
        return null;
      }

      // Mevcut izinleri kontrol et
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // İzin yoksa iste
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification izni verilmedi');
        return null;
      }

      // Expo push token al
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      
      // Token'ı local storage'a kaydet
      await AsyncStorage.setItem('expo_push_token', token.data);
      
      console.log('Expo Push Token:', token.data);
      return token.data;

    } catch (error) {
      console.error('Push notification kaydı hatası:', error);
      return null;
    }
  }

  /**
   * Kayıtlı token'ı al
   */
  public async getStoredToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('expo_push_token');
      this.expoPushToken = token;
      return token;
    } catch (error) {
      console.error('Token alınırken hata:', error);
      return null;
    }
  }

  /**
   * Token'ı backend'e gönder
   */
  public async sendTokenToBackend(userId: string): Promise<boolean> {
    try {
      const token = this.expoPushToken || await this.getStoredToken();
      
      if (!token) {
        console.log('Push token bulunamadı');
        return false;
      }

      // Backend'e token gönder (bu endpoint'i backend'de oluşturman gerekecek)
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/v1/user/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          expo_push_token: token,
          platform: Platform.OS,
        }),
      });

      if (response.ok) {
        console.log('Push token backend\'e gönderildi');
        return true;
      } else {
        console.error('Push token gönderilemedi:', response.status);
        return false;
      }

    } catch (error) {
      console.error('Push token gönderilirken hata:', error);
      return false;
    }
  }

  /**
   * Bildirim dinleyicilerini ayarla
   */
  public setupNotificationListeners() {
    // Uygulama açıkken gelen bildirimler
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Bildirim alındı:', notification);
      this.handleNotificationReceived(notification);
    });

    // Bildirime tıklanınca
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Bildirime tıklandı:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Gelen bildirimi işle
   */
  private handleNotificationReceived(notification: Notifications.Notification) {
    const data = notification.request.content.data as PushNotificationData;
    
    switch (data.type) {
      case 'kurban':
        console.log('Kurban bildirimi:', data);
        break;
      case 'donation':
        console.log('Bağış bildirimi:', data);
        break;
      case 'stream':
        console.log('Yayın bildirimi:', data);
        break;
      case 'test':
        console.log('Test bildirimi:', data);
        break;
    }
  }

  /**
   * Bildirime tıklanınca işle
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data as PushNotificationData;
    
    // Bildirim tipine göre yönlendirme yap
    switch (data.type) {
      case 'kurban':
        // Kurban detay sayfasına git
        console.log('Kurban sayfasına yönlendir:', data.kurban_id);
        break;
      case 'donation':
        // Bağış sayfasına git
        console.log('Bağış sayfasına yönlendir');
        break;
      case 'stream':
        // Yayın sayfasına git
        console.log('Yayın sayfasına yönlendir');
        break;
    }
  }

  /**
   * Test bildirimi gönder
   */
  public async sendTestNotification(): Promise<boolean> {
    try {
      const token = this.expoPushToken || await this.getStoredToken();
      
      if (!token) {
        console.log('Push token bulunamadı');
        return false;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/notifications/v1/test`, {
        method: 'GET',
      });

      if (response.ok) {
        console.log('Test bildirimi gönderildi');
        return true;
      } else {
        console.error('Test bildirimi gönderilemedi:', response.status);
        return false;
      }

    } catch (error) {
      console.error('Test bildirimi gönderilirken hata:', error);
      return false;
    }
  }

  /**
   * Bildirim kanallarını oluştur
   */
  public async createNotificationChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('kurban_notifications', {
        name: 'Kurban Bildirimleri',
        description: 'Kurban ile ilgili bildirimler',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('donation_notifications', {
        name: 'Bağış Bildirimleri',
        description: 'Bağış ile ilgili bildirimler',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('stream_notifications', {
        name: 'Yayın Bildirimleri',
        description: 'Canlı yayın ile ilgili bildirimler',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('test_notifications', {
        name: 'Test Bildirimleri',
        description: 'Test bildirimleri',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }

  /**
   * Bildirim izinlerini kontrol et
   */
  public async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('İzin kontrolü hatası:', error);
      return false;
    }
  }

  /**
   * Bildirim izinlerini iste
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('İzin isteği hatası:', error);
      return false;
    }
  }
}

// Singleton instance export
export const notificationService = NotificationService.getInstance();
