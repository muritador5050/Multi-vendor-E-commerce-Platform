import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { validators } from '@/utils/Validation';
import { permissionUtils } from '@/utils/Permission';
import type {
  User,
  UserRole,
  Action,
  AuthResponse,
  ProfileData,
  UserStatus,
  UserStatusUpdate,
  UserQueryParams,
  PaginatedUsers,
} from '@/type/auth';
import { apiBase, apiClient } from '@/utils/Api';
import { ApiError } from '@/utils/ApiError';
import type { ApiResponse } from '@/type/ApiResponse';
import { buildQueryString } from '@/utils/QueryString';
import { useToast } from '@chakra-ui/react';
import { getVendorProfileStatus, vendorKeys } from './VendorContextService';

/**
 * Query keys for auth-related queries
 */
export const authKeys = {
  all: ['auth'] as const,
  users: () => [...authKeys.all, 'list'] as const,
  user: (id: string) => [...authKeys.all, 'detail', id] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  activeUsers: () => [...authKeys.users(), 'active'] as const,
  userStatus: (id: string) => [...authKeys.user(id), 'status'] as const,
  onlineUsers: () => [...authKeys.users(), 'online'] as const,
};

/**
 * Register a new user
 */
async function register(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
) {
  return apiClient.publicApiRequest<ApiResponse<null>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
}

/**
 * Register a new vendor
 */
async function registerVendor(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
) {
  return apiClient.publicApiRequest<ApiResponse<null>>(
    '/auth/vendor-register',
    {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    }
  );
}

/**
 * Login user with email and password
 */
// In AuthContextService login function - ADD this line:
async function login(email: string, password: string, rememberMe: boolean) {
  const response = await apiClient.publicApiRequest<ApiResponse<AuthResponse>>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    }
  );

  if (response.data?.accessToken) {
    apiClient.setRememberMe(rememberMe);

    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');

    localStorage.setItem('savedEmail', email);

    if (rememberMe) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('rememberMe', 'true');
    } else {
      sessionStorage.setItem('accessToken', response.data.accessToken);
      localStorage.removeItem('rememberMe');
    }
  }
  return response;
}

/**
 * Initiate Google OAuth login
 */
async function googleLogin() {
  window.location.href = `${
    apiBase || 'http://localhost:8000/api'
  }/auth/google-signup`;
}

/**
 * Logout the current user
 */
async function logout() {
  try {
    const response = await apiClient.authenticatedApiRequest<ApiResponse<null>>(
      '/auth/logout',
      {
        method: 'POST',
      }
    );
    apiClient.clearAuth();
    return response;
  } catch (error) {
    apiClient.clearAuth();
    throw error;
  }
}

/**
 * Request password reset email
 */
async function forgotPassword(email: string) {
  return apiClient.publicApiRequest<ApiResponse<null>>(
    '/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    }
  );
}

/**
 * Reset password with token
 */
async function resetPassword(token: string, password: string) {
  return apiClient.publicApiRequest<ApiResponse<null>>(
    `/auth/reset-password/${token}`,
    {
      method: 'POST',
      body: JSON.stringify({ password }),
    }
  );
}

/**
 * Verify email with token
 */
async function verifyEmail(token: string) {
  return apiClient.publicApiRequest<ApiResponse<null>>(
    `/auth/verify-email/${token}`,
    {
      method: 'GET',
    }
  );
}

async function sendEmailVerificationLink() {
  return await apiClient.authenticatedApiRequest<ApiResponse<null>>(
    '/auth/resend-verification',
    {
      method: 'POST',
    }
  );
}

/**
 * Fetch paginated list of users
 */
async function fetchUsers(
  params: UserQueryParams = {}
): Promise<ApiResponse<PaginatedUsers>> {
  const queryString = buildQueryString(params);
  const url = `/auth/users${queryString ? `?${queryString}` : ''}`;
  return await apiClient.authenticatedApiRequest<ApiResponse<PaginatedUsers>>(
    url
  );
}

/**
 * Get user by ID
 */
async function getUserById(id: string) {
  return apiClient.authenticatedApiRequest<ApiResponse<UserStatus>>(
    `/auth/users/${id}`
  );
}
/**Toggle user verification */
async function verifyUser(id: string) {
  return apiClient.authenticatedApiRequest<ApiResponse<User>>(
    `/auth/verify-user/${id}`,
    {
      method: 'PATCH',
    }
  );
}

/**
 * Get current user's profile
 */
async function getProfile() {
  return apiClient.authenticatedApiRequest<ApiResponse<ProfileData>>(
    '/auth/profile'
  );
}

/**
 * Update current user's profile
 */
async function updateUserProfile(id: string, data: Partial<User>) {
  return apiClient.authenticatedApiRequest<ApiResponse<Partial<User>>>(
    `/auth/users/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
}

/**
 * Delete a user account
 */
async function deleteUser(id: string) {
  return apiClient.authenticatedApiRequest(`/auth/users/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Deactivate a user
 */
async function deactivateUser(id: string) {
  return apiClient.authenticatedApiRequest<ApiResponse<UserStatusUpdate>>(
    `/auth/users/${id}/deactivate`,
    {
      method: 'PATCH',
    }
  );
}

/**
 * Activate a user
 */
async function activateUser(id: string) {
  return apiClient.authenticatedApiRequest<ApiResponse<UserStatusUpdate>>(
    `/auth/users/${id}/activate`,
    {
      method: 'PATCH',
    }
  );
}

/**
 * Invalidate user's tokens
 */

async function invalidateUserTokens(id: string, reason?: string) {
  const requestBody = reason ? { reason } : {};
  return apiClient.authenticatedApiRequest<
    ApiResponse<{ invalidatedAt: string; reason: string }>
  >(`/auth/users/${id}/invalidate-tokens`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

/**
 * Get user status
 */
async function getUserStatus(id: string) {
  return apiClient.authenticatedApiRequest<ApiResponse<UserStatus>>(
    `/auth/users/${id}/status`
  );
}

/**
 * Get list of online users
 */
function getOnlineUsers() {
  return apiClient.authenticatedApiRequest<ApiResponse<User[]>>(
    '/auth/online-users',
    {
      method: 'GET',
    }
  );
}

/**
 * Check if user is authenticated
 */
function isAuthenticated(): boolean {
  return apiClient.isAuthenticated();
}

/**
 * Clear authentication state
 */
function clearAuth(): void {
  apiClient.clearAuth();
}

/**
 * Validate registration data
 */
function validateRegistration(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
) {
  const nameError = validators.name(name);
  if (nameError) throw new ApiError(nameError, 400);

  const emailError = validators.email(email);
  if (emailError) throw new ApiError(emailError, 400);

  const passwordError = validators.password(password);
  if (passwordError) throw new ApiError(passwordError, 400);

  const matchError = validators.passwordMatch(password, confirmPassword);
  if (matchError) throw new ApiError(matchError, 400);
}

/**
 * Upload file to server
 */
async function uploadAvatar<T = unknown>(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  return apiClient.authenticatedApiRequest<ApiResponse<T>>(
    '/auth/users/avatar',
    {
      method: 'POST',
      body: formData,
    }
  );
}

/**
 * Fetch paginated list of users
 */
export const useUsers = (params: UserQueryParams = {}) => {
  return useQuery({
    queryKey: [...authKeys.users(), params],
    queryFn: () => fetchUsers(params),
    enabled: isAuthenticated(),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Fetch user by ID
 */
export const useUserById = (id: string) => {
  return useQuery({
    queryKey: authKeys.user(id),
    queryFn: async () => {
      const response = await getUserById(id);
      return response.data;
    },
    enabled: !!id && isAuthenticated(),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Fetch current user's profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      try {
        const response = await getProfile();
        return response.data;
      } catch (error) {
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          console.warn(
            'Profile fetch failed - authentication error:',
            error.message
          );
          throw error;
        }
        throw error;
      }
    },
    enabled: isAuthenticated(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        return false;
      }
      if (
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    networkMode: 'online',
  });
};

/**
 * Fetch user status
 */
export const useUserStatus = (id: string) => {
  const user = useCurrentUser();
  const canView = permissionUtils.isAdmin(user?.role) || user?._id === id;

  return useQuery({
    queryKey: authKeys.userStatus(id),
    queryFn: async () => {
      const response = await getUserStatus(id);
      return response.data;
    },
    enabled: !!id && isAuthenticated() && canView,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Fetch online users
 */
export const useOnlineUsers = () => {
  const currentUser = useCurrentUser();
  const canView = permissionUtils.isAdmin(currentUser?.role);

  return useQuery({
    queryKey: authKeys.onlineUsers(),
    queryFn: async () => {
      const response = await getOnlineUsers();
      return response.data;
    },
    enabled: isAuthenticated() && canView,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// =============================================
// 9. MUTATION HOOKS (Authentication)
// =============================================

/**
 * Login mutation
 */

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      rememberMe = false,
    }: {
      email: string;
      password: string;
      rememberMe?: boolean;
    }) => {
      const emailError = validators.email(email);
      if (emailError) throw new ApiError(emailError, 400);

      const passwordError = validators.password(password);
      if (passwordError) throw new ApiError(passwordError, 400);

      const response = await login(
        email.trim().toLowerCase(),
        password,
        rememberMe
      );
      return response.data;
    },
    onSuccess: async (data) => {
      if (!data?.user) return;

      // Invalidate all relevant queries
      await queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      await queryClient.invalidateQueries({
        queryKey: vendorKeys.profileStatus,
      });

      if (data.user.role === 'vendor') {
        // Wait a moment for queries to refetch
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get fresh status
        const freshStatus = await queryClient.fetchQuery({
          queryKey: vendorKeys.profileStatus,
          queryFn: getVendorProfileStatus,
        });

        const targetRoute = freshStatus?.data?.hasVendorProfile
          ? permissionUtils.getDefaultRoute(data.user.role)
          : '/vendor/onboarding';

        navigate(targetRoute, { replace: true });
      } else {
        navigate(permissionUtils.getDefaultRoute(data.user.role), {
          replace: true,
        });
      }
    },
  });
};

/**
 * Google login mutation
 */
export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: googleLogin,
    onError: (error) => {
      console.error('Google login failed:', error);
    },
  });
};

/**
 * Register mutation
 */
export const useRegister = (options?: { onSuccess?: () => void }) => {
  return useMutation({
    mutationFn: async ({
      name,
      email,
      password,
      confirmPassword,
    }: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      validateRegistration(name, email, password, confirmPassword);
      const response = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        confirmPassword
      );

      return response;
    },
    onSuccess: options?.onSuccess,
  });
};

/**
 * Vendor registration mutation
 */
export const useRegisterVendor = (options?: { onSuccess?: () => void }) => {
  return useMutation({
    mutationFn: async ({
      name,
      email,
      password,
      confirmPassword,
    }: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      validateRegistration(name, email, password, confirmPassword);
      const response = await registerVendor(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        confirmPassword
      );

      return response;
    },
    onSuccess: options?.onSuccess,
  });
};

/**Verify user */
export const useVerifyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

/** Send verification link */
export const useSendVerifyEmailLink = () => {
  return useMutation({
    mutationFn: sendEmailVerificationLink,
  });
};

/**
 * Logout mutation
 */
// Fix the logout mutation to ensure proper order
export const useLogout = (options?: { onSuccess?: () => void }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return logout();
    },
    onSuccess: options?.onSuccess,
    onSettled: () => {
      queryClient.clear();
      navigate('/', { replace: true });
    },
  });
};

/**
 * Forgot password mutation
 */
export const useForgotPassword = (options?: {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}) => {
  return useMutation({
    mutationFn: async (email: string) => {
      const emailError = validators.email(email);
      if (emailError) throw new ApiError(emailError, 400);

      const response = await forgotPassword(email.trim().toLowerCase());
      return response;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Reset password mutation
 */
export const useResetPassword = (options?: {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}) => {
  return useMutation({
    mutationFn: async ({
      token,
      password,
      confirmPassword,
    }: {
      token: string;
      password: string;
      confirmPassword?: string;
    }) => {
      if (!token?.trim()) throw new ApiError('Invalid reset token', 400);

      const passwordError = validators.password(password);
      if (passwordError) throw new ApiError(passwordError, 400);

      if (confirmPassword) {
        const matchError = validators.passwordMatch(password, confirmPassword);
        if (matchError) throw new ApiError(matchError, 400);
      }
      const response = await resetPassword(token, password);
      return response;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Verify email mutation
 */
export const useVerifyEmail = (options?: {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}) => {
  return useMutation({
    mutationFn: async (token: string) => {
      if (!token?.trim()) throw new ApiError('Invalid verification token', 400);
      const response = await verifyEmail(token);
      return response;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

// =============================================
// 10. MUTATION HOOKS (User Management)
// =============================================

/**
 * Update profile mutation
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<User>;
    }) => {
      if (updates.email) {
        const emailError = validators.email(updates.email);
        if (emailError) throw new ApiError(emailError, 400);
      }
      if (updates.name) {
        const nameError = validators.name(updates.name);
        if (nameError) throw new ApiError(nameError, 400);
      }

      if (updates.role) {
        const roleError = validators.role(updates.role);
        if (roleError) throw new ApiError(roleError, 400);
      }
      const response = await updateUserProfile(id, updates);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });

      queryClient.invalidateQueries({ queryKey: authKeys.user(variables.id) });

      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

/**
 * File upload mutation
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadAvatar(file);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
};

/**
 * Delete user account mutation
 */
export const useDeleteUserAccount = () => {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const toast = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      if (currentUser?.role === 'admin' && currentUser._id === id) {
        throw new Error(
          'You cannot delete your own account. Please contact another admin if necessary.'
        );
      }
      return await deleteUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      toast({
        title: 'Successful message',
        description: 'User account deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    },
    onError: (error) => {
      console.error('Failed to delete user account:', error);
      toast({
        title: 'Action Not Allowed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });
};

/**
 * Deactivate user mutation
 */
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  const forceLogout = useForceLogout();
  const currentUser = useCurrentUser();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!id?.trim()) throw new ApiError('User ID is required', 400);
      const response = await deactivateUser(id);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: authKeys.activeUsers() });
      queryClient.invalidateQueries({
        queryKey: authKeys.userStatus(variables),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.users() });

      if (currentUser?._id === variables) {
        forceLogout('Your account has been deactivated');
      }
    },
  });
};

/**
 * Activate user mutation
 */
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!id?.trim()) throw new ApiError('User ID is required', 400);

      const response = await activateUser(id);

      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: authKeys.activeUsers() });
      queryClient.invalidateQueries({
        queryKey: authKeys.userStatus(variables),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

/**
 * Invalidate user tokens mutation
 */
export const useInvalidateUserTokens = () => {
  const queryClient = useQueryClient();
  const forceLogout = useForceLogout();
  const currentUser = useCurrentUser();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      if (!id?.trim()) throw new ApiError('User ID is required', 400);

      const response = await invalidateUserTokens(id, reason);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Token invalidation failed',
          400
        );
      }
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.userStatus(variables.id),
      });

      queryClient.invalidateQueries({
        queryKey: authKeys.users(),
      });

      if (currentUser?._id === variables.id) {
        forceLogout('Your session has been invalidated. Please login again.');
      }
    },
  });
};

// =============================================
// 13. UTILITY HOOKS
// =============================================

/**
 * Get current user from profile
 */
export const useCurrentUser = () => {
  const { data } = useProfile();
  return data?.user;
};

/**
 * Get profile completion status
 */
export const useProfileCompletion = () => {
  const { data } = useProfile();
  return data?.profileCompletion;
};

/**
 * Check if user is authenticated
 */

export const useIsAuthenticated = () => {
  const { data, isLoading, error, failureCount } = useProfile();
  const hasAuthError =
    error instanceof ApiError && (error.status === 401 || error.status === 403);
  const hasTooManyFailures = failureCount >= 2 && error;

  const isRefreshing = apiClient.isTokenRefreshing();

  return {
    isAuthenticated: !!data?.user && !hasAuthError,
    isLoading:
      (isLoading || isRefreshing) && !hasAuthError && !hasTooManyFailures,
    error: hasAuthError ? error : null,
    isRefreshing,
  };
};

/**
 * Check if user can perform specific action
 */
export const useCanPerformAction = (action: Action) => {
  const user = useCurrentUser();
  return permissionUtils.canPerformAction(user?.role, action);
};

/**
 * Check if user has any of the specified roles
 */
export const useHasAnyRole = (roles: UserRole[]) => {
  const user = useCurrentUser();
  return permissionUtils.hasAnyRole(user?.role, roles);
};

/**
 * Check if user is admin
 */
export const useIsAdmin = () => {
  const user = useCurrentUser();
  return permissionUtils.isAdmin(user?.role);
};

/**
 * Force logout utility
 */
export const useForceLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (message?: string) => {
    clearAuth();
    queryClient.clear();
    const url = message
      ? `/my-account?message=${encodeURIComponent(message)}`
      : '/my-account';
    navigate(url, { replace: true });
  };
};

/**
 * Check if current user can manage another user
 */
export const useCanManageUser = (userId: string | undefined) => {
  const currentUser = useCurrentUser();
  const isAdmin = permissionUtils.isAdmin(currentUser?.role);
  const isOwner = currentUser?._id === userId;

  return {
    canDeactivate: isAdmin || isOwner,
    canActivate: isAdmin,
    canInvalidateTokens: isAdmin || isOwner,
    canViewStatus: isAdmin || isOwner,
  };
};

/**
 * Get user activity status
 */
export const useUserActivityStatus = (userId: string) => {
  const { data: userStatus } = useUserStatus(userId);

  return {
    isActive: userStatus?.isActive ?? false,
    isEmailVerified: userStatus?.isEmailVerified ?? false,
    tokenVersion: userStatus?.tokenVersion ?? 0,
    lastUpdated: userStatus?.updatedAt,
  };
};

/**
 * Manage user online status
 */
export const useUserOnlineStatus = () => {
  const currentUser = useCurrentUser();

  return {
    isOnline: currentUser?.isOnline || false,
    lastSeen: currentUser?.lastSeen,
  };
};

// export const useOnlineStatusLifecycle = () => {
//   React.useEffect(() => {
//     if (!isAuthenticated()) return;

//     const setUserStatus = async (isOnline: boolean) => {
//       const token =
//         localStorage.getItem('accessToken') ||
//         sessionStorage.getItem('accessToken');
//       if (!token) return;

//       try {
//         const endpoint = isOnline ? '/auth/online' : '/auth/offline';
//         const apiBaseUrl = apiBase || 'http://localhost:8000/api';

//         await fetch(`${apiBaseUrl}${endpoint}`, {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//           credentials: 'include',
//         });
//       } catch (error) {
//         console.warn('Failed to update online status:', error);
//       }
//     };

//     // Set online when component mounts
//     setUserStatus(true);

//     const handleVisibilityChange = () => {
//       if (!isAuthenticated()) return;
//       setUserStatus(!document.hidden);
//     };

//     const handleBeforeUnload = () => {
//       // Use sendBeacon for more reliable offline status on page unload
//       const token =
//         localStorage.getItem('accessToken') ||
//         sessionStorage.getItem('accessToken');
//       if (token) {
//         const apiBaseUrl = apiBase || 'http://localhost:8000/api';
//         const data = new FormData();
//         navigator.sendBeacon(`${apiBaseUrl}/auth/offline`, data);
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     window.addEventListener('beforeunload', handleBeforeUnload);

//     return () => {
//       // Set offline when component unmounts
//       setUserStatus(false);
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//     };
//   }, []);
// };
