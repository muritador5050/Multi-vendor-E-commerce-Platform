// ApiService.ts
import type { User } from '@/type/auth';

// API Configuration
export const apiBase = import.meta.env.VITE_API_URL;

// Generic API response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Auth-specific types
interface AuthResponse {
  user: User;
  accessToken: string;
}

interface AuthTokenResponse {
  accessToken: string;
}

interface ProfileResponse {
  user: User;
  profileCompletion?: number;
}

// Custom error classes
export class ApiError extends Error {
  public status: number;
  public response?: Response;

  constructor(message: string, status: number, response?: Response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

class ApiService {
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  private async refreshToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async _performRefresh(): Promise<string> {
    try {
      const response = await fetch(`${apiBase}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new ApiError('Token refresh failed', response.status, response);
      }

      const data: AuthTokenResponse = await response.json();
      // Store the new access token
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        console.log(
          '✅ New access token stored:',
          data.accessToken.substring(0, 20) + '...'
        );
      }
      return data.accessToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      localStorage.removeItem('accessToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/account';
      }
      throw new ApiError('Session expired. Please login again.', 401);
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, keep the original error message
      }
      throw new ApiError(errorMessage, response.status, response);
    }

    try {
      return await response.json();
    } catch {
      throw new ApiError('Invalid JSON response', 500, response);
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    };

    console.log(`🔄 Making request to: ${endpoint}`);
    console.log(
      `🔑 Using token: ${token ? token.substring(0, 20) + '...' : 'None'}`
    );

    try {
      const response = await fetch(`${apiBase}${endpoint}`, config);

      if (
        response.status === 401 &&
        !endpoint.includes('/auth/refresh-token')
      ) {
        console.log('🔄 401 detected, attempting token refresh...');
        try {
          const newToken = await this.refreshToken();

          const retryConfig: RequestInit = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };

          console.log('🔄 Retrying request with new token...');
          const retryResponse = await fetch(
            `${apiBase}${endpoint}`,
            retryConfig
          );
          return this.handleResponse<T>(retryResponse);
        } catch (refreshError) {
          console.error('❌ Token refresh and retry failed:', refreshError);
          throw new ApiError('Authentication failed', 401, response);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Unable to connect to server');
      }
      throw new ApiError('An unexpected error occurred', 500);
    }
  }

  // Auth methods
  async register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
  }

  async registerVendor(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>('/auth/vendor-register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
  }

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.request<ApiResponse<AuthResponse>>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );

      // Store access token after successful login
      if (response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        console.log('✅ Access token stored after login');
        console.log(
          '✅ Token preview:',
          response.data.accessToken.substring(0, 20) + '...'
        );
      }
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await this.request<ApiResponse<null>>('/auth/logout', {
        method: 'POST',
      });
      localStorage.removeItem('accessToken');
      console.log('✅ Logged out and access token removed');
      return response;
    } catch (error) {
      // Always clear token even if logout request fails
      localStorage.removeItem('accessToken');
      console.log(
        '✅ Access token removed (logout request failed but token cleared)'
      );
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(
    token: string,
    password: string
  ): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/auth/verify/${token}`, {
      method: 'GET',
    });
  }

  async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    return this.request<ApiResponse<ProfileResponse>>('/auth/profile');
  }

  async updateProfile(
    data: Partial<User>
  ): Promise<ApiResponse<ProfileResponse>> {
    return this.request<ApiResponse<ProfileResponse>>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Utility
  async uploadFile<T = unknown>(
    file: File,
    endpoint: string = '/upload'
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  getCurrentToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    const token = this.getCurrentToken();
    console.log('🔍 Checking authentication:', !!token);
    return !!token;
  }

  clearAuth(): void {
    localStorage.removeItem('accessToken');
    console.log('🗑️ Auth cleared');
  }

  // Debug method to check token status
  debugTokenStatus(): void {
    const token = localStorage.getItem('accessToken');
    console.log('=== TOKEN DEBUG ===');
    console.log('Access Token exists:', !!token);
    if (token) {
      console.log('Token preview:', token.substring(0, 30) + '...');
    }
    console.log('Cookies available:', document.cookie);
    console.log('==================');
  }
}

const apiService = new ApiService();
export default apiService;

// Export types
export type { ApiResponse, AuthResponse, AuthTokenResponse, ProfileResponse };
