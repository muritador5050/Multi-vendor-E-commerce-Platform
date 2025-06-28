import { createContext, useContext } from 'react';
import type { User, AuthState, UserRole, Action } from '@/type/auth';

interface AuthContextType extends AuthState {
  // Core auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  logout: (redirect?: boolean) => Promise<void>;

  // Password methods
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    token: string,
    newPassword: string,
    confirmPassword?: string
  ) => Promise<void>;

  // Profile methods
  updateProfile: (updates: Partial<User>) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Permission-based methods
  canPerformAction: (action: Action) => boolean;
  canCreate: () => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  canRead: () => boolean;

  // Role utilities
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isVendor: () => boolean;
  isCustomer: () => boolean;

  // Get user permissions
  getUserPermissions: () => Action[];

  // Utilities
  uploadFile: <T = unknown>(file: File, endpoint?: string) => Promise<T>;
  clearError: () => void;
  forceLogout: (message?: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook with validation
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hooks for permissions
export const useCurrentUser = () => useAuth().user;
export const useIsAuthenticated = () => useAuth().isAuthenticated;
export const useCanCreate = () => useAuth().canCreate();
export const useCanEdit = () => useAuth().canEdit();
export const useCanDelete = () => useAuth().canDelete();
export const useCanRead = () => useAuth().canRead();
export const useIsAdmin = () => useAuth().isAdmin();
export const useIsVendor = () => useAuth().isVendor();
export const useUserPermissions = () => useAuth().getUserPermissions();

// Permission checker hook
export const usePermission = (action: Action) =>
  useAuth().canPerformAction(action);

// Export the context type for the provider
export type { AuthContextType };
