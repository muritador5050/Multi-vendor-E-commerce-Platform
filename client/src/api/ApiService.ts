import type { User } from '@/type/auth';
import { apiClient } from '@/utils/Api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

interface AuthTokenResponse {
  accessToken: string;
}

export interface ProfileCompletion {
  percent: number;
  completed: number;
  totalFields: number;
}

export interface ProfileData {
  user: User;
  profileCompletion: ProfileCompletion;
}

interface ProfileResponse {
  user: User;
}

class ApiService {
  async register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<ApiResponse<null>> {
    return apiClient.publicApiRequest<ApiResponse<null>>('/auth/register', {
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
    return apiClient.publicApiRequest<ApiResponse<null>>(
      '/auth/vendor-register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password, confirmPassword }),
      }
    );
  }

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.publicApiRequest<
      ApiResponse<AuthResponse>
    >('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response;
  }

  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.authenticatedApiRequest<
        ApiResponse<null>
      >('/auth/logout', {
        method: 'POST',
      });
      apiClient.clearAuth();
      return response;
    } catch (error) {
      apiClient.clearAuth();
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return apiClient.publicApiRequest<ApiResponse<null>>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );
  }

  async resetPassword(
    token: string,
    password: string
  ): Promise<ApiResponse<null>> {
    return apiClient.publicApiRequest<ApiResponse<null>>(
      `/auth/reset-password/${token}`,
      {
        method: 'POST',
        body: JSON.stringify({ password }),
      }
    );
  }

  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    return apiClient.publicApiRequest<ApiResponse<null>>(
      `/auth/verify/${token}`,
      {
        method: 'GET',
      }
    );
  }

  async getProfile(): Promise<ApiResponse<ProfileData>> {
    return apiClient.authenticatedApiRequest<ApiResponse<ProfileData>>(
      '/auth/profile'
    );
  }

  async updateProfile(
    data: Partial<User>
  ): Promise<ApiResponse<ProfileResponse>> {
    return apiClient.authenticatedApiRequest<ApiResponse<ProfileResponse>>(
      '/auth/profile',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async uploadFile<T = unknown>(
    file: File,
    endpoint: string = '/upload'
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.authenticatedApiRequest<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  clearAuth(): void {
    apiClient.clearAuth();
  }
}

const apiService = new ApiService();
export default apiService;

export type { ApiResponse, AuthResponse, AuthTokenResponse, ProfileResponse };
