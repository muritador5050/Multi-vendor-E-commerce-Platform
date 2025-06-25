import type { User } from '@/utils/UserType';

// API Configuration
export const apiBase = import.meta.env.VITE_API_URL;

const apiService = {
  async request(endpoint: string, options: RequestInit = {}) {
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

    const response = await fetch(`${apiBase}${endpoint}`, config);

    if (response.status === 401) {
      //Refresh token
      const refreshResponse = await fetch(`${apiBase}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const { accessToken } = await refreshResponse.json();
        localStorage.setItem('accessToken', accessToken);

        //Retry original request
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        };
        return fetch(`${apiBase}${endpoint}`, config);
      } else {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }
    return response;
  },

  //Register user
  async register(name: string, email: string, password: string) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  //Login user
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  //Logout
  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    return response.json();
  },

  //ForgotPassword
  async forgotPassword(email: string) {
    const response = await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response.json();
  },
  //ResetPassword
  async resetPassword(token: string, password: string) {
    const response = await this.request(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    return response.json();
  },

  //GetProfile
  async getProfile() {
    const response = await this.request('/auth/profile');
    return response.json();
  },
  //UpdateProfile
  async updateProfile(data: Partial<User>) {
    const response = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

export default apiService;
