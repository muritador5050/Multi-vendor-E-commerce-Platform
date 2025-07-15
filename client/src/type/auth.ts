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
  address?: Address;
  googleId?: string;
  facebookId?: string;
  avatar?: string;
  isEmailVerified: boolean;
  profileCompletion?: number;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
