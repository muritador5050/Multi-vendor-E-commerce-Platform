import type { User } from './auth';

export type BusinessType =
  | 'individual'
  | 'company'
  | 'partnership'
  | 'corporation';

export type SettingType =
  | 'notifications'
  | 'storeHours'
  | 'socialMedia'
  | 'generalSettings'
  | 'storePolicies'
  | 'shippingRules'
  | 'seoSettings';

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

export type StoreBannerType = 'image' | 'video' | 'slider';
export type AccountType = 'checking' | 'savings' | 'business';
export type TimeUnit = 'days' | 'weeks';

// ===== SHARED INTERFACES =====
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface StoreAddress extends Address {
  apartment?: string;
  latitude?: number;
  longitude?: number;
}

export interface BankDetails {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  routingNumber?: string;
  swiftCode?: string;
  accountType?: AccountType;
}

export interface SocialMedia {
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface StorePolicies {
  returnPolicy?: string;
  shippingPolicy?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  refundPolicy?: string;
}

export interface NotificationSettings {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  orderNotifications?: boolean;
  marketingEmails?: boolean;
}

// ===== STORE CONFIGURATION =====
export interface GeneralSettings {
  storeName?: string;
  storeSlug?: string;
  storeEmail?: string;
  storePhone?: string;
  storeLogo?: string;
  shopDescription?: string;
  storeBannerType?: StoreBannerType;
  storeBanner?: string;
}

export interface ShippingZone {
  name?: string;
  countries?: string[];
  shippingCost?: number;
  estimatedDelivery?: string;
}

export interface ProcessingTime {
  min?: number;
  max?: number;
  unit?: TimeUnit;
}

export interface ShippingRules {
  freeShippingThreshold?: number;
  shippingZones?: ShippingZone[];
  processingTime?: ProcessingTime;
}

export interface SeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  structuredData?: Record<string, unknown>;
}

export interface StoreBreak {
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface StoreHour {
  day: DayOfWeek;
  isOpen?: boolean;
  openTime?: string;
  closeTime?: string;
  breaks?: StoreBreak[];
}

export interface VendorDocument {
  _id?: string;
  type: DocumentType;
  filename?: string;
  url: string;
  uploadedAt: Date;
}

// ===== PAGINATION INTERFACE =====
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ===== MAIN VENDOR INTERFACE =====
export interface Vendor {
  _id: string;
  user: User;
  businessName: string;
  businessType: BusinessType;
  taxId?: string;
  businessRegistrationNumber?: string;
  generalSettings?: GeneralSettings;
  storeAddress?: StoreAddress;
  businessAddress?: Address;
  bankDetails?: BankDetails;
  socialMedia?: SocialMedia;
  storePolicies?: StorePolicies;
  shippingRules?: ShippingRules;
  seoSettings?: SeoSettings;
  storeHours?: StoreHour[];
  paymentTerms: PaymentTerms;
  commission: number;
  verificationStatus: VerificationStatus;
  verificationDocuments: VendorDocument[];
  verificationNotes?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  reviewCount: number;
  deactivationReason?: string;
  deactivatedAt?: Date;
  notifications: NotificationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorProfileData {
  vendor: Vendor;
  profileCompletion: number;
}

export interface singleVendor {
  _id: string;
  businessName: string;
  generalSettings?: Pick<
    GeneralSettings,
    'storeName' | 'shopDescription' | 'storeLogo' | 'storeSlug'
  >;
  rating: number;
  storeAddress: StoreAddress;
  reviewCount: number;
  storeHours?: StoreHour[];
  socialMedia?: SocialMedia;
  verificationStatus: VerificationStatus;
  user: Pick<User, 'name' | 'email' | 'avatar' | 'createdAt' | 'isActive'>;
  createdAt: Date;
}

// ===== API RESPONSE INTERFACES =====
export interface VendorPaginateResponse {
  vendors: Vendor[];
  pagination: Pagination;
}

export interface AllVendorsResponse {
  vendors: Vendor[];
  total: number;
}

export interface VendorStats {
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  verificationStatus: VerificationStatus;
  profileCompletion: number;
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
    generalSettings?: Pick<GeneralSettings, 'storeName'>;
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

export interface VendorProfile extends Vendor {
  profileCompletion: number;
}

export interface VendorProfileUpdate {
  businessName?: string;
  businessType?: BusinessType;
  taxId?: string;
  businessRegistrationNumber?: string;
  businessAddress?: Partial<Address>;
  generalSettings?: Partial<GeneralSettings>;
  storeAddress?: Partial<StoreAddress>;
  bankDetails?: Partial<BankDetails>;
  socialMedia?: Partial<SocialMedia>;
  storePolicies?: Partial<StorePolicies>;
  shippingRules?: Partial<ShippingRules>;
  seoSettings?: Partial<SeoSettings>;
  storeHours?: StoreHour[];
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
    filename: string;
  }>;
}

export interface AccountStatusToggle {
  reason?: string;
}

export interface AccountStatusResponse {
  deactivated: boolean;
  deactivatedAt?: Date;
  deactivationReason?: string;
}

export interface SettingsUpdate {
  notifications?: Partial<NotificationSettings>;
  storeHours?: StoreHour[];
  socialMedia?: Partial<SocialMedia>;
  generalSettings?: Partial<GeneralSettings>;
  storePolicies?: Partial<StorePolicies>;
  shippingRules?: Partial<ShippingRules>;
  seoSettings?: Partial<SeoSettings>;
}

// ===== SETTINGS RESPONSE UNION TYPE =====
export type SettingsResponse =
  | NotificationSettings
  | StoreHour[]
  | SocialMedia
  | GeneralSettings
  | StorePolicies
  | ShippingRules
  | SeoSettings;
