import type { User } from './auth';

// === TYPES ===
export interface VendorDocument {
  _id: string;
  type: string;
  url: string;
  name: string;
  uploadedAt: Date;
}

export interface BusinessHours {
  monday: { open: string; close: string; isClosed: boolean };
  tuesday: { open: string; close: string; isClosed: boolean };
  wednesday: { open: string; close: string; isClosed: boolean };
  thursday: { open: string; close: string; isClosed: boolean };
  friday: { open: string; close: string; isClosed: boolean };
  saturday: { open: string; close: string; isClosed: boolean };
  sunday: { open: string; close: string; isClosed: boolean };
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderNotifications: boolean;
  marketingNotifications: boolean;
}

export interface Vendor {
  _id: string;
  userId: string;
  businessName: string;
  storeName: string;
  storeDescription: string;
  storeLogo?: string;
  storeSlug: string;
  businessType: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  rating: number;
  reviewCount: number;
  totalOrders: number;
  totalRevenue: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  verificationDocuments: VendorDocument[];
  verifiedAt?: Date;
  verifiedBy?: string;
  isActive: boolean;
  deactivationReason?: string;
  deactivatedAt?: Date;
  businessHours: BusinessHours;
  socialMedia: SocialMedia;
  notificationSettings: NotificationSettings;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorProfile extends Vendor {
  user: User;
}

export interface PublicVendor {
  id: string;
  businessName: string;
  storeName: string;
  storeDescription: string;
  storeLogo?: string;
  storeSlug: string;
  rating: number;
  reviewCount: number;
  businessHours: BusinessHours;
  socialMedia: SocialMedia;
  verificationStatus: string;
  user: Pick<User, 'name' | 'email' | 'avatar' | 'createdAt'>;
  createdAt: Date;
}

export interface VendorListResponse {
  vendors: PublicVendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface VendorAdminListResponse {
  vendors: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface VendorStats {
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  verificationStatus: string;
}

export interface AdminVendorStats {
  totalVendors: number;
  verifiedVendors: number;
  pendingVendors: number;
  rejectedVendors: number;
  totalRevenue: number;
  recentRegistrations: Array<{
    _id: string;
    businessName: string;
    storeName: string;
    user: Pick<User, 'name' | 'email'>;
    createdAt: Date;
  }>;
}

export interface VendorFilters {
  page?: number;
  limit?: number;
  search?: string;
  businessType?: string;
  status?: 'pending' | 'verified' | 'rejected';
}

export interface VendorProfileUpdate {
  businessName?: string;
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeSlug?: string;
  businessType?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessRegistrationNumber?: string;
  taxIdentificationNumber?: string;
}

export interface VerificationStatusUpdate {
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
}

export interface DocumentUpload {
  documents: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

export interface AccountStatusToggle {
  reason?: string;
}

export interface SettingsUpdate {
  notifications?: NotificationSettings;
  businessHours?: BusinessHours;
  socialMedia?: SocialMedia;
}
