import { ApiClient } from './apiClient';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export class AuthHelper {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async loginAdmin(credentials: AuthCredentials): Promise<string> {
    const response = await this.apiClient.post<AuthResponse>('/auth/login', {
      phoneOrEmail: credentials.email,
      password: credentials.password,
    });
    
    return response.access_token;
  }

  async loginUser(credentials: AuthCredentials): Promise<string> {
    const response = await this.apiClient.post<AuthResponse>('/auth/login', {
      phoneOrEmail: credentials.email,
      password: credentials.password,
    });
    
    return response.access_token;
  }

  async refreshToken(refreshToken: string): Promise<string> {
    const response = await this.apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    return response.access_token;
  }

  async logout(): Promise<void> {
    await this.apiClient.post('/auth/logout');
  }
}

export const createAuthHelper = (apiClient: ApiClient) => new AuthHelper(apiClient);
