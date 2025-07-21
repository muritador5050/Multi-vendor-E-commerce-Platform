export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ProfileCompletion {
  percent: number;
  completed: number;
  totalFields: number;
}

export interface ProfileData {
  user: User;
  profileCompletion: ProfileCompletion;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  isOnline: boolean;
  lastSeen: Date;
  address?: Address;
  googleId?: string;
  facebookId?: string;
  avatar?: string;
  isActive?: boolean;
  tokenVersion?: number;
  isEmailVerified: boolean;
  profileCompletion?: number;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date | string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date | string;
  refreshToken?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UserStatusUpdate {
  _id: string;
  isActive: boolean;
  tokenVersion?: number;
}

export interface UserStatus {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: UserRole;
  phone?: string;
  isOnline: boolean;
  lastSeen: Date;
  tokenVersion?: number;
  createdAt: string;
  updatedAt: string;
  profileCompletion?: number;
}

export interface PaginatedUsers {
  users: UserStatus[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

export interface UserQueryParams {
  name?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
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
