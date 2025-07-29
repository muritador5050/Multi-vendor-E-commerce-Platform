import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { validators } from '@/utils/Validation';
import type {
  VendorDocument,
  BusinessHours,
  Vendor,
  PublicVendor,
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
  SocialMedia,
  BusinessType,
  VerificationStatus,
  DocumentType,
  TopVendor,
  VendorProfileData,
  VendorProfile,
  AllVendorsResponse,
  singleVendor,
} from '../type/vendor';
import type { ApiResponse } from '@/type/ApiResponse';
import { apiClient } from '@/utils/Api';
import { buildQueryString } from '@/utils/QueryString';

// ===== QUERY KEYS =====
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
  documents: ['vendor', 'documents'] as const,
  settings: (type: string) => ['vendor', 'settings', type] as const,
  completion: ['vendor', 'completion'] as const,
  topVendors: ['vendor', 'top'] as const,
};

// ===== API FUNCTIONS =====

// Profile Management
async function getVendorProfile(): Promise<ApiResponse<VendorProfile>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<VendorProfile>>(
    '/vendors/profile'
  );
}

async function createNewVendorProfile(
  data: Partial<Vendor>
): Promise<ApiResponse<VendorProfile>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<VendorProfile>>(
    '/vendors/profile',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

async function updateVendorProfile(
  data: Partial<Vendor>
): Promise<ApiResponse<VendorProfile>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<VendorProfile>>(
    '/vendors/profile',
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

// Public Vendor Routes
async function getAllVendors(
  filters: VendorFilters = {}
): Promise<ApiResponse<AllVendorsResponse>> {
  const queryString = buildQueryString(filters);
  const endpoint = queryString ? `/vendors?${queryString}` : '/vendors';
  const response = await apiClient.publicApiRequest<
    ApiResponse<AllVendorsResponse>
  >(endpoint);
  return response;
}

async function getVendorById(id: string): Promise<ApiResponse<singleVendor>> {
  return await apiClient.publicApiRequest<ApiResponse<singleVendor>>(
    `/vendors/${id}`
  );
}

// Document Management
async function uploadDocuments(
  data: DocumentUpload
): Promise<ApiResponse<VendorDocument[]>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<VendorDocument[]>>(
    '/vendors/documents',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

async function deleteDocument(
  documentId: string
): Promise<ApiResponse<VendorDocument[]>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<VendorDocument[]>>(
    `/vendors/documents/${documentId}`,
    { method: 'DELETE' }
  );
}

// Settings Management
async function updateSettings<T extends SettingsResponse>(
  settingType: 'notifications' | 'businessHours' | 'socialMedia',
  data: SettingsUpdate
): Promise<ApiResponse<T>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<T>>(
    `/vendors/settings/${settingType}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

// Account Status
async function toggleAccountStatus(
  data: AccountStatusToggle
): Promise<ApiResponse<{ isActive: boolean; deactivatedAt?: Date }>> {
  return await apiClient.authenticatedApiRequest<
    ApiResponse<{ isActive: boolean; deactivatedAt?: Date }>
  >('/vendors/toggle-status', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Statistics
async function getVendorStats(): Promise<ApiResponse<VendorStats>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<VendorStats>>(
    '/vendors/stats/vendor'
  );
}

async function getAdminStats(): Promise<ApiResponse<AdminVendorStats>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<AdminVendorStats>>(
    '/vendors/stats/admin'
  );
}

// Admin Routes
async function getVendorsForAdmin(
  filters: VendorFilters = {}
): Promise<ApiResponse<VendorAdminListResponse>> {
  const queryString = buildQueryString(filters);
  const endpoint = queryString
    ? `/vendors/admin/list?${queryString}`
    : '/vendors/admin/list';

  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<VendorAdminListResponse>
  >(endpoint);
  return response;
}

async function updateVerificationStatus(
  vendorId: string,
  data: VerificationStatusUpdate
): Promise<ApiResponse<Vendor>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<Vendor>>(
    `/vendors/admin/verify/${vendorId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

async function getVendorProfileCompletion(): Promise<ApiResponse<Vendor>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<Vendor>>(
    '/vendors/profile/completion'
  );
}

async function getTopVendors(): Promise<ApiResponse<TopVendor>> {
  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<TopVendor>
  >('/vendors/top');

  return response;
}

// Profile Hooks
export const useVendorProfile = () => {
  return useQuery({
    queryKey: vendorKeys.profile,
    queryFn: () => getVendorProfile(),
    select: (data) => data.data,
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

export const useUpsertVendorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VendorProfileUpdate) => {
      const validationErrors = validateVendorProfile(data);
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];
        throw new Error(firstError);
      }

      const response = await createNewVendorProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(vendorKeys.profile, data);
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
};

export const useVendorProfileCompletion = () => {
  return useQuery({
    queryKey: vendorKeys.completion,
    queryFn: async () => {
      const response = await getVendorProfileCompletion();
      return response.data;
    },
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopVendors = () => {
  return useQuery({
    queryKey: vendorKeys.topVendors,
    queryFn: async () => {
      const response = await getTopVendors();
      return response.data;
    },
    enabled: apiClient.isAuthenticated(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useUpdateVendorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VendorProfileUpdate) => {
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

// Public Vendor Hooks
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

export const useVendorById = (identifier: string) => {
  return useQuery({
    queryKey: vendorKeys.detail(identifier),
    queryFn: async () => {
      const response = await getVendorById(identifier);
      return response.data;
    },
    enabled: Boolean(identifier?.trim()),
    staleTime: 5 * 60 * 1000,
  });
};

// Document Management Hooks
export const useUploadDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DocumentUpload) => {
      if (!data.documents || data.documents.length === 0) {
        throw new Error('At least one document is required');
      }

      // Validate document types
      const validTypes: DocumentType[] = [
        'business_license',
        'tax_certificate',
        'bank_statement',
        'id_document',
        'other',
      ];

      const invalidDocs = data.documents.filter(
        (doc) => !validTypes.includes(doc.type as DocumentType)
      );
      if (invalidDocs.length > 0) {
        throw new Error('Invalid document type provided');
      }

      const response = await uploadDocuments(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.profile });
      queryClient.invalidateQueries({ queryKey: vendorKeys.documents });
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
      queryClient.invalidateQueries({ queryKey: vendorKeys.documents });
    },
  });
};

// Settings Hooks
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

      // Validate based on setting type
      if (settingType === 'businessHours' && data.businessHours) {
        const validationErrors = validateBusinessHours(
          data.businessHours as BusinessHours
        );
        if (validationErrors) {
          const firstError = Object.values(validationErrors)[0];
          throw new Error(firstError);
        }
      }

      if (settingType === 'socialMedia' && data.socialMedia) {
        const validationErrors = validateSocialMedia(data.socialMedia);
        if (validationErrors) {
          const firstError = Object.values(validationErrors)[0];
          throw new Error(firstError);
        }
      }

      const response = await updateSettings<T>(settingType, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.profile });
      queryClient.invalidateQueries({
        queryKey: vendorKeys.settings(variables.settingType),
      });
    },
  });
};

// Account Status Hooks
export const useToggleAccountStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AccountStatusToggle) => {
      const response = await toggleAccountStatus(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.profile });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
};

// Statistics Hooks
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

// Admin Hooks
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

      const allowedStatuses: VerificationStatus[] = [
        'pending',
        'verified',
        'rejected',
        'suspended',
      ];
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

// ===== UTILITY HOOKS =====
export const useCurrentVendor = () => {
  const { data } = useVendorProfile();
  return data;
};

export const useIsVendorVerified = () => {
  const vendor = useCurrentVendor();
  return vendor?.vendor.verificationStatus === 'verified';
};

// ===== VALIDATION HELPERS =====
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

  if (data.businessType) {
    const validTypes: BusinessType[] = [
      'individual',
      'company',
      'partnership',
      'corporation',
    ];
    if (!validTypes.includes(data.businessType)) {
      errors.businessType = 'Invalid business type';
    }
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
  ] as const;

  days.forEach((day) => {
    const dayHours = businessHours[day];
    if (dayHours && !dayHours.isClosed) {
      if (!dayHours.open || !dayHours.close) {
        errors[day] = 'Open and close times are required for open days';
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (dayHours.open && !timeRegex.test(dayHours.open)) {
        errors[`${day}_open`] = 'Invalid open time format (use HH:MM)';
      }
      if (dayHours.close && !timeRegex.test(dayHours.close)) {
        errors[`${day}_close`] = 'Invalid close time format (use HH:MM)';
      }
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateSocialMedia = (socialMedia: Partial<SocialMedia>) => {
  const errors: Record<string, string> = {};

  // URL validation regex
  const urlRegex =
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

  Object.entries(socialMedia).forEach(([key, value]) => {
    if (value && !urlRegex.test(value)) {
      errors[key] = `Invalid ${key} URL format`;
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};
