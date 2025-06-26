import apiService from '@/api/ApiService';
import type { User } from '@/utils/UserType';
import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from './UseContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check auth status
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await apiService.getProfile();
        setUser(response.data?.results || null);
      }
    } catch (err) {
      localStorage.removeItem('accessToken');
      console.log('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.login(email, password);
      if (response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        await checkAuthStatus();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Login Failed');
      } else {
        setError('Login Failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.register(name, email, password);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Registration failed');
      } else {
        setError('Registration failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await apiService.logout();
      localStorage.removeItem('accessToken');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.forgotPassword(email);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to send reset email');
      } else {
        setError('Failed to send reset email');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.resetPassword(token, password);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Password reset failed');
      } else {
        setError('Password reset failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const updateProfile = async (data: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.updateProfile(data);
      setUser(response.data?.results || null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Profile update failed');
      } else {
        setError('Profile update failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
