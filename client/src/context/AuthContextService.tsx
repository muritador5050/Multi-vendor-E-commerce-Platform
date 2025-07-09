import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService, { type ApiError } from '@/api/ApiService';
import { validators } from '@/utils/Validation';
import { permissionUtils } from '@/utils/Permission';
import type { User, AuthState, UserRole, Action } from '@/type/auth';
import { AuthContext, type AuthContextType } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Helper to update state
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Enhanced error handler
  const handleError = useCallback((err: unknown): string => {
    if (err instanceof Error && 'status' in err) {
      const apiError = err as ApiError;
      const errorMap: Record<number, string> = {
        401: 'Invalid credentials. Please check your email and password.',
        403: 'Access denied. You do not have permission.',
        404: 'Resource not found. Please try again.',
        422: apiError.message || 'Validation failed. Please check your input.',
        429: 'Too many requests. Please wait and try again.',
        500: 'Server error. Please try again later.',
      };

      return (
        errorMap[apiError.status] ||
        apiError.message ||
        'An unexpected error occurred.'
      );
    }

    if (err instanceof Error) {
      if (err.name === 'NetworkError')
        return 'Network error. Please check your connection.';
      return err.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }, []);

  // Validation helper
  const validateInputs = useCallback(
    (validations: Array<() => string | null>) => {
      for (const validate of validations) {
        const error = validate();
        if (error) throw new Error(error);
      }
    },
    []
  );

  // Auth status check
  const checkAuthStatus = useCallback(async () => {
    try {
      if (!apiService.isAuthenticated()) {
        updateState({ loading: false, isAuthenticated: false });
        return;
      }

      const response = await apiService.getProfile();
      const user = response.data?.user;

      if (!user) throw new Error('Invalid user data received');

      updateState({
        user,
        error: null,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      console.error('Auth check failed:', err);
      updateState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error:
          err instanceof Error &&
          'status' in err &&
          (err as ApiError).status !== 401
            ? handleError(err)
            : null,
      });
    }
  }, [handleError, updateState]);

  // Initialize auth
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Multi-tab logout detection
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue && state.user) {
        updateState({ user: null, isAuthenticated: false });
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.user, navigate, updateState]);

  // Auth methods
  const login = useCallback(
    async (email: string, password: string) => {
      validateInputs([
        () => validators.email(email),
        () => validators.password(password),
      ]);

      updateState({ loading: true, error: null });

      try {
        const response = await apiService.login(
          email.trim().toLowerCase(),
          password
        );
        const { user, accessToken } = response.data || {};

        if (!accessToken || !user) {
          throw new Error('Invalid login response from server');
        }

        updateState({
          user,
          isAuthenticated: true,
          error: null,
          loading: false,
        });

        navigate(permissionUtils.getDefaultRoute(user.role), { replace: true });
      } catch (err) {
        const errorMessage = handleError(err);
        updateState({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
    },
    [validateInputs, updateState, handleError, navigate]
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string
    ) => {
      validateInputs([
        () => validators.name(name),
        () => validators.email(email),
        () => validators.password(password),
        () => validators.passwordMatch(password, confirmPassword),
      ]);

      updateState({ loading: true, error: null });

      try {
        await apiService.register(
          name.trim(),
          email.trim().toLowerCase(),
          password,
          confirmPassword
        );
        updateState({ error: null, loading: false });
      } catch (err) {
        const errorMessage = handleError(err);
        updateState({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
    },
    [validateInputs, updateState, handleError]
  );

  const registerVendor = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string
    ) => {
      validateInputs([
        () => validators.name(name),
        () => validators.email(email),
        () => validators.password(password),
        () => validators.passwordMatch(password, confirmPassword),
      ]);

      updateState({ loading: true, error: null });

      try {
        await apiService.registerVendor(
          name.trim(),
          email.trim().toLowerCase(),
          password,
          confirmPassword
        );
        updateState({ error: null, loading: false });
      } catch (err) {
        const errorMessage = handleError(err);
        updateState({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
    },
    [validateInputs, updateState, handleError]
  );

  const logout = useCallback(
    async (redirect = true) => {
      updateState({ loading: true });

      try {
        await apiService.logout();
      } catch (err) {
        console.error('Logout error:', err);
        apiService.clearAuth();
      } finally {
        updateState({
          user: null,
          isAuthenticated: false,
          error: null,
          loading: false,
        });

        if (redirect) navigate('/', { replace: true });
      }
    },
    [updateState, navigate]
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      validateInputs([() => validators.email(email)]);

      updateState({ loading: true, error: null });

      try {
        await apiService.forgotPassword(email.trim().toLowerCase());
        updateState({ error: null, loading: false });
      } catch (err) {
        const errorMessage = handleError(err);
        updateState({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
    },
    [validateInputs, updateState, handleError]
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string, confirmPassword?: string) => {
      if (!token?.trim()) throw new Error('Invalid reset token');

      validateInputs(
        [
          () => validators.password(newPassword),
          () =>
            confirmPassword
              ? validators.passwordMatch(newPassword, confirmPassword)
              : null,
        ].filter(Boolean) as Array<() => string | null>
      );

      updateState({ loading: true, error: null });

      try {
        await apiService.resetPassword(token, newPassword);
        updateState({ error: null, loading: false });
        navigate('/login?message=Password reset successful. Please log in.', {
          replace: true,
        });
      } catch (err) {
        const errorMessage = handleError(err);
        updateState({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
    },
    [validateInputs, updateState, handleError, navigate]
  );

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!state.user) throw new Error('No user logged in');

      // Validate updates
      if (updates.email) {
        const emailError = validators.email(updates.email);
        if (emailError) throw new Error(emailError);
      }
      if (updates.name) {
        const nameError = validators.name(updates.name);
        if (nameError) throw new Error(nameError);
      }

      updateState({ loading: true, error: null });
      const originalUser = state.user;

      try {
        // Optimistic update
        updateState({ user: { ...state.user, ...updates } });

        const response = await apiService.updateProfile(updates);
        const updatedUser = response.data?.user;

        if (!updatedUser) throw new Error('Invalid response from server');

        updateState({ user: updatedUser, error: null, loading: false });
      } catch (err) {
        // Rollback
        updateState({ user: originalUser, loading: false });
        const errorMessage = handleError(err);
        updateState({ error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    [state.user, updateState, handleError]
  );

  const verifyEmail = useCallback(
    async (token: string) => {
      if (!token?.trim()) throw new Error('Invalid verification token');

      updateState({ loading: true, error: null });

      try {
        await apiService.verifyEmail(token);
        if (state.user) await checkAuthStatus();
        updateState({ error: null, loading: false });
      } catch (err) {
        const errorMessage = handleError(err);
        updateState({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
    },
    [updateState, handleError, checkAuthStatus, state.user]
  );

  const uploadFile = useCallback(
    async <T = unknown,>(file: File, endpoint?: string): Promise<T> => {
      if (!state.isAuthenticated) throw new Error('Authentication required');

      updateState({ loading: true, error: null });

      try {
        const response = await apiService.uploadFile(file, endpoint);
        updateState({ error: null, loading: false });
        return response.data as T;
      } catch (err) {
        const errorMessage = handleError(err);
        updateState({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
    },
    [state.isAuthenticated, updateState, handleError]
  );

  const forceLogout = useCallback(
    (message?: string) => {
      apiService.clearAuth();
      updateState({
        user: null,
        isAuthenticated: false,
        error: null,
      });

      const url = message
        ? `/login?message=${encodeURIComponent(message)}`
        : '/';
      navigate(url, { replace: true });
    },
    [updateState, navigate]
  );

  // Permission-based utilities
  const canPerformAction = useCallback(
    (action: Action) =>
      permissionUtils.canPerformAction(state.user?.role, action),
    [state.user?.role]
  );

  const canCreate = useCallback(
    () => permissionUtils.canCreate(state.user?.role),
    [state.user?.role]
  );

  const canEdit = useCallback(
    () => permissionUtils.canEdit(state.user?.role),
    [state.user?.role]
  );

  const canDelete = useCallback(
    () => permissionUtils.canDelete(state.user?.role),
    [state.user?.role]
  );

  const canRead = useCallback(
    () => permissionUtils.canRead(state.user?.role),
    [state.user?.role]
  );

  // Role utilities
  const hasRole = useCallback(
    (role: UserRole) => permissionUtils.hasRole(state.user?.role, role),
    [state.user?.role]
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]) => permissionUtils.hasAnyRole(state.user?.role, roles),
    [state.user?.role]
  );

  const isAdmin = useCallback(
    () => permissionUtils.isAdmin(state.user?.role),
    [state.user?.role]
  );

  const isVendor = useCallback(
    () => permissionUtils.isVendor(state.user?.role),
    [state.user?.role]
  );

  const isCustomer = useCallback(
    () => permissionUtils.isCustomer(state.user?.role),
    [state.user?.role]
  );

  const getUserPermissions = useCallback(
    () => permissionUtils.getRolePermissions(state.user?.role),
    [state.user?.role]
  );

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    registerVendor,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    verifyEmail,
    refreshProfile: checkAuthStatus,
    uploadFile,
    canPerformAction,
    canCreate,
    canEdit,
    canDelete,
    canRead,
    hasRole,
    hasAnyRole,
    isAdmin,
    isVendor,
    isCustomer,
    getUserPermissions,
    clearError: () => updateState({ error: null }),
    forceLogout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
