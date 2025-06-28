// auth.ts - Centralized auth types and constants
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified?: boolean;
  profilecompletion?: number;
}

export const USER_ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
} as const;

export const ACTIONS = {
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  READ: 'read',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
