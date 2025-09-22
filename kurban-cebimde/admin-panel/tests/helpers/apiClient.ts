import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Guard against localhost usage in domain-only mode
    if (process.env.E2E_TEST === 'true' && baseURL.includes('localhost')) {
      throw new Error('E2E tests should not use localhost in domain-only mode');
    }

    // Response interceptor to validate JSON responses
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const contentType = response.headers['content-type'];
        if (contentType && !contentType.includes('application/json')) {
          throw new Error(`Expected JSON response but got ${contentType}`);
        }
        return response;
      },
      (error) => {
        if (error.response?.data && typeof error.response.data === 'string') {
          if (error.response.data.includes('<!doctype html>')) {
            throw new Error('Received HTML response instead of JSON - check API endpoint');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // Stream testing endpoints
  async getStreamState(streamId: string): Promise<any> {
    return this.get(`/testing/streams/${streamId}/state`);
  }

  async getLastNotification(userId: string): Promise<any> {
    return this.get(`/testing/notifications/last?userId=${userId}`);
  }

  // Donation endpoints
  async getDonations(params?: any): Promise<any> {
    return this.get('/donations', params);
  }

  async createDonation(data: any): Promise<any> {
    return this.post('/donations', data);
  }

  // Stream endpoints
  async createStream(data: any): Promise<any> {
    return this.post('/streams', data);
  }

  async startStream(streamId: string): Promise<any> {
    return this.post(`/streams/${streamId}/start`);
  }

  async endStream(streamId: string): Promise<any> {
    return this.post(`/streams/${streamId}/end`);
  }
}

export const createApiClient = (baseURL: string) => new ApiClient(baseURL);
