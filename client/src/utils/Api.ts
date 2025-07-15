import { ApiError } from './ApiError';

const apiBase = import.meta.env.VITE_API_URL;
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_REFRESH_ATTEMPTS = 3;
const TOKEN_REFRESH_BUFFER = 30000; // 30 seconds

class ApiClient {
  private defaultOptions: RequestInit = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };

  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private refreshAttempts = 0;

  /**
   * Fetch with timeout and abort controller
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Validate JWT token expiration
   */
  private isTokenValid(token: string | null): boolean {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now() + TOKEN_REFRESH_BUFFER;
    } catch {
      return false;
    }
  }

  /**
   * Refresh access token with retry logic
   */
  private async refreshToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh();

    try {
      const token = await this.refreshPromise;
      this.refreshAttempts = 0; // Reset on success
      return token;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async _performRefresh(): Promise<string> {
    // Check if we've exceeded max attempts
    if (this.refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      this.clearAuthAndRedirect();
      throw new ApiError('Max refresh attempts exceeded', 401);
    }

    this.refreshAttempts++;

    try {
      const response = await this.fetchWithTimeout(
        `${apiBase}/auth/refresh-token`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        // If it's a 401/403, clear auth immediately
        if (response.status === 401 || response.status === 403) {
          this.clearAuthAndRedirect();
        }
        throw new ApiError(
          'Session expired. Please login again.',
          response.status
        );
      }

      const data: { accessToken: string } = await response.json();

      // Validate the token exists
      if (!data.accessToken) {
        throw new ApiError('Invalid token response', 401);
      }

      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }
      // On API errors, rethrow
      if (error instanceof ApiError) {
        throw error;
      }
      // On network errors, don't clear auth immediately
      throw new ApiError('Network error during token refresh', 500);
    }
  }

  /**
   * Clear authentication and redirect to login
   */
  private clearAuthAndRedirect(): void {
    localStorage.removeItem('accessToken');
    this.refreshAttempts = 0;
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/my-account')) {
      window.location.href = '/my-account';
    }
  }

  /**
   * Handle response and extract data
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Rate limiting handling
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      throw new ApiError(
        `Too many requests. Try again in ${retryAfter} seconds.`,
        429,
        response
      );
    }

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

    // Handle empty responses gracefully
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    // For non-JSON responses, return as text or empty object
    const text = await response.text();
    return (text ? text : {}) as T;
  }

  /**
   * Public API request (no authentication required)
   */
  public async publicApiRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await this.fetchWithTimeout(
        `${apiBase}${endpoint}`,
        config
      );
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }
      throw new ApiError('Network error', 500);
    }
  }

  /**
   * Authenticated API request with token refresh handling
   */
  public async authenticatedApiRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      let token = localStorage.getItem('accessToken');

      // Preemptive refresh if token is about to expire
      if (token && !this.isTokenValid(token)) {
        token = await this.refreshToken();
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
      };

      const response = await this.fetchWithTimeout(
        `${apiBase}${endpoint}`,
        config
      );

      // Handle 401 with token refresh
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
        const retryResponse = await this.fetchWithTimeout(
          `${apiBase}${endpoint}`,
          retryConfig
        );
        return this.handleResponse<T>(retryResponse);
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }
      throw new ApiError('Network error', 500);
    }
  }

  /**
   * Utility method to check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return this.isTokenValid(token);
  }

  /**
   * Method to manually clear auth (for logout)
   */
  public clearAuth(): void {
    localStorage.removeItem('accessToken');
    this.refreshAttempts = 0;
  }

  /**
   * Check if client is currently refreshing token
   */
  public isTokenRefreshing(): boolean {
    return this.isRefreshing;
  }
}

export const apiClient = new ApiClient();
