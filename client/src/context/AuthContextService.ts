import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiService from '@/api/ApiService';
import { validators } from '@/utils/Validation';
import { permissionUtils } from '@/utils/Permission';
import { type User, type UserRole, type Action } from '@/type/auth';

// Query keys
export const authKeys = {
  profile: ['auth', 'profile'] as const,
};

// Profile query
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: async () => {
      const response = await apiService.getProfile();
      return response.data?.user || null;
    },
    enabled: apiService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

// Validation helper
const validateRegistration = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
) => {
  const nameError = validators.name(name);
  if (nameError) throw new Error(nameError);

  const emailError = validators.email(email);
  if (emailError) throw new Error(emailError);

  const passwordError = validators.password(password);
  if (passwordError) throw new Error(passwordError);

  const matchError = validators.passwordMatch(password, confirmPassword);
  if (matchError) throw new Error(matchError);
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
      if (emailError) throw new Error(emailError);

      const passwordError = validators.password(password);
      if (passwordError) throw new Error(passwordError);

      const response = await apiService.login(
        email.trim().toLowerCase(),
        password
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.user) {
        queryClient.setQueryData(authKeys.profile, data.user);
        navigate(permissionUtils.getDefaultRoute(data.user.role), {
          replace: true,
        });
      }
    },
  });
};

export const useRegister = () => {
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

      return apiService.register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        confirmPassword
      );
    },
  });
};

export const useRegisterVendor = () => {
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

      return apiService.registerVendor(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        confirmPassword
      );
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiService.logout();
    },
    onSettled: () => {
      queryClient.setQueryData(authKeys.profile, null);
      queryClient.clear();
      navigate('/', { replace: true });
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const emailError = validators.email(email);
      if (emailError) throw new Error(emailError);

      return apiService.forgotPassword(email.trim().toLowerCase());
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

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
      if (!token?.trim()) throw new Error('Invalid reset token');

      const passwordError = validators.password(password);
      if (passwordError) throw new Error(passwordError);

      if (confirmPassword) {
        const matchError = validators.passwordMatch(password, confirmPassword);
        if (matchError) throw new Error(matchError);
      }

      return apiService.resetPassword(token, password);
    },
    onSuccess: () => {
      navigate(
        '/auth/login?message=Password reset successful. Please log in.',
        {
          replace: true,
        }
      );
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (updates.email) {
        const emailError = validators.email(updates.email);
        if (emailError) throw new Error(emailError);
      }
      if (updates.name) {
        const nameError = validators.name(updates.name);
        if (nameError) throw new Error(nameError);
      }

      const response = await apiService.updateProfile(updates);
      return response.data?.user;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        queryClient.setQueryData(authKeys.profile, updatedUser);
      }
    },
  });
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!token?.trim()) throw new Error('Invalid verification token');
      return apiService.verifyEmail(token);
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
      if (!apiService.isAuthenticated())
        throw new Error('Authentication required');
      const response = await apiService.uploadFile(file, endpoint);
      return response.data;
    },
  });
};

// Essential utility hooks only
export const useCurrentUser = () => {
  const { data: user } = useProfile();
  return user;
};

export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useProfile();
  return { isAuthenticated: !!user, isLoading };
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
    apiService.clearAuth();
    queryClient.setQueryData(authKeys.profile, null);
    queryClient.clear();

    const url = message ? `/login?message=${encodeURIComponent(message)}` : '/';
    navigate(url, { replace: true });
  };
};
