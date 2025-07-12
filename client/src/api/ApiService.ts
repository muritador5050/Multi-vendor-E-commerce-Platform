import type { User } from '@/type/auth';

export const apiBase = import.meta.env.VITE_API_URL;

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

interface ProfileResponse {
  user: User;
  profileCompletion?: number;
}

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
    const response = await fetch(`${apiBase}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      localStorage.removeItem('accessToken');
      window.location.href = '/account';
      throw new ApiError('Session expired. Please login again.', 401);
    }

    const data: AuthTokenResponse = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Keep original error message if JSON parsing fails
      }
      throw new ApiError(errorMessage, response.status, response);
    }

    return response.json();
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

    try {
      const response = await fetch(`${apiBase}${endpoint}`, config);

      if (
        response.status === 401 &&
        !endpoint.includes('/auth/refresh-token')
      ) {
        const newToken = await this.refreshToken();
        const retryConfig: RequestInit = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };

        const retryResponse = await fetch(`${apiBase}${endpoint}`, retryConfig);
        return this.handleResponse<T>(retryResponse);
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error', 500);
    }
  }

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
    const response = await this.request<ApiResponse<AuthResponse>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response;
  }

  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await this.request<ApiResponse<null>>('/auth/logout', {
        method: 'POST',
      });
      localStorage.removeItem('accessToken');
      return response;
    } catch (error) {
      localStorage.removeItem('accessToken');
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

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  clearAuth(): void {
    localStorage.removeItem('accessToken');
  }
}

const apiService = new ApiService();
export default apiService;

export type { ApiResponse, AuthResponse, AuthTokenResponse, ProfileResponse };
