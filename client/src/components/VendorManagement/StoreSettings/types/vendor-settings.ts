export interface GeneralSettings {
  storeName: string;
  storeDescription: string;
  storeEmail: string;
  storePhone?: string;
  storeLogo?: string;
}

export interface LocationSettings {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface PaymentSettings {
  acceptedMethods: string[];
  paypalEmail?: string;
  stripeAccount?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
  };
}

export interface ShippingSettings {
  freeShippingThreshold?: number;
  standardRate: number;
  expressRate: number;
  shippingZones: string[];
  processingTime: number;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  socialMediaLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface PolicySettings {
  returnPolicy: string;
  shippingPolicy: string;
  termsOfService: string;
  refundPolicy?: string;
}

export interface SupportSettings {
  supportEmail: string;
  supportPhone?: string;
  chatEnabled: boolean;
  responseTime: string;
}

export interface StoreHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

export interface SettingsData {
  general?: GeneralSettings;
  location?: LocationSettings;
  payment?: PaymentSettings;
  shipping?: ShippingSettings;
  seo?: SEOSettings;
  policies?: PolicySettings;
  support?: SupportSettings;
  hours?: StoreHours;
}

export type SettingsSection = keyof SettingsData;
