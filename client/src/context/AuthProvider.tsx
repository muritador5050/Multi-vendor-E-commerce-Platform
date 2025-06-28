// import { useEffect, useState, useCallback, type ReactNode } from 'react';
// import { useNavigate } from 'react-router-dom';
// import apiService, { type ApiError } from '@/api/ApiService';
// import type { User } from '@/utils/UserType';
// import { AuthContext } from './AuthContext';

// // Constants for better maintainability
// const TOKEN_KEY = 'accessToken';

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const navigate = useNavigate();
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Use ApiService's authentication check
//   const isAuthenticated = apiService.isAuthenticated() && !!currentUser;

//   // ✅ Clear authentication state
//   const clearAuthState = useCallback(() => {
//     apiService.clearAuth();
//     setCurrentUser(null);
//     setError(null);
//   }, []);

//   // ✅ Handle API errors consistently
//   const handleApiError = useCallback((err: unknown): string => {
//     if (err instanceof Error) {
//       // Check if it's our custom ApiError
//       if ('status' in err) {
//         const apiError = err as ApiError;
//         switch (apiError.status) {
//           case 401:
//             return 'Invalid credentials. Please check your email and password.';
//           case 403:
//             return 'Access denied. You do not have permission to perform this action.';
//           case 404:
//             return 'Resource not found. Please try again.';
//           case 422:
//             return (
//               apiError.message || 'Validation failed. Please check your input.'
//             );
//           case 429:
//             return 'Too many requests. Please wait a moment and try again.';
//           case 500:
//             return 'Server error. Please try again later.';
//           default:
//             return apiError.message || 'An unexpected error occurred.';
//         }
//       }

//       // Check if it's a NetworkError
//       if (err.name === 'NetworkError') {
//         return 'Network error. Please check your internet connection.';
//       }

//       return err.message;
//     }

//     return 'An unexpected error occurred. Please try again.';
//   }, []);

//   // ✅ Session validation using ApiService
//   const checkAuthStatus = useCallback(async () => {
//     try {
//       if (!apiService.isAuthenticated()) {
//         setLoading(false);
//         return;
//       }

//       // ApiService handles token refresh automatically
//       const response = await apiService.getProfile();
//       const user = response.data?.user;

//       if (!user) {
//         throw new Error('Invalid user data received');
//       }

//       setCurrentUser(user);
//       setError(null);
//     } catch (err) {
//       console.error('Auth validation failed:', err);

//       // ApiService already handles token cleanup on auth failures
//       setCurrentUser(null);

//       // Only show error if it's not a simple 401 (unauthorized)
//       if (err instanceof Error && 'status' in err) {
//         const apiError = err as ApiError;
//         if (apiError.status !== 401) {
//           setError(handleApiError(err));
//         }
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [handleApiError]);

//   // ✅ Initialize auth state on mount
//   useEffect(() => {
//     checkAuthStatus();
//   }, [checkAuthStatus]);

//   // ✅ Listen for storage changes (multi-tab logout)
//   useEffect(() => {
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === TOKEN_KEY && !e.newValue && currentUser) {
//         // Token was removed in another tab
//         setCurrentUser(null);
//         navigate('/shop', { replace: true });
//       }
//     };

//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, [currentUser, navigate]);

//   // ✅ Enhanced login with input validation
//   const handleLogin = async (email: string, password: string) => {
//     // Client-side validation
//     if (!email?.trim() || !password?.trim()) {
//       throw new Error('Please provide both email and password');
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email.trim())) {
//       throw new Error('Please enter a valid email address');
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await apiService.login(
//         email.trim().toLowerCase(),
//         password
//       );
//       const { user, accessToken } = response.data || {};

//       if (!accessToken || !user) {
//         throw new Error('Invalid login response from server');
//       }

//       // Validate user object
//       // if (!user.id || !user.email || !user.role) {
//       //   throw new Error('Invalid user data received');
//       // }

//       setCurrentUser(user);

//       // Role-based navigation with fallback
//       const roleRoutes: Record<string, string> = {
//         admin: '/store-manager',
//         vendor: '/shop',
//         customer: '/',
//       };

//       const route = roleRoutes[user.role] || '/';
//       navigate(route, { replace: true });
//     } catch (err) {
//       const errorMessage = handleApiError(err);
//       setError(errorMessage);
//       throw new Error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Enhanced logout using ApiService
//   const handleLogout = async (redirect = true) => {
//     setLoading(true);

//     try {
//       // ApiService handles server logout and token cleanup
//       await apiService.logout();
//     } catch (err) {
//       console.error('Logout error:', err);
//       // Even if server logout fails, clear local state
//       apiService.clearAuth();
//     } finally {
//       setCurrentUser(null);
//       setError(null);
//       setLoading(false);

//       if (redirect) {
//         navigate('/login', { replace: true });
//       }
//     }
//   };

//   // ✅ Enhanced registration with comprehensive validation
//   const handleRegister = async (
//     name: string,
//     email: string,
//     password: string,
//     confirmPassword: string
//   ) => {
//     // Client-side validation
//     if (!name?.trim() || !email?.trim() || !password || !confirmPassword) {
//       throw new Error('All fields are required');
//     }

//     if (name.trim().length < 2) {
//       throw new Error('Name must be at least 2 characters long');
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email.trim())) {
//       throw new Error('Please enter a valid email address');
//     }

//     if (password !== confirmPassword) {
//       throw new Error('Passwords do not match');
//     }

//     if (password.length < 8) {
//       throw new Error('Password must be at least 8 characters long');
//     }

//     // Check password strength
//     const hasUpperCase = /[A-Z]/.test(password);
//     const hasLowerCase = /[a-z]/.test(password);
//     const hasNumbers = /\d/.test(password);
//     const hasNonalphas = /\W/.test(password);

//     if (!(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)) {
//       throw new Error(
//         'Password must contain uppercase, lowercase, number, and special character'
//       );
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       await apiService.register(
//         name.trim(),
//         email.trim().toLowerCase(),
//         password,
//         confirmPassword
//       );

//       setError(null);
//     } catch (err) {
//       const errorMessage = handleApiError(err);
//       setError(errorMessage);
//       throw new Error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Enhanced forgot password
//   const handleForgotPassword = async (email: string) => {
//     if (!email?.trim()) {
//       throw new Error('Please enter your email address');
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email.trim())) {
//       throw new Error('Please enter a valid email address');
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       await apiService.forgotPassword(email.trim().toLowerCase());
//       setError(null);
//     } catch (err) {
//       const errorMessage = handleApiError(err);
//       setError(errorMessage);
//       throw new Error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Enhanced reset password
//   const handleResetPassword = async (
//     token: string,
//     newPassword: string,
//     confirmPassword?: string
//   ) => {
//     if (!token?.trim() || !newPassword) {
//       throw new Error('Invalid reset token or password');
//     }

//     if (confirmPassword && newPassword !== confirmPassword) {
//       throw new Error('Passwords do not match');
//     }

//     if (newPassword.length < 8) {
//       throw new Error('Password must be at least 8 characters long');
//     }

//     // Check password strength
//     const hasUpperCase = /[A-Z]/.test(newPassword);
//     const hasLowerCase = /[a-z]/.test(newPassword);
//     const hasNumbers = /\d/.test(newPassword);
//     const hasNonalphas = /\W/.test(newPassword);

//     if (!(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)) {
//       throw new Error(
//         'Password must contain uppercase, lowercase, number, and special character'
//       );
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       await apiService.resetPassword(token, newPassword);
//       setError(null);

//       // Redirect to login after successful reset
//       navigate(
//         '/login?message=Password reset successful. Please log in with your new password.',
//         { replace: true }
//       );
//     } catch (err) {
//       const errorMessage = handleApiError(err);
//       setError(errorMessage);
//       throw new Error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Enhanced profile update with optimistic updates
//   const handleUpdateProfile = async (updates: Partial<User>) => {
//     if (!currentUser) {
//       throw new Error('No user logged in');
//     }

//     // Validate updates
//     if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
//       throw new Error('Please enter a valid email address');
//     }

//     if (updates.name && updates.name.trim().length < 2) {
//       throw new Error('Name must be at least 2 characters long');
//     }

//     setLoading(true);
//     setError(null);

//     // Store original user for rollback
//     const originalUser = currentUser;

//     try {
//       // Optimistic update
//       setCurrentUser({ ...currentUser, ...updates });

//       const response = await apiService.updateProfile(updates);
//       const updatedUser = response.data?.user;

//       if (!updatedUser) {
//         throw new Error('Invalid response from server');
//       }

//       setCurrentUser(updatedUser);
//       setError(null);
//     } catch (err) {
//       // Rollback on error
//       setCurrentUser(originalUser);

//       const errorMessage = handleApiError(err);
//       setError(errorMessage);
//       throw new Error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Email verification
//   const handleVerifyEmail = async (token: string) => {
//     if (!token?.trim()) {
//       throw new Error('Invalid verification token');
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       await apiService.verifyEmail(token);

//       // Refresh user profile to get updated verification status
//       if (currentUser) {
//         await checkAuthStatus();
//       }

//       setError(null);
//     } catch (err) {
//       const errorMessage = handleApiError(err);
//       setError(errorMessage);
//       throw new Error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Force logout (for expired sessions handled by ApiService)
//   const forceLogout = useCallback(
//     (message?: string) => {
//       clearAuthState();
//       if (message) {
//         navigate(`/login?message=${encodeURIComponent(message)}`, {
//           replace: true,
//         });
//       } else {
//         navigate('/shop', { replace: true });
//       }
//     },
//     [clearAuthState, navigate]
//   );

//   // ✅ Role checking utilities
//   const hasRole = useCallback(
//     (role: string): boolean => {
//       return currentUser?.role === role;
//     },
//     [currentUser?.role]
//   );

//   const hasAnyRole = useCallback(
//     (roles: string[]): boolean => {
//       return currentUser?.role ? roles.includes(currentUser.role) : false;
//     },
//     [currentUser?.role]
//   );

//   // ✅ Upload file utility
//   const uploadFile = async (file: File, endpoint?: string) => {
//     if (!isAuthenticated) {
//       throw new Error('Authentication required');
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await apiService.uploadFile(file, endpoint);
//       setError(null);
//       return response;
//     } catch (err) {
//       const errorMessage = handleApiError(err);
//       setError(errorMessage);
//       throw new Error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const authContextValue = {
//     user: currentUser,
//     loading,
//     error,
//     isAuthenticated,
//     login: handleLogin,
//     logout: handleLogout,
//     register: handleRegister,
//     forgotPassword: handleForgotPassword,
//     resetPassword: handleResetPassword,
//     updateProfile: handleUpdateProfile,
//     verifyEmail: handleVerifyEmail,
//     forceLogout,
//     hasRole,
//     hasAnyRole,
//     uploadFile,
//     clearError: () => setError(null),
//     refreshProfile: checkAuthStatus,
//   };

//   return (
//     <AuthContext.Provider value={authContextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// AuthProvider.tsx
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService, { type ApiError } from '@/api/ApiService';
import { validators } from '@/utils/Validation';
import { permissionUtils } from '@/utils/Permission';
import type { User, AuthState, UserRole, Action } from '@/type/auth';
import { AuthContext, type AuthContextType } from '@/hooks/useAuth';
// import { AuthContext, type AuthContextType } from '@/context/AuthContext';

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
        navigate('/shop', { replace: true });
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

        if (redirect) navigate('/login', { replace: true });
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
        : '/shop';
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
