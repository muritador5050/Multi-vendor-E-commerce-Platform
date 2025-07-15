import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { validators } from '@/utils/Validation';
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
  SettingsResponse,
} from '../type/vendor';
import type { ApiResponse } from '@/type/ApiResponse';
import { apiClient } from '@/utils/Api';

async function getVendorProfile(): Promise<ApiResponse<VendorProfile>> {
  return apiClient.authenticatedApiRequest<ApiResponse<VendorProfile>>(
    '/vendors/profile'
  );
}

async function upsertVendorProfile(
  data: VendorProfileUpdate
): Promise<ApiResponse<VendorProfile>> {
  return apiClient.authenticatedApiRequest<ApiResponse<VendorProfile>>(
    '/vendors/profile',
    {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

async function updateVendorProfile(
  data: VendorProfileUpdate
): Promise<ApiResponse<VendorProfile>> {
  return apiClient.authenticatedApiRequest<ApiResponse<VendorProfile>>(
    '/vendors/profile',
    {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// === PUBLIC VENDOR ROUTES ===
async function getAllVendors(
  filters: VendorFilters = {}
): Promise<ApiResponse<VendorListResponse>> {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.businessType) params.append('businessType', filters.businessType);
  if (filters.status) params.append('status', filters.status);

  const queryString = params.toString();
  const endpoint = queryString ? `/vendors?${queryString}` : '/vendors';

  return apiClient.publicApiRequest<ApiResponse<VendorListResponse>>(endpoint);
}

async function getVendor(
  identifier: string
): Promise<ApiResponse<PublicVendor>> {
  return apiClient.publicApiRequest<ApiResponse<PublicVendor>>(
    `/vendors/${identifier}`
  );
}

// === DOCUMENT MANAGEMENT ===
async function uploadDocuments(
  data: DocumentUpload
): Promise<ApiResponse<VendorDocument[]>> {
  return apiClient.authenticatedApiRequest<ApiResponse<VendorDocument[]>>(
    '/vendors/documents/',
    {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

async function deleteDocument(
  documentId: string
): Promise<ApiResponse<VendorDocument[]>> {
  return apiClient.authenticatedApiRequest<ApiResponse<VendorDocument[]>>(
    `/vendors/documents/${documentId}`,
    {
      method: 'DELETE',
    }
  );
}

// === VENDOR SETTINGS ===
async function updateSettings<T extends SettingsResponse>(
  settingType: 'notifications' | 'businessHours' | 'socialMedia',
  data: SettingsUpdate
): Promise<ApiResponse<T>> {
  return apiClient.authenticatedApiRequest<ApiResponse<T>>(
    `/vendors/settings/${settingType}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// === ACCOUNT STATUS ===
async function toggleAccountStatus(
  data: AccountStatusToggle
): Promise<ApiResponse<{ isActive: boolean; deactivatedAt?: Date }>> {
  return apiClient.authenticatedApiRequest<
    ApiResponse<{ isActive: boolean; deactivatedAt?: Date }>
  >('/vendors/toggle-status', {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// === STATISTICS ===
async function getVendorStats(): Promise<ApiResponse<VendorStats>> {
  return apiClient.authenticatedApiRequest<ApiResponse<VendorStats>>(
    '/vendors/stats/vendor'
  );
}

async function getAdminStats(): Promise<ApiResponse<AdminVendorStats>> {
  return apiClient.authenticatedApiRequest<ApiResponse<AdminVendorStats>>(
    '/vendors/stats/admin'
  );
}

// === ADMIN ROUTES ===
async function getVendorsForAdmin(
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

  return apiClient.authenticatedApiRequest<
    ApiResponse<VendorAdminListResponse>
  >(endpoint);
}

async function updateVerificationStatus(
  vendorId: string,
  data: VerificationStatusUpdate
): Promise<ApiResponse<Vendor>> {
  return apiClient.authenticatedApiRequest<ApiResponse<Vendor>>(
    `/vendors/admin/${vendorId}/verify`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

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
      const response = await getVendorProfile();
      return response.data;
    },
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

export const useUpsertVendorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VendorProfileUpdate) => {
      // Validate before API call
      const validationErrors = validateVendorProfile(data);
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];
        throw new Error(firstError);
      }

      const response = await upsertVendorProfile(data);
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
      // Validate before API call
      const validationErrors = validateVendorProfile(data);
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];
        throw new Error(firstError);
      }

      const response = await updateVendorProfile(data);
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
      const response = await getAllVendors(filters);
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
      const response = await getVendor(identifier);
      return response.data;
    },
    enabled: Boolean(identifier?.trim()),
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

      const response = await uploadDocuments(data);
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

      const response = await deleteDocument(documentId);
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

      // Validate business hours if that's the setting being updated
      if (settingType === 'businessHours' && data) {
        const validationErrors = validateBusinessHours(data as BusinessHours);
        if (validationErrors) {
          const firstError = Object.values(validationErrors)[0];
          throw new Error(firstError);
        }
      }

      const response = await updateSettings<T>(settingType, data);
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
      if (typeof data.reason !== 'boolean') {
        throw new Error('isActive must be a boolean value');
      }

      const response = await toggleAccountStatus(data);
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
      const response = await getVendorStats();
      return response.data;
    },
    enabled: apiClient.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: vendorKeys.stats('admin'),
    queryFn: async () => {
      const response = await getAdminStats();
      return response.data;
    },
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// === ADMIN HOOKS ===
export const useVendorsForAdmin = (filters: VendorFilters = {}) => {
  return useQuery({
    queryKey: vendorKeys.adminList(filters),
    queryFn: async () => {
      const response = await getVendorsForAdmin(filters);
      return response.data;
    },
    enabled: apiClient.isAuthenticated(),
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

      const response = await updateVerificationStatus(vendorId, data);
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

// === PERMISSION HOOKS ===
// These hooks need to be implemented based on your auth/permission system
export const useCanPerformAction = (action: string): boolean => {
  // Placeholder implementation - replace with actual permission logic
  console.warn(`useCanPerformAction not implemented for action: ${action}`);
  return false;
};

export const useHasAnyRole = (roles: string[]): boolean => {
  // Placeholder implementation - replace with actual role checking logic
  console.warn(`useHasAnyRole not implemented for roles: ${roles.join(', ')}`);
  return false;
};

export const useCanManageVendor = () => {
  return useCanPerformAction('manage_vendors');
};

export const useIsVendorRole = () => {
  return useHasAnyRole(['vendor']);
};

// === VALIDATION HELPERS ===
export const validateVendorProfile = (data: VendorProfileUpdate) => {
  const errors: Record<string, string> = {};

  if (data.businessName !== undefined && !data.businessName.trim()) {
    errors.businessName = 'Business name is required';
  }

  if (data.storeName !== undefined && !data.storeName.trim()) {
    errors.storeName = 'Store name is required';
  }

  if (data.businessEmail) {
    const emailError = validators.email(data.businessEmail);
    if (emailError) errors.businessEmail = emailError;
  }

  if (data.businessPhone && data.businessPhone.trim().length < 10) {
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
    if (dayHours && !dayHours.isClosed && (!dayHours.open || !dayHours.close)) {
      errors[day] = 'Open and close times are required for open days';
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};
