export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface VendorApiResponse<T = unknown> {
  success?: boolean;
  hasVendorProfile?: boolean;
  message?: string;
  data?: T;
  redirectTo: string;
  errors?: string[];
}
