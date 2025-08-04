import { ApiError } from './ApiError';

export const apiBase = import.meta.env.VITE_API_URL;
const REQUEST_TIMEOUT = 10000;
const MAX_REFRESH_ATTEMPTS = 3;
const TOKEN_REFRESH_BUFFER = 30000;

class ApiClient {
  private defaultOptions: RequestInit = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };

  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private refreshAttempts = 0;

  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatFrequency = 3 * 60 * 1000;

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
        if (response.status === 401 || response.status === 403) {
          this.clearAuthAndRedirect();
        }
        throw new ApiError(
          'Session expired. Please login again.',
          response.status
        );
      }

      const data: { accessToken: string } = await response.json();

      if (!data.accessToken) {
        throw new ApiError('Invalid token response', 401);
      }

      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error during token refresh', 500);
    }
  }

  /**
   * Clear authentication and redirect to login
   */
  private clearAuthAndRedirect(): void {
    localStorage.removeItem('accessToken');
    this.refreshAttempts = 0;
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

      // Check content type before trying to parse as JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Keep original error message if JSON parsing fails
        }
      } else {
        // For non-JSON error responses, try to get text content
        try {
          const errorText = await response.text();
          if (errorText && !errorText.startsWith('--')) {
            // Avoid multipart data
            errorMessage = errorText;
          }
        } catch {
          // Keep original error message if text parsing fails
        }
      }

      throw new ApiError(errorMessage, response.status, response);
    }

    // Handle successful responses
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

      if (token && !this.isTokenValid(token)) {
        token = await this.refreshToken();
      }

      const headers: HeadersInit = {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      if (!(options.body instanceof FormData)) {
        (headers as Record<string, string>)['Content-Type'] =
          'application/json';
      }

      const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
      };

      const response = await this.fetchWithTimeout(
        `${apiBase}${endpoint}`,
        config
      );

      if (
        response.status === 401 &&
        !endpoint.includes('/auth/refresh-token')
      ) {
        const newToken = await this.refreshToken();

        const retryHeaders = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };

        // Again, don't override Content-Type for FormData on retry
        if (!(options.body instanceof FormData)) {
          (retryHeaders as Record<string, string>)['Content-Type'] =
            'application/json';
        }

        const retryConfig: RequestInit = {
          ...config,
          headers: retryHeaders,
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
   * Authenticated API request with FormData support for file uploads
   */
  public async authenticatedFormDataRequest<T = unknown>(
    endpoint: string,
    data: Record<string, any | string>,
    files?: { [key: string]: File | File[] },
    options: Omit<RequestInit, 'body'> = {}
  ): Promise<T> {
    try {
      let token = localStorage.getItem('accessToken');

      if (token && !this.isTokenValid(token)) {
        token = await this.refreshToken();
      }

      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else if (typeof value === 'number') {
            formData.append(key, value.toString());
          } else if (typeof value === 'string') {
            formData.append(key, value);
          } else if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Add files
      if (files) {
        Object.entries(files).forEach(([key, fileValue]) => {
          if (Array.isArray(fileValue)) {
            fileValue.forEach((file) => {
              formData.append(key, file);
            });
          } else if (fileValue instanceof File) {
            formData.append(key, fileValue);
          }
        });
      }

      const headers: HeadersInit = {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const config: RequestInit = {
        ...options,
        method: options.method || 'POST',
        headers,
        credentials: 'include',
        body: formData,
      };

      const response = await this.fetchWithTimeout(
        `${apiBase}${endpoint}`,
        config
      );

      if (
        response.status === 401 &&
        !endpoint.includes('/auth/refresh-token')
      ) {
        const newToken = await this.refreshToken();

        const retryHeaders = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };

        const retryConfig: RequestInit = {
          ...config,
          headers: retryHeaders,
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
    // Check both localStorage and sessionStorage
    const localToken = localStorage.getItem('accessToken');
    const sessionToken = sessionStorage.getItem('accessToken');

    const token = localToken || sessionToken;
    return this.isTokenValid(token);
  }

  /**
   * Method to manually clear auth (for logout)
   */
  public clearAuth(): void {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('savedEmail');
    this.refreshAttempts = 0;

    // Dispatch custom event to notify React components
    window.dispatchEvent(
      new CustomEvent('auth:logout', {
        detail: { reason: 'token_expired' },
      })
    );

    if (!window.location.pathname.includes('/my-account')) {
      window.location.href =
        '/my-account?message=' +
        encodeURIComponent('Your session has expired. Please login again.');
    }
  }

  /**
   * Check if client is currently refreshing token
   */
  public isTokenRefreshing(): boolean {
    return this.isRefreshing;
  }

  public startHeartBeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      if (this.isRefreshing) {
        // Skip heartbeat during token refresh
        return;
      }
      try {
        await this.authenticatedApiRequest('/auth/heartbeat', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
        this.handleHeartbeatFailure(error);
      }
    }, this.heartbeatFrequency);
  }

  public stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleHeartbeatFailure(error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      this.stopHeartbeat();
      this.clearAuthAndRedirect();
    }
  }
}

export const apiClient = new ApiClient();
