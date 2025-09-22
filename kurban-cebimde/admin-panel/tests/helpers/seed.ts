import { ApiClient } from './apiClient';

export interface DonationData {
  userName: string;
  userId: string;
  animal: string;
  amount?: number;
  status?: string;
}

export class SeedHelper {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async ensureDonationExists(): Promise<any> {
    // Check if there's already a pending donation
    const donations = await this.apiClient.getDonations({ 
      status: 'pending', 
      limit: 1 
    });

    if (donations.items && donations.items.length > 0) {
      console.log('✅ Found existing pending donation:', donations.items[0].id);
      return donations.items[0];
    }

    // Create a new test donation
    const donationData: DonationData = {
      userName: 'Test User',
      userId: 'test-user-123',
      animal: 'koyun',
      amount: 1000,
      status: 'pending'
    };

    console.log('🌱 Creating new test donation...');
    const donation = await this.apiClient.createDonation(donationData);
    console.log('✅ Created test donation:', donation.id);
    
    return donation;
  }

  async createTestDonation(data: DonationData): Promise<any> {
    return this.apiClient.createDonation(data);
  }

  async cleanupTestDonation(donationId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/donations/${donationId}`);
      console.log('🧹 Cleaned up test donation:', donationId);
    } catch (error) {
      console.warn('⚠️ Failed to cleanup donation:', donationId, error);
    }
  }

  async cleanupTestStream(streamId: string): Promise<void> {
    try {
      await this.apiClient.endStream(streamId);
      console.log('🧹 Cleaned up test stream:', streamId);
    } catch (error) {
      console.warn('⚠️ Failed to cleanup stream:', streamId, error);
    }
  }
}

export const createSeedHelper = (apiClient: ApiClient) => new SeedHelper(apiClient);
