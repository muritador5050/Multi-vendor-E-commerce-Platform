import type { User } from './auth';

export type BusinessType =
  | 'individual'
  | 'company'
  | 'partnership'
  | 'corporation';
export type PaymentTerms = 'net15' | 'net30' | 'net45' | 'net60' | 'immediate';
export type VerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'suspended';
export type DocumentType =
  | 'business_license'
  | 'tax_certificate'
  | 'bank_statement'
  | 'id_document'
  | 'other';
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// ===== NESTED INTERFACES =====
export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface BankDetails {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  routingNumber?: string;
  swiftCode?: string;
}

export interface VendorDocument {
  _id?: string;
  type: DocumentType;
  filename?: string;
  url: string;
  name?: string;
  uploadedAt: Date;
}

export interface BusinessHourEntry {
  day: DayOfWeek;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

// Simplified business hours for frontend consumption
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
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderNotifications: boolean;
}

// ===== MAIN VENDOR INTERFACE =====
export interface Vendor {
  _id: string;
  user: User;

  // Business Information
  businessName: string;
  businessType: BusinessType;
  taxId?: string;
  businessRegistrationNumber?: string;
  businessAddress?: BusinessAddress;
  businessPhone?: string;
  businessEmail?: string;

  // Financial Information
  bankDetails?: BankDetails;
  paymentTerms: PaymentTerms;
  commission: number;

  // Verification
  verificationStatus: VerificationStatus;
  verificationDocuments: VendorDocument[];
  verificationNotes?: string;
  verifiedAt?: Date;
  verifiedBy?: string;

  // Performance Metrics
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  reviewCount: number;

  // Store Information
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeSlug?: string;
  storeBanner?: string;

  // Account Status
  deactivationReason?: string;
  deactivatedAt?: Date;

  // Settings
  notifications: NotificationSettings;
  businessHours?: BusinessHourEntry[];
  socialMedia?: SocialMedia;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ===== DERIVED INTERFACES =====
export interface VendorProfile extends Vendor {
  user: User;
}

export interface PublicVendor {
  _id: string;
  businessName: string;
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeSlug?: string;
  rating: number;
  reviewCount: number;
  businessHours: BusinessHours;
  socialMedia?: SocialMedia;
  verificationStatus: VerificationStatus;
  user: Pick<User, 'name' | 'email' | 'avatar' | 'createdAt' | 'isActive'>;
  createdAt: Date;
}

// ===== API RESPONSE INTERFACES =====
export interface VendorListResponse {
  vendors: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TopVendor {
  vendors: Vendor[];
  total: number;
}

export interface VendorAdminListResponse {
  vendors: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VendorStats {
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  verificationStatus: VerificationStatus;
}

export interface AdminVendorStats {
  totalVendors: number;
  verifiedVendors: number;
  pendingVendors: number;
  rejectedVendors: number;
  suspendedVendors: number;
  totalRevenue: number;
  recentRegistrations: Array<{
    _id: string;
    businessName: string;
    storeName?: string;
    user: Pick<User, 'name' | 'email'>;
    createdAt: Date;
  }>;
}

// ===== FILTER AND REQUEST INTERFACES =====
export interface VendorFilters {
  page?: number;
  limit?: number;
  search?: string;
  businessType?: BusinessType;
  verificationStatus?: VerificationStatus;
}

export interface VendorProfileUpdate {
  // Business Information
  businessName?: string;
  businessType?: BusinessType;
  taxId?: string;
  businessRegistrationNumber?: string;
  businessAddress?: Partial<BusinessAddress>;
  businessPhone?: string;
  businessEmail?: string;

  // Store Information
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeSlug?: string;
  storeBanner?: string;

  // Financial Information
  bankDetails?: Partial<BankDetails>;
  paymentTerms?: PaymentTerms;
}

export interface VerificationStatusUpdate {
  status: VerificationStatus;
  notes?: string;
}

export interface DocumentUpload {
  documents: Array<{
    type: DocumentType;
    url: string;
    name: string;
  }>;
}

export interface AccountStatusToggle {
  verificationStatus?: boolean;
  reason?: string;
}

export interface SettingsUpdate {
  notifications?: Partial<NotificationSettings>;
  businessHours?: BusinessHours | BusinessHourEntry[];
  socialMedia?: Partial<SocialMedia>;
}

// ===== SETTINGS RESPONSE UNION TYPE =====
export type SettingsResponse =
  | NotificationSettings
  | BusinessHours
  | SocialMedia;
