import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Certificate {
  id: string;
  user_id: string;
  kurban_id: string;
  certificate_type: 'kurban' | 'bagis' | 'katilim';
  title: string;
  description: string;
  issued_date: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'revoked';
  verification_code: string;
  qr_code_url?: string;
  pdf_url?: string;
  metadata: Record<string, any>;
}

export interface CertificateStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  by_type: Record<string, number>;
}

export interface CreateCertificateRequest {
  user_id: string;
  kurban_id: string;
  certificate_type: 'kurban' | 'bagis' | 'katilim';
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export class CertificateService {
  private static instance: CertificateService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${process.env.EXPO_PUBLIC_API_BASE}/api/certificates/v1`;
  }

  public static getInstance(): CertificateService {
    if (!CertificateService.instance) {
      CertificateService.instance = new CertificateService();
    }
    return CertificateService.instance;
  }

  /**
   * Yeni sertifika oluştur
   */
  public async createCertificate(request: CreateCertificateRequest): Promise<Certificate | null> {
    try {
      const response = await fetch(`${this.baseUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        console.error('Sertifika oluşturulamadı:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Sertifika oluşturulurken hata:', error);
      return null;
    }
  }

  /**
   * Sertifika detaylarını getir
   */
  public async getCertificate(certId: string): Promise<Certificate | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${certId}`);

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else if (response.status === 404) {
        console.log('Sertifika bulunamadı');
        return null;
      } else {
        console.error('Sertifika getirilemedi:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Sertifika getirilirken hata:', error);
      return null;
    }
  }

  /**
   * Kullanıcının sertifikalarını getir
   */
  public async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`);

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        console.error('Kullanıcı sertifikaları getirilemedi:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Kullanıcı sertifikaları getirilirken hata:', error);
      return [];
    }
  }

  /**
   * Sertifika doğrula
   */
  public async verifyCertificate(verificationCode: string): Promise<Certificate | null> {
    try {
      const response = await fetch(`${this.baseUrl}/verify/${verificationCode}`);

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else if (response.status === 404) {
        console.log('Geçersiz doğrulama kodu');
        return null;
      } else {
        console.error('Sertifika doğrulanamadı:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Sertifika doğrulanırken hata:', error);
      return null;
    }
  }

  /**
   * Sertifikayı iptal et
   */
  public async revokeCertificate(certId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${certId}/revoke`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Sertifika iptal edildi');
        return true;
      } else if (response.status === 404) {
        console.log('Sertifika bulunamadı');
        return false;
      } else {
        console.error('Sertifika iptal edilemedi:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Sertifika iptal edilirken hata:', error);
      return false;
    }
  }

  /**
   * Tüm sertifikaları getir (filtreleme ile)
   */
  public async getAllCertificates(
    skip: number = 0,
    limit: number = 100,
    status?: string,
    certificateType?: string
  ): Promise<Certificate[]> {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      if (status) params.append('status', status);
      if (certificateType) params.append('certificate_type', certificateType);

      const response = await fetch(`${this.baseUrl}/?${params}`);

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        console.error('Sertifikalar getirilemedi:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Sertifikalar getirilirken hata:', error);
      return [];
    }
  }

  /**
   * Sertifika istatistikleri
   */
  public async getCertificateStats(): Promise<CertificateStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/overview`);

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        console.error('İstatistikler getirilemedi:', response.status);
        return null;
      }
    } catch (error) {
      console.error('İstatistikler getirilirken hata:', error);
      return null;
    }
  }

  /**
   * Sertifika PDF'ini indir
   */
  public async downloadCertificatePdf(certId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${certId}/download`);

      if (response.ok) {
        const result = await response.json();
        return result.download_url;
      } else {
        console.error('PDF indirilemedi:', response.status);
        return null;
      }
    } catch (error) {
      console.error('PDF indirilirken hata:', error);
      return null;
    }
  }

  /**
   * Örnek sertifikaları getir (test için)
   */
  public async getSampleCertificates(): Promise<Certificate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/mock/sample`);

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        console.error('Örnek sertifikalar getirilemedi:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Örnek sertifikalar getirilirken hata:', error);
      return [];
    }
  }

  /**
   * Mock sertifika oluştur (test için)
   */
  public async generateMockCertificate(): Promise<Certificate | null> {
    try {
      const response = await fetch(`${this.baseUrl}/mock/generate`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        console.error('Mock sertifika oluşturulamadı:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Mock sertifika oluşturulurken hata:', error);
      return null;
    }
  }

  /**
   * Sertifikaları local storage'a kaydet
   */
  public async saveCertificatesToStorage(certificates: Certificate[]): Promise<void> {
    try {
      await AsyncStorage.setItem('user_certificates', JSON.stringify(certificates));
    } catch (error) {
      console.error('Sertifikalar kaydedilemedi:', error);
    }
  }

  /**
   * Local storage'dan sertifikaları al
   */
  public async getCertificatesFromStorage(): Promise<Certificate[]> {
    try {
      const stored = await AsyncStorage.getItem('user_certificates');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Sertifikalar alınamadı:', error);
      return [];
    }
  }

  /**
   * Sertifika tipine göre ikon getir
   */
  public getCertificateIcon(type: string): string {
    switch (type) {
      case 'kurban':
        return '🐑';
      case 'bagis':
        return '💰';
      case 'katilim':
        return '📜';
      default:
        return '📄';
    }
  }

  /**
   * Sertifika durumuna göre renk getir
   */
  public getCertificateStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return '#4CAF50'; // Yeşil
      case 'expired':
        return '#FF9800'; // Turuncu
      case 'revoked':
        return '#F44336'; // Kırmızı
      default:
        return '#9E9E9E'; // Gri
    }
  }

  /**
   * Sertifika durumuna göre metin getir
   */
  public getCertificateStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'expired':
        return 'Süresi Dolmuş';
      case 'revoked':
        return 'İptal Edilmiş';
      default:
        return 'Bilinmiyor';
    }
  }
}

// Singleton instance export
export const certificateService = CertificateService.getInstance();
