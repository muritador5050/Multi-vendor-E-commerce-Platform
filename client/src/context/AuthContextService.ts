// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom';
// import { validators } from '@/utils/Validation';
// import { permissionUtils } from '@/utils/Permission';
// import type {
//   User,
//   UserRole,
//   Action,
//   AuthResponse,
//   ProfileData,
//   UserStatus,
//   UserStatusUpdate,
//   UserQueryParams,
//   PaginatedUsers,
// } from '@/type/auth';
// import { apiBase, apiClient } from '@/utils/Api';
// import { ApiError } from '@/utils/ApiError';
// import type { ApiResponse } from '@/type/ApiResponse';
// import { buildQueryString } from '@/utils/QueryString';
// import React from 'react';

// // API functions
// async function register(
//   name: string,
//   email: string,
//   password: string,
//   confirmPassword: string
// ) {
//   return apiClient.publicApiRequest<ApiResponse<null>>('/auth/register', {
//     method: 'POST',
//     body: JSON.stringify({ name, email, password, confirmPassword }),
//   });
// }

// async function registerVendor(
//   name: string,
//   email: string,
//   password: string,
//   confirmPassword: string
// ) {
//   return apiClient.publicApiRequest<ApiResponse<null>>(
//     '/auth/vendor-register',
//     {
//       method: 'POST',
//       body: JSON.stringify({ name, email, password, confirmPassword }),
//     }
//   );
// }

// async function login(email: string, password: string, rememberMe: boolean) {
//   const response = await apiClient.publicApiRequest<ApiResponse<AuthResponse>>(
//     '/auth/login',
//     {
//       method: 'POST',
//       body: JSON.stringify({ email, password, rememberMe }),
//     }
//   );

//   if (response.data?.accessToken) {
//     localStorage.removeItem('accessToken');
//     sessionStorage.removeItem('accessToken');

//     // Always save the email for convenience (regardless of rememberMe)
//     localStorage.setItem('savedEmail', email);

//     if (rememberMe) {
//       localStorage.setItem('accessToken', response.data.accessToken);
//       localStorage.setItem('rememberMe', 'true');
//     } else {
//       sessionStorage.setItem('accessToken', response.data.accessToken);
//       localStorage.removeItem('rememberMe');
//     }
//   }
//   return response;
// }

// async function googleLogin() {
//   window.location.href = `${
//     apiBase || 'http://localhost:8000/api'
//   }/auth/google-signup`;
// }

// async function logout() {
//   try {
//     const response = await apiClient.authenticatedApiRequest<ApiResponse<null>>(
//       '/auth/logout',
//       {
//         method: 'POST',
//       }
//     );
//     apiClient.clearAuth();
//     return response;
//   } catch (error) {
//     apiClient.clearAuth();
//     throw error;
//   }
// }

// async function forgotPassword(email: string) {
//   return apiClient.publicApiRequest<ApiResponse<null>>(
//     '/auth/forgot-password',
//     {
//       method: 'POST',
//       body: JSON.stringify({ email }),
//     }
//   );
// }

// async function resetPassword(token: string, password: string) {
//   return apiClient.publicApiRequest<ApiResponse<null>>(
//     `/auth/reset-password/${token}`,
//     {
//       method: 'POST',
//       body: JSON.stringify({ password }),
//     }
//   );
// }

// async function verifyEmail(token: string) {
//   return apiClient.publicApiRequest<ApiResponse<null>>(
//     `/auth/verify-email/${token}`,
//     {
//       method: 'GET',
//     }
//   );
// }

// async function fetchUsers(
//   params: UserQueryParams = {}
// ): Promise<PaginatedUsers> {
//   const queryString = buildQueryString(params);
//   const url = `/auth/users${queryString ? `?${queryString}` : ''}`;

//   try {
//     const response = await apiClient.authenticatedApiRequest<
//       ApiResponse<PaginatedUsers>
//     >(url);

//     return response.data!;
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     throw error;
//   }
// }

// async function getUserById(id: string) {
//   return apiClient.authenticatedApiRequest<ApiResponse<UserStatus>>(
//     `/auth/users/${id}`
//   );
// }

// async function getProfile() {
//   return apiClient.authenticatedApiRequest<ApiResponse<ProfileData>>(
//     '/auth/profile'
//   );
// }

// async function updateProfile(data: Partial<User>) {
//   return apiClient.authenticatedApiRequest<ApiResponse<{ user: User }>>(
//     '/auth/profile',
//     {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     }
//   );
// }

// async function uploadFile<T = unknown>(
//   file: File,
//   endpoint: string = '/upload'
// ) {
//   const formData = new FormData();
//   formData.append('file', file);

//   return apiClient.authenticatedApiRequest<ApiResponse<T>>(endpoint, {
//     method: 'POST',
//     body: formData,
//     headers: {},
//   });
// }

// async function deleteUser(id: string) {
//   return apiClient.authenticatedApiRequest(`/auth/users/${id}`, {
//     method: 'DELETE',
//   });
// }

// // Deactivate user
// async function deactivateUser(id: string) {
//   return apiClient.authenticatedApiRequest<ApiResponse<UserStatusUpdate>>(
//     `/users/${id}/deactivate`,
//     {
//       method: 'PATCH',
//     }
//   );
// }

// // Activate user
// async function activateUser(id: string) {
//   return apiClient.authenticatedApiRequest<ApiResponse<UserStatusUpdate>>(
//     `/users/${id}/activate`,
//     {
//       method: 'PATCH',
//     }
//   );
// }

// // Invalidate user tokens
// async function invalidateUserTokens(id: string) {
//   return apiClient.authenticatedApiRequest<
//     ApiResponse<{ id: string; tokenVersion: number }>
//   >(`/users/${id}/invalidate-tokens`, {
//     method: 'PATCH',
//   });
// }

// // Get user status
// async function getUserStatus(id: string) {
//   return apiClient.authenticatedApiRequest<ApiResponse<UserStatus>>(
//     `/users/${id}/status`
//   );
// }

// // Utility functions
// function isAuthenticated(): boolean {
//   return apiClient.isAuthenticated();
// }

// function clearAuth(): void {
//   apiClient.clearAuth();
// }

// //Online
// function setUserOnline() {
//   return apiClient.authenticatedApiRequest<
//     ApiResponse<{ isOnline: boolean; lastSeen: Date }>
//   >('/auth/online', {
//     method: 'POST',
//   });
// }

// //Offline
// function setUserOffline() {
//   return apiClient.authenticatedApiRequest<
//     ApiResponse<{ isOnline: boolean; lastSeen: Date }>
//   >('/auth/offline', { method: 'POST' });
// }

// function updateHeartbeat() {
//   return apiClient.authenticatedApiRequest<ApiResponse<{ success: boolean }>>(
//     '/auth/heartbeat',
//     {
//       method: 'POST',
//     }
//   );
// }
// function getOnlineUsers() {
//   return apiClient.authenticatedApiRequest<ApiResponse<User[]>>(
//     '/auth/online-users',
//     {
//       method: 'GET',
//     }
//   );
// }

// function validateRegistration(
//   name: string,
//   email: string,
//   password: string,
//   confirmPassword: string
// ) {
//   const nameError = validators.name(name);
//   if (nameError) throw new ApiError(nameError, 400);

//   const emailError = validators.email(email);
//   if (emailError) throw new ApiError(emailError, 400);

//   const passwordError = validators.password(password);
//   if (passwordError) throw new ApiError(passwordError, 400);

//   const matchError = validators.passwordMatch(password, confirmPassword);
//   if (matchError) throw new ApiError(matchError, 400);
// }

// export const authKeys = {
//   all: ['auth'] as const,
//   users: () => [...authKeys.all, 'list'] as const,
//   user: (id: string) => [...authKeys.all, 'detail', id] as const,
//   profile: () => [...authKeys.all, 'profile'] as const,
//   activeUsers: () => [...authKeys.users(), 'active'] as const,
//   userStatus: (id: string) => [...authKeys.user(id), 'status'] as const,
//   onlineUsers: () => [...authKeys.users(), 'online'] as const,
// };

// export const useUsers = (params: UserQueryParams = {}) => {
//   return useQuery({
//     queryKey: [...authKeys.users(), params],
//     queryFn: () => fetchUsers(params),
//     enabled: isAuthenticated(),
//     staleTime: 5 * 60 * 1000,
//     retry: (failureCount, error) => {
//       if (
//         error instanceof ApiError &&
//         error.status >= 400 &&
//         error.status < 500
//       ) {
//         return false;
//       }
//       return failureCount < 3;
//     },
//   });
// };

// export const useUserById = (id: string) => {
//   return useQuery({
//     queryKey: authKeys.user(id),
//     queryFn: async () => {
//       const response = await getUserById(id);
//       return response.data;
//     },
//     enabled: !!id && isAuthenticated(),
//     staleTime: 5 * 60 * 1000,
//     retry: (failureCount, error) => {
//       if (
//         error instanceof ApiError &&
//         error.status >= 400 &&
//         error.status < 500
//       ) {
//         return false;
//       }
//       return failureCount < 3;
//     },
//   });
// };

// // Profile query
// export const useProfile = () => {
//   return useQuery({
//     queryKey: authKeys.profile(),
//     queryFn: async () => {
//       const response = await getProfile();
//       return response.data;
//     },
//     enabled: isAuthenticated(),
//     staleTime: 5 * 60 * 1000,
//     retry: (failureCount, error) => {
//       // Don't retry on client errors (4xx)
//       if (
//         error instanceof ApiError &&
//         error.status >= 400 &&
//         error.status < 500
//       ) {
//         return false;
//       }
//       return failureCount < 3;
//     },
//   });
// };

// // Get user status
// export const useUserStatus = (id: string) => {
//   const user = useCurrentUser();
//   const canView = permissionUtils.isAdmin(user?.role) || user?._id === id;

//   return useQuery({
//     queryKey: authKeys.userStatus(id),
//     queryFn: async () => {
//       const response = await getUserStatus(id);
//       return response.data;
//     },
//     enabled: !!id && isAuthenticated() && canView,
//     staleTime: 1 * 60 * 1000, // 1 minute
//     retry: (failureCount, error) => {
//       if (
//         error instanceof ApiError &&
//         error.status >= 400 &&
//         error.status < 500
//       ) {
//         return false;
//       }
//       return failureCount < 3;
//     },
//   });
// };

// // Auth mutations
// export const useLogin = () => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const setOnline = useSetUserOnline();

//   return useMutation({
//     mutationFn: async ({
//       email,
//       password,
//       rememberMe = false,
//     }: {
//       email: string;
//       password: string;
//       rememberMe?: boolean;
//     }) => {
//       const emailError = validators.email(email);
//       if (emailError) throw new ApiError(emailError, 400);

//       const passwordError = validators.password(password);
//       if (passwordError) throw new ApiError(passwordError, 400);

//       const response = await login(
//         email.trim().toLowerCase(),
//         password,
//         rememberMe
//       );
//       return response.data;
//     },
//     onSuccess: async (data) => {
//       if (data?.user) {
//         queryClient.invalidateQueries({ queryKey: authKeys.profile() });

//         //Set user online afer successful login
//         try {
//           await setOnline.mutateAsync();
//           apiClient.startHeartBeat();
//         } catch (error) {
//           console.warn('Failed to set user online after login:', error);
//         }
//         navigate(permissionUtils.getDefaultRoute(data.user.role), {
//           replace: true,
//         });
//       }
//     },
//   });
// };

// export const useGoogleLogin = () => {
//   return useMutation({
//     mutationFn: googleLogin,
//     onError: (error) => {
//       console.error('Google login failed:', error);
//     },
//   });
// };

// //Online Users Query Hook
// export const useOnlineUsers = () => {
//   const currentUser = useCurrentUser();
//   const canView = permissionUtils.isAdmin(currentUser?.role);

//   return useQuery({
//     queryKey: authKeys.onlineUsers(),
//     queryFn: async () => {
//       const response = await getOnlineUsers();
//       return response.data;
//     },
//     enabled: isAuthenticated() && canView,
//     staleTime: 30 * 1000,
//     refetchInterval: 60 * 1000,
//     retry: (failureCount, error) => {
//       if (
//         error instanceof ApiError &&
//         error.status >= 400 &&
//         error.status < 500
//       ) {
//         return false;
//       }
//       return failureCount < 2;
//     },
//   });
// };

// //Set User Online
// export const useSetUserOnline = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: setUserOnline,
//     onSuccess: (data) => {
//       // Update profile cache with new online status
//       queryClient.setQueryData(
//         authKeys.profile(),
//         (old: ProfileData | undefined) => {
//           if (old?.user) {
//             return {
//               ...old,
//               data: {
//                 ...old.user,
//                 user: {
//                   ...old.user,
//                   isOnline: data.data?.isOnline,
//                   lastSeen: data.data?.lastSeen,
//                 },
//               },
//             };
//           }
//           return old;
//         }
//       );

//       // Invalidate online users list
//       queryClient.invalidateQueries({ queryKey: authKeys.onlineUsers() });
//     },
//     onError: (error) => {
//       console.error('Failed to set user online:', error);
//     },
//   });
// };

// // Set User Offline Mutation
// export const useSetUserOffline = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: setUserOffline,
//     onSuccess: (data) => {
//       // Update profile cache with new offline status
//       queryClient.setQueryData(
//         authKeys.profile(),
//         (old: ProfileData | undefined) => {
//           if (old?.user) {
//             return {
//               ...old,
//               data: {
//                 ...old.user,
//                 user: {
//                   ...old.user,
//                   isOnline: data.data?.isOnline,
//                   lastSeen: data.data?.lastSeen,
//                 },
//               },
//             };
//           }
//           return old;
//         }
//       );

//       // Invalidate online users list
//       queryClient.invalidateQueries({ queryKey: authKeys.onlineUsers() });
//     },
//     onError: (error) => {
//       console.error('Failed to set user offline:', error);
//     },
//   });
// };

// // Heartbeat Mutation (for internal use)
// export const useUpdateHeartbeat = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: updateHeartbeat,
//     onSuccess: () => {
//       // Optionally update last seen in profile cache
//       queryClient.setQueryData(
//         authKeys.profile(),
//         (old: ProfileData | undefined) => {
//           if (old?.user) {
//             return {
//               ...old,
//               data: {
//                 ...old.user,
//                 user: {
//                   ...old.user,
//                   lastSeen: new Date(),
//                   isOnline: true,
//                 },
//               },
//             };
//           }
//           return old;
//         }
//       );
//     },
//     retry: 2,
//     // Don't show errors for heartbeat failures
//     onError: () => {
//       // Silent failure for heartbeat
//     },
//   });
// };

// export const useRegister = (options?: { onSuccess?: () => void }) => {
//   return useMutation({
//     mutationFn: async ({
//       name,
//       email,
//       password,
//       confirmPassword,
//     }: {
//       name: string;
//       email: string;
//       password: string;
//       confirmPassword: string;
//     }) => {
//       validateRegistration(name, email, password, confirmPassword);
//       const response = await register(
//         name.trim(),
//         email.trim().toLowerCase(),
//         password,
//         confirmPassword
//       );

//       return response;
//     },
//     onSuccess: options?.onSuccess,
//   });
// };

// export const useRegisterVendor = (options?: { onSuccess?: () => void }) => {
//   return useMutation({
//     mutationFn: async ({
//       name,
//       email,
//       password,
//       confirmPassword,
//     }: {
//       name: string;
//       email: string;
//       password: string;
//       confirmPassword: string;
//     }) => {
//       validateRegistration(name, email, password, confirmPassword);
//       const response = await registerVendor(
//         name.trim(),
//         email.trim().toLowerCase(),
//         password,
//         confirmPassword
//       );

//       return response;
//     },
//     onSuccess: options?.onSuccess,
//   });
// };

// export const useLogout = (options?: { onSuccess?: () => void }) => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const setOffline = useSetUserOffline();

//   return useMutation({
//     mutationFn: async () => {
//       try {
//         await setOffline.mutateAsync();
//       } catch (error) {
//         console.warn('Failed to set user offline during logout:', error);
//       }
//       apiClient.stopHeartbeat();

//       return logout();
//     },
//     onSuccess: options?.onSuccess,
//     onSettled: () => {
//       queryClient.clear();
//       navigate('/', { replace: true });
//     },
//   });
// };

// export const useForgotPassword = (options?: { onSuccess?: () => void }) => {
//   return useMutation({
//     mutationFn: async (email: string) => {
//       const emailError = validators.email(email);
//       if (emailError) throw new ApiError(emailError, 400);

//       const response = await forgotPassword(email.trim().toLowerCase());
//       return response;
//     },
//     onSuccess: options?.onSuccess,
//   });
// };

// export const useResetPassword = (options?: { onSuccess?: () => void }) => {
//   return useMutation({
//     mutationFn: async ({
//       token,
//       password,
//       confirmPassword,
//     }: {
//       token: string;
//       password: string;
//       confirmPassword?: string;
//     }) => {
//       if (!token?.trim()) throw new ApiError('Invalid reset token', 400);

//       const passwordError = validators.password(password);
//       if (passwordError) throw new ApiError(passwordError, 400);

//       if (confirmPassword) {
//         const matchError = validators.passwordMatch(password, confirmPassword);
//         if (matchError) throw new ApiError(matchError, 400);
//       }
//       const response = await resetPassword(token, password);
//       return response;
//     },
//     onSuccess: options?.onSuccess,
//   });
// };

// export const useUpdateProfile = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (updates: Partial<User>) => {
//       if (updates.email) {
//         const emailError = validators.email(updates.email);
//         if (emailError) throw new ApiError(emailError, 400);
//       }
//       if (updates.name) {
//         const nameError = validators.name(updates.name);
//         if (nameError) throw new ApiError(nameError, 400);
//       }
//       const response = await updateProfile(updates);
//       return response.data?.user;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: authKeys.profile() });
//     },
//   });
// };

// export const useVerifyEmail = (options?: {
//   onSuccess?: () => void;
//   onError?: (error: ApiError) => void;
// }) => {
//   return useMutation({
//     mutationFn: async (token: string) => {
//       if (!token?.trim()) throw new ApiError('Invalid verification token', 400);
//       const response = await verifyEmail(token);
//       return response;
//     },
//     onSuccess: options?.onSuccess,
//     onError: options?.onError,
//   });
// };

// export const useUploadFile = () => {
//   return useMutation({
//     mutationFn: async ({
//       file,
//       endpoint,
//     }: {
//       file: File;
//       endpoint?: string;
//     }) => {
//       if (!isAuthenticated())
//         throw new ApiError('Authentication required', 401);

//       const response = await uploadFile(file, endpoint);
//       if (!response.success) {
//         throw new ApiError(response.message || 'File upload failed', 400);
//       }
//       return response.data;
//     },
//   });
// };

// //useDeleteUserAccount **
// export const useDeleteUserAccount = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id: string) => {
//       return await deleteUser(id);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: authKeys.users() });
//     },
//     onError: (error) => {
//       console.error('Failed to delete user account:', error);
//     },
//   });
// };

// // Deactivate user mutation
// export const useDeactivateUser = () => {
//   const queryClient = useQueryClient();
//   const forceLogout = useForceLogout();
//   const currentUser = useCurrentUser();

//   return useMutation({
//     mutationFn: async (id: string) => {
//       if (!id?.trim()) throw new ApiError('User ID is required', 400);

//       const response = await deactivateUser(id);
//       if (!response.success) {
//         throw new ApiError(response.message || 'User deactivation failed', 400);
//       }
//       return response.data;
//     },
//     onSuccess: (_data, variables) => {
//       // Invalidate related queries
//       queryClient.invalidateQueries({ queryKey: authKeys.activeUsers() });
//       queryClient.invalidateQueries({
//         queryKey: authKeys.userStatus(variables),
//       });
//       queryClient.invalidateQueries({ queryKey: authKeys.users() });

//       // If user deactivated themselves, force logout
//       if (currentUser?._id === variables) {
//         forceLogout('Your account has been deactivated');
//       }
//     },
//   });
// };

// // Activate user mutation
// export const useActivateUser = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (id: string) => {
//       if (!id?.trim()) throw new ApiError('User ID is required', 400);

//       const response = await activateUser(id);
//       if (!response.success) {
//         throw new ApiError(response.message || 'User activation failed', 400);
//       }
//       return response.data;
//     },
//     onSuccess: (_data, variables) => {
//       // Invalidate related queries
//       queryClient.invalidateQueries({ queryKey: authKeys.activeUsers() });
//       queryClient.invalidateQueries({
//         queryKey: authKeys.userStatus(variables),
//       });
//       queryClient.invalidateQueries({ queryKey: authKeys.users() });
//     },
//   });
// };

// // Invalidate user tokens mutation
// export const useInvalidateUserTokens = () => {
//   const queryClient = useQueryClient();
//   const forceLogout = useForceLogout();
//   const currentUser = useCurrentUser();

//   return useMutation({
//     mutationFn: async (id: string) => {
//       if (!id?.trim()) throw new ApiError('User ID is required', 400);

//       const response = await invalidateUserTokens(id);
//       if (!response.success) {
//         throw new ApiError(
//           response.message || 'Token invalidation failed',
//           400
//         );
//       }
//       return response.data;
//     },
//     onSuccess: (_data, variables) => {
//       // Invalidate related queries
//       queryClient.invalidateQueries({
//         queryKey: authKeys.userStatus(variables),
//       });

//       // If user invalidated their own tokens, force logout
//       if (currentUser?._id === variables) {
//         forceLogout('Your session has been invalidated. Please login again.');
//       }
//     },
//   });
// };

// // Utility hooks
// export const useCurrentUser = () => {
//   const { data } = useProfile();
//   return data?.user;
// };

// export const useProfileCompletion = () => {
//   const { data } = useProfile();
//   return data?.profileCompletion;
// };

// export const useIsAuthenticated = () => {
//   const { data, isLoading } = useProfile();
//   return { isAuthenticated: !!data?.user, isLoading };
// };

// export const useCanPerformAction = (action: Action) => {
//   const user = useCurrentUser();
//   return permissionUtils.canPerformAction(user?.role, action);
// };

// export const useHasAnyRole = (roles: UserRole[]) => {
//   const user = useCurrentUser();
//   return permissionUtils.hasAnyRole(user?.role, roles);
// };

// export const useIsAdmin = () => {
//   const user = useCurrentUser();
//   return permissionUtils.isAdmin(user?.role);
// };

// export const useForceLogout = () => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   return (message?: string) => {
//     clearAuth();
//     queryClient.clear();
//     const url = message
//       ? `/my-account?message=${encodeURIComponent(message)}`
//       : '/';
//     navigate(url, { replace: true });
//   };
// };

// // Check if current user can manage a specific user
// export const useCanManageUser = (userId: string | undefined) => {
//   const currentUser = useCurrentUser();
//   const isAdmin = permissionUtils.isAdmin(currentUser?.role);
//   const isOwner = currentUser?._id === userId;

//   return {
//     canDeactivate: isAdmin || isOwner,
//     canActivate: isAdmin,
//     canInvalidateTokens: isAdmin || isOwner,
//     canViewStatus: isAdmin || isOwner,
//   };
// };

// // Get user activity status
// export const useUserActivityStatus = (userId: string) => {
//   const { data: userStatus } = useUserStatus(userId);

//   return {
//     isActive: userStatus?.isActive ?? false,
//     isEmailVerified: userStatus?.isEmailVerified ?? false,
//     tokenVersion: userStatus?.tokenVersion ?? 0,
//     lastUpdated: userStatus?.updatedAt,
//   };
// };

// export const useUserOnlineStatus = () => {
//   const currentUser = useCurrentUser();
//   const setOnline = useSetUserOnline();
//   const setOffline = useSetUserOffline();
//   const updateHeartbeat = useUpdateHeartbeat();

//   //Start online session
//   const startOnlineSession = () => {
//     setOnline.mutate();
//     apiClient.startHeartBeat();
//   };

//   // End online session
//   const endOnlineSession = () => {
//     setOffline.mutate();
//     apiClient.stopHeartbeat();
//   };

//   // Manual heartbeat update
//   const sendHeartbeat = () => {
//     updateHeartbeat.mutate();
//   };

//   return {
//     isOnline: currentUser?.isOnline || false,
//     lastSeen: currentUser?.lastSeen,
//     startOnlineSession,
//     endOnlineSession,
//     sendHeartbeat,
//     isSettingOnline: setOnline.isPending,
//     isSettingOffline: setOffline.isPending,
//   };
// };

// //Hook for window/tab lifecycle management
// export const useOnlineStatusLifecycle = () => {
//   const { startOnlineSession, endOnlineSession } = useUserOnlineStatus();

//   React.useEffect(() => {
//     if (!isAuthenticated()) return;

//     //Set online when component mount (app starts)
//     startOnlineSession();

//     //Handle page visibility changes
//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         endOnlineSession();
//       } else {
//         startOnlineSession();
//       }
//     };

//     //Handle page unload
//     const handleBeforeUnload = () => {
//       //SendBeacon for reliable offline status
//       try {
//         navigator.sendBeacon(`${apiBase}/auth/offline`, JSON.stringify({}));
//       } catch (error) {
//         console.warn('Failed to send offline beacon:', error);
//       }
//     };

//     //Add event listeners
//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     window.addEventListener('beforeunload', handleBeforeUnload);

//     //Cleanup

//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       endOnlineSession();
//     };
//   }, [startOnlineSession, endOnlineSession]);
// };

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
import React from 'react';
import { useToast } from '@chakra-ui/react';

// =============================================
// 1. TYPE DEFINITIONS (if needed, otherwise keep imports)
// =============================================

// =============================================
// 2. CONSTANTS AND CONFIGURATION
// =============================================

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

// =============================================
// 3. API FUNCTIONS (Authentication Related)
// =============================================

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
async function login(email: string, password: string, rememberMe: boolean) {
  const response = await apiClient.publicApiRequest<ApiResponse<AuthResponse>>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    }
  );

  if (response.data?.accessToken) {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');

    // Always save the email for convenience (regardless of rememberMe)
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

// =============================================
// 4. API FUNCTIONS (User Management)
// =============================================

/**
 * Fetch paginated list of users
 */
async function fetchUsers(
  params: UserQueryParams = {}
): Promise<PaginatedUsers> {
  const queryString = buildQueryString(params);
  const url = `/auth/users${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await apiClient.authenticatedApiRequest<
      ApiResponse<PaginatedUsers>
    >(url);

    return response.data!;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
async function getUserById(id: string) {
  return apiClient.authenticatedApiRequest<ApiResponse<UserStatus>>(
    `/auth/users/${id}`
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
async function updateProfile(data: Partial<User>) {
  return apiClient.authenticatedApiRequest<ApiResponse<{ user: User }>>(
    '/auth/profile',
    {
      method: 'PUT',
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

// =============================================
// 5. API FUNCTIONS (User Status Management)
// =============================================

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
async function invalidateUserTokens(id: string) {
  return apiClient.authenticatedApiRequest<
    ApiResponse<{ id: string; tokenVersion: number }>
  >(`/auth/users/${id}/invalidate-tokens`, {
    method: 'PATCH',
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

// =============================================
// 6. API FUNCTIONS (Online Status Management)
// =============================================

/**
 * Set user as online
 */
function setUserOnline() {
  return apiClient.authenticatedApiRequest<
    ApiResponse<{ isOnline: boolean; lastSeen: Date }>
  >('/auth/online', {
    method: 'POST',
  });
}

/**
 * Set user as offline
 */
function setUserOffline() {
  return apiClient.authenticatedApiRequest<
    ApiResponse<{ isOnline: boolean; lastSeen: Date }>
  >('/auth/offline', { method: 'POST' });
}

/**
 * Update user's heartbeat
 */
function updateHeartbeat() {
  return apiClient.authenticatedApiRequest<ApiResponse<{ success: boolean }>>(
    '/auth/heartbeat',
    {
      method: 'POST',
    }
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

// =============================================
// 7. UTILITY FUNCTIONS
// =============================================

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

// =============================================
// 8. QUERY HOOKS (Data Fetching)
// =============================================

/**
 * Fetch paginated list of users
 */
export const useUsers = (params: UserQueryParams = {}) => {
  return useQuery({
    queryKey: [...authKeys.users(), params],
    queryFn: () => fetchUsers(params),
    enabled: isAuthenticated(),
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
      const response = await getProfile();
      return response.data;
    },
    enabled: isAuthenticated(),
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
  const setOnline = useSetUserOnline();

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
      if (data?.user) {
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });

        //Set user online afer successful login
        try {
          await setOnline.mutateAsync();
          apiClient.startHeartBeat();
        } catch (error) {
          console.warn('Failed to set user online after login:', error);
        }
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

/**
 * Logout mutation
 */
export const useLogout = (options?: { onSuccess?: () => void }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setOffline = useSetUserOffline();

  return useMutation({
    mutationFn: async () => {
      try {
        await setOffline.mutateAsync();
      } catch (error) {
        console.warn('Failed to set user offline during logout:', error);
      }
      apiClient.stopHeartbeat();

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
      return response.data?.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
};

/**
 * File upload mutation
 */
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

// =============================================
// 11. MUTATION HOOKS (User Status Management)
// =============================================

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
    mutationFn: async (id: string) => {
      if (!id?.trim()) throw new ApiError('User ID is required', 400);

      const response = await invalidateUserTokens(id);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Token invalidation failed',
          400
        );
      }
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: authKeys.userStatus(variables),
      });

      // If user invalidated their own tokens, force logout
      if (currentUser?._id === variables) {
        forceLogout('Your session has been invalidated. Please login again.');
      }
    },
  });
};

// =============================================
// 12. MUTATION HOOKS (Online Status Management)
// =============================================

/**
 * Set user online mutation
 */
export const useSetUserOnline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setUserOnline,
    onSuccess: (data) => {
      // Update profile cache with new online status
      queryClient.setQueryData(
        authKeys.profile(),
        (old: ProfileData | undefined) => {
          if (old?.user) {
            return {
              ...old,
              data: {
                ...old.user,
                user: {
                  ...old.user,
                  isOnline: data.data?.isOnline,
                  lastSeen: data.data?.lastSeen,
                },
              },
            };
          }
          return old;
        }
      );

      // Invalidate online users list
      queryClient.invalidateQueries({ queryKey: authKeys.onlineUsers() });
    },
    onError: (error) => {
      console.error('Failed to set user online:', error);
    },
  });
};

/**
 * Set user offline mutation
 */
export const useSetUserOffline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setUserOffline,
    onSuccess: (data) => {
      // Update profile cache with new offline status
      queryClient.setQueryData(
        authKeys.profile(),
        (old: ProfileData | undefined) => {
          if (old?.user) {
            return {
              ...old,
              data: {
                ...old.user,
                user: {
                  ...old.user,
                  isOnline: data.data?.isOnline,
                  lastSeen: data.data?.lastSeen,
                },
              },
            };
          }
          return old;
        }
      );

      // Invalidate online users list
      queryClient.invalidateQueries({ queryKey: authKeys.onlineUsers() });
    },
    onError: (error) => {
      console.error('Failed to set user offline:', error);
    },
  });
};

/**
 * Heartbeat mutation (for internal use)
 */
export const useUpdateHeartbeat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHeartbeat,
    onSuccess: () => {
      // Optionally update last seen in profile cache
      queryClient.setQueryData(
        authKeys.profile(),
        (old: ProfileData | undefined) => {
          if (old?.user) {
            return {
              ...old,
              data: {
                ...old.user,
                user: {
                  ...old.user,
                  lastSeen: new Date(),
                  isOnline: true,
                },
              },
            };
          }
          return old;
        }
      );
    },
    retry: 2,
    // Don't show errors for heartbeat failures
    onError: () => {
      // Silent failure for heartbeat
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
  const { data, isLoading } = useProfile();
  return { isAuthenticated: !!data?.user, isLoading };
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
      : '/';
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

// =============================================
// 14. ONLINE STATUS HOOKS
// =============================================

/**
 * Manage user online status
 */
export const useUserOnlineStatus = () => {
  const currentUser = useCurrentUser();
  const setOnline = useSetUserOnline();
  const setOffline = useSetUserOffline();
  const updateHeartbeat = useUpdateHeartbeat();

  //Start online session
  const startOnlineSession = () => {
    setOnline.mutate();
    apiClient.startHeartBeat();
  };

  // End online session
  const endOnlineSession = () => {
    setOffline.mutate();
    apiClient.stopHeartbeat();
  };

  // Manual heartbeat update
  const sendHeartbeat = () => {
    updateHeartbeat.mutate();
  };

  return {
    isOnline: currentUser?.isOnline || false,
    lastSeen: currentUser?.lastSeen,
    startOnlineSession,
    endOnlineSession,
    sendHeartbeat,
    isSettingOnline: setOnline.isPending,
    isSettingOffline: setOffline.isPending,
  };
};

/**
 * Hook for window/tab lifecycle management
 */
export const useOnlineStatusLifecycle = () => {
  const { startOnlineSession, endOnlineSession } = useUserOnlineStatus();

  React.useEffect(() => {
    if (!isAuthenticated()) return;

    //Set online when component mount (app starts)
    startOnlineSession();

    //Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        endOnlineSession();
      } else {
        startOnlineSession();
      }
    };

    //Handle page unload
    const handleBeforeUnload = () => {
      //SendBeacon for reliable offline status
      try {
        navigator.sendBeacon(`${apiBase}/auth/offline`, JSON.stringify({}));
      } catch (error) {
        console.warn('Failed to send offline beacon:', error);
      }
    };

    //Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    //Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endOnlineSession();
    };
  }, [startOnlineSession, endOnlineSession]);
};
