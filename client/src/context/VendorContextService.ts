import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '@/api/ApiService';
import { validators } from '@/utils/Validation';
import type { ApiResponse } from '@/api/ApiService';
import type {
  VendorDocument,
  BusinessHours,
  Vendor,
  VendorProfile,
  PublicVendor,
  VendorListResponse,
  VendorAdminListResponse,
  VendorStats,
  AdminVendorStats,
  VendorFilters,
  VendorProfileUpdate,
  VerificationStatusUpdate,
  DocumentUpload,
  AccountStatusToggle,
  SettingsUpdate,
} from '../type/vendor';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderNotifications: boolean;
  marketingEmails: boolean;
}

interface SocialMediaSettings {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

type SettingsResponse =
  | NotificationSettings
  | BusinessHours
  | SocialMediaSettings;

// === API SERVICE EXTENSIONS ===
class VendorApiService {
  // === VENDOR PROFILE ===
  async getVendorProfile(): Promise<ApiResponse<VendorProfile>> {
    return apiService.request<ApiResponse<VendorProfile>>('/vendors/profile');
  }

  async upsertVendorProfile(
    data: VendorProfileUpdate
  ): Promise<ApiResponse<VendorProfile>> {
    return apiService.request<ApiResponse<VendorProfile>>('/vendors/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendorProfile(
    data: VendorProfileUpdate
  ): Promise<ApiResponse<VendorProfile>> {
    return apiService.request<ApiResponse<VendorProfile>>('/vendors/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // === PUBLIC VENDOR ROUTES ===
  async getAllVendors(
    filters: VendorFilters = {}
  ): Promise<ApiResponse<VendorListResponse>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.businessType)
      params.append('businessType', filters.businessType);

    const queryString = params.toString();
    const endpoint = queryString ? `/vendors?${queryString}` : '/vendors';

    return apiService.request<ApiResponse<VendorListResponse>>(endpoint);
  }

  async getVendor(identifier: string): Promise<ApiResponse<PublicVendor>> {
    return apiService.request<ApiResponse<PublicVendor>>(
      `/vendors/${identifier}`
    );
  }

  // === DOCUMENT MANAGEMENT ===
  async uploadDocuments(
    data: DocumentUpload
  ): Promise<ApiResponse<VendorDocument[]>> {
    return apiService.request<ApiResponse<VendorDocument[]>>(
      '/vendors/documents/',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteDocument(
    documentId: string
  ): Promise<ApiResponse<VendorDocument[]>> {
    return apiService.request<ApiResponse<VendorDocument[]>>(
      `/vendors/documents/${documentId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // === VENDOR SETTINGS ===
  async updateSettings<T extends SettingsResponse>(
    settingType: 'notifications' | 'businessHours' | 'socialMedia',
    data: SettingsUpdate
  ): Promise<ApiResponse<T>> {
    return apiService.request<ApiResponse<T>>(
      `/vendors/settings/${settingType}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  // === ACCOUNT STATUS ===
  async toggleAccountStatus(
    data: AccountStatusToggle
  ): Promise<ApiResponse<{ isActive: boolean; deactivatedAt?: Date }>> {
    return apiService.request<
      ApiResponse<{ isActive: boolean; deactivatedAt?: Date }>
    >('/vendors/toggle-status', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // === STATISTICS ===
  async getVendorStats(): Promise<ApiResponse<VendorStats>> {
    return apiService.request<ApiResponse<VendorStats>>(
      '/vendors/stats/vendor'
    );
  }

  async getAdminStats(): Promise<ApiResponse<AdminVendorStats>> {
    return apiService.request<ApiResponse<AdminVendorStats>>(
      '/vendors/stats/admin'
    );
  }

  // === ADMIN ROUTES ===
  async getVendorsForAdmin(
    filters: VendorFilters = {}
  ): Promise<ApiResponse<VendorAdminListResponse>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/vendors/admin/list?${queryString}`
      : '/vendors/admin/list';

    return apiService.request<ApiResponse<VendorAdminListResponse>>(endpoint);
  }

  async updateVerificationStatus(
    vendorId: string,
    data: VerificationStatusUpdate
  ): Promise<ApiResponse<Vendor>> {
    return apiService.request<ApiResponse<Vendor>>(
      `/vendors/admin/${vendorId}/verify`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }
}

const vendorApiService = new VendorApiService();

// === QUERY KEYS ===
export const vendorKeys = {
  all: ['vendor'] as const,
  profile: ['vendor', 'profile'] as const,
  public: ['vendor', 'public'] as const,
  list: (filters: VendorFilters) => ['vendor', 'list', filters] as const,
  detail: (id: string) => ['vendor', 'detail', id] as const,
  stats: (type: string) => ['vendor', 'stats', type] as const,
  admin: ['vendor', 'admin'] as const,
  adminList: (filters: VendorFilters) =>
    ['vendor', 'admin', 'list', filters] as const,
};

// === VENDOR PROFILE HOOKS ===
export const useVendorProfile = () => {
  return useQuery({
    queryKey: vendorKeys.profile,
    queryFn: async () => {
      const response = await vendorApiService.getVendorProfile();
      return response.data;
    },
    enabled: apiService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

export const useUpsertVendorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VendorProfileUpdate) => {
      if (data.businessEmail) {
        const emailError = validators.email(data.businessEmail);
        if (emailError) throw new Error(emailError);
      }
      if (data.businessName && !data.businessName.trim()) {
        throw new Error('Business name is required');
      }
      if (data.storeName && !data.storeName.trim()) {
        throw new Error('Store name is required');
      }

      const response = await vendorApiService.upsertVendorProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(vendorKeys.profile, data);
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
};

export const useUpdateVendorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VendorProfileUpdate) => {
      if (data.businessEmail) {
        const emailError = validators.email(data.businessEmail);
        if (emailError) throw new Error(emailError);
      }

      const response = await vendorApiService.updateVendorProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(vendorKeys.profile, data);
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
};

// === PUBLIC VENDOR HOOKS ===
export const useVendors = (filters: VendorFilters = {}) => {
  return useQuery({
    queryKey: vendorKeys.list(filters),
    queryFn: async () => {
      const response = await vendorApiService.getAllVendors(filters);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
};

export const useVendor = (identifier: string) => {
  return useQuery({
    queryKey: vendorKeys.detail(identifier),
    queryFn: async () => {
      const response = await vendorApiService.getVendor(identifier);
      return response.data;
    },
    enabled: !!identifier,
    staleTime: 5 * 60 * 1000,
  });
};

// === DOCUMENT MANAGEMENT HOOKS ===
export const useUploadDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DocumentUpload) => {
      if (!data.documents || data.documents.length === 0) {
        throw new Error('At least one document is required');
      }

      const response = await vendorApiService.uploadDocuments(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.profile });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      if (!documentId?.trim()) {
        throw new Error('Document ID is required');
      }

      const response = await vendorApiService.deleteDocument(documentId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.profile });
    },
  });
};

// === SETTINGS HOOKS ===
export const useUpdateSettings = <
  T extends SettingsResponse = SettingsResponse
>() => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      settingType,
      data,
    }: {
      settingType: 'notifications' | 'businessHours' | 'socialMedia';
      data: SettingsUpdate;
    }) => {
      const allowedSettings = ['notifications', 'businessHours', 'socialMedia'];
      if (!allowedSettings.includes(settingType)) {
        throw new Error('Invalid setting type');
      }

      const response = await vendorApiService.updateSettings<T>(
        settingType,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.profile });
    },
  });
};

// === ACCOUNT STATUS HOOKS ===
export const useToggleAccountStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AccountStatusToggle) => {
      const response = await vendorApiService.toggleAccountStatus(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.profile });
    },
  });
};

// === STATISTICS HOOKS ===
export const useVendorStats = () => {
  return useQuery({
    queryKey: vendorKeys.stats('vendor'),
    queryFn: async () => {
      const response = await vendorApiService.getVendorStats();
      return response.data;
    },
    enabled: apiService.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: vendorKeys.stats('admin'),
    queryFn: async () => {
      const response = await vendorApiService.getAdminStats();
      return response.data;
    },
    enabled: apiService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// === ADMIN HOOKS ===
export const useVendorsForAdmin = (filters: VendorFilters = {}) => {
  return useQuery({
    queryKey: vendorKeys.adminList(filters),
    queryFn: async () => {
      const response = await vendorApiService.getVendorsForAdmin(filters);
      return response.data;
    },
    enabled: apiService.isAuthenticated(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
};

export const useUpdateVerificationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vendorId,
      data,
    }: {
      vendorId: string;
      data: VerificationStatusUpdate;
    }) => {
      if (!vendorId?.trim()) {
        throw new Error('Vendor ID is required');
      }
      if (!data.status) {
        throw new Error('Status is required');
      }

      const allowedStatuses = ['pending', 'verified', 'rejected'];
      if (!allowedStatuses.includes(data.status)) {
        throw new Error('Invalid status');
      }

      const response = await vendorApiService.updateVerificationStatus(
        vendorId,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.admin });
      queryClient.invalidateQueries({ queryKey: vendorKeys.stats('admin') });
    },
  });
};

// === UTILITY HOOKS ===
export const useCurrentVendor = () => {
  const { data } = useVendorProfile();
  return data;
};

export const useIsVendorVerified = () => {
  const vendor = useCurrentVendor();
  return vendor?.verificationStatus === 'verified';
};

export const useIsVendorActive = () => {
  const vendor = useCurrentVendor();
  return vendor?.isActive === true;
};

// Note: These hooks are referenced but not defined in the original code
// You'll need to implement them based on your auth/permission system
declare function useCanPerformAction(action: string): boolean;
declare function useHasAnyRole(roles: string[]): boolean;

export const useCanManageVendor = () => {
  return useCanPerformAction('manage_vendors');
};

export const useIsVendorRole = () => {
  return useHasAnyRole(['vendor']);
};

// === VALIDATION HELPERS ===
export const validateVendorProfile = (data: VendorProfileUpdate) => {
  const errors: Record<string, string> = {};

  if (data.businessName && !data.businessName.trim()) {
    errors.businessName = 'Business name is required';
  }

  if (data.storeName && !data.storeName.trim()) {
    errors.storeName = 'Store name is required';
  }

  if (data.businessEmail) {
    const emailError = validators.email(data.businessEmail);
    if (emailError) errors.businessEmail = emailError;
  }

  if (data.businessPhone && data.businessPhone.length < 10) {
    errors.businessPhone = 'Please enter a valid phone number';
  }

  if (data.storeSlug && !/^[a-z0-9-]+$/.test(data.storeSlug)) {
    errors.storeSlug =
      'Store slug can only contain lowercase letters, numbers, and hyphens';
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateBusinessHours = (businessHours: BusinessHours) => {
  const errors: Record<string, string> = {};
  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  days.forEach((day) => {
    const dayHours = businessHours[day as keyof BusinessHours];
    if (!dayHours.isClosed && (!dayHours.open || !dayHours.close)) {
      errors[day] = 'Open and close times are required for open days';
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};

export default vendorApiService;
