import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { validators } from '@/utils/Validation';
import { permissionUtils } from '@/utils/Permission';
import {
  type User,
  type UserRole,
  type Action,
  type AuthResponse,
  type ProfileData,
} from '@/type/auth';
import { apiClient } from '@/utils/Api';
import { ApiError } from '@/utils/ApiError';
import type { ApiResponse } from '@/type/ApiResponse';

// API functions
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

async function login(email: string, password: string) {
  const response = await apiClient.publicApiRequest<ApiResponse<AuthResponse>>(
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

async function forgotPassword(email: string) {
  return apiClient.publicApiRequest<ApiResponse<null>>(
    '/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    }
  );
}

async function resetPassword(token: string, password: string) {
  return apiClient.publicApiRequest<ApiResponse<null>>(
    `/auth/reset-password/${token}`,
    {
      method: 'POST',
      body: JSON.stringify({ password }),
    }
  );
}

async function verifyEmail(token: string) {
  return apiClient.publicApiRequest<ApiResponse<null>>(
    `/auth/verify/${token}`,
    {
      method: 'GET',
    }
  );
}

async function getProfile() {
  return apiClient.authenticatedApiRequest<ApiResponse<ProfileData>>(
    '/auth/profile'
  );
}

async function updateProfile(data: Partial<User>) {
  return apiClient.authenticatedApiRequest<ApiResponse<{ user: User }>>(
    '/auth/profile',
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

async function uploadFile<T = unknown>(
  file: File,
  endpoint: string = '/upload'
) {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.authenticatedApiRequest<ApiResponse<T>>(endpoint, {
    method: 'POST',
    body: formData,
    headers: {},
  });
}

// Utility functions
function isAuthenticated(): boolean {
  return apiClient.isAuthenticated();
}

function clearAuth(): void {
  apiClient.clearAuth();
}

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

// Query keys
export const authKeys = {
  profile: ['auth', 'profile'] as const,
};

// Profile query
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: async () => {
      const response = await getProfile();
      if (!response.success) {
        throw new ApiError(response.message || 'Failed to fetch profile', 500);
      }
      return response.data;
    },
    enabled: isAuthenticated(),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
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

// Auth mutations
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const emailError = validators.email(email);
      if (emailError) throw new ApiError(emailError, 400);

      const passwordError = validators.password(password);
      if (passwordError) throw new ApiError(passwordError, 400);

      const response = await login(email.trim().toLowerCase(), password);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.user) {
        queryClient.invalidateQueries({ queryKey: authKeys.profile });
        navigate(permissionUtils.getDefaultRoute(data.user.role), {
          replace: true,
        });
      }
    },
  });
};

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

export const useLogout = (options?: { onSuccess?: () => void }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      navigate('/', { replace: true });
    },
    onSuccess: options?.onSuccess,
  });
};

export const useForgotPassword = (options?: { onSuccess?: () => void }) => {
  return useMutation({
    mutationFn: async (email: string) => {
      const emailError = validators.email(email);
      if (emailError) throw new ApiError(emailError, 400);

      const response = await forgotPassword(email.trim().toLowerCase());
      return response;
    },
    onSuccess: options?.onSuccess,
  });
};

export const useResetPassword = (options?: { onSuccess?: () => void }) => {
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
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (updates.email) {
        const emailError = validators.email(updates.email);
        if (emailError) throw new ApiError(emailError, 400);
      }
      if (updates.name) {
        const nameError = validators.name(updates.name);
        if (nameError) throw new ApiError(nameError, 400);
      }

      const response = await updateProfile(updates);
      if (!response.success) {
        throw new ApiError(response.message || 'Profile update failed', 400);
      }
      return response.data?.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!token?.trim()) throw new ApiError('Invalid verification token', 400);

      const response = await verifyEmail(token);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Email verification failed',
          400
        );
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({
      file,
      endpoint,
    }: {
      file: File;
      endpoint?: string;
    }) => {
      if (!isAuthenticated())
        throw new ApiError('Authentication required', 401);

      const response = await uploadFile(file, endpoint);
      if (!response.success) {
        throw new ApiError(response.message || 'File upload failed', 400);
      }
      return response.data;
    },
  });
};

// Utility hooks
export const useCurrentUser = () => {
  const { data } = useProfile();
  return data?.user;
};

export const useProfileCompletion = () => {
  const { data } = useProfile();
  return data?.profileCompletion;
};

export const useIsAuthenticated = () => {
  const { data, isLoading } = useProfile();
  return { isAuthenticated: !!data?.user, isLoading };
};

export const useCanPerformAction = (action: Action) => {
  const user = useCurrentUser();
  return permissionUtils.canPerformAction(user?.role, action);
};

export const useHasAnyRole = (roles: UserRole[]) => {
  const user = useCurrentUser();
  return permissionUtils.hasAnyRole(user?.role, roles);
};

export const useIsAdmin = () => {
  const user = useCurrentUser();
  return permissionUtils.isAdmin(user?.role);
};

export const useForceLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (message?: string) => {
    clearAuth();
    queryClient.clear();
    const url = message ? `/login?message=${encodeURIComponent(message)}` : '/';
    navigate(url, { replace: true });
  };
};
