import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  VendorDocument,
  Vendor,
  VendorStats,
  AdminVendorStats,
  VendorFilters,
  // VendorProfileUpdate,
  VerificationStatusUpdate,
  DocumentUpload,
  AccountStatusToggle,
  SettingsUpdate,
  SettingsResponse,
  VendorProfile,
  AllVendorsResponse,
  singleVendor,
  SettingType,
  AccountStatusResponse,
  VendorPaginateResponse,
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
  return await apiClient.publicApiRequest<ApiResponse<AllVendorsResponse>>(
    endpoint
  );
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
  settingType: SettingType,
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

// Account Status - Fixed URL bug
async function AccountDeactivateByVendor(
  data: AccountStatusToggle
): Promise<ApiResponse<AccountStatusResponse>> {
  return await apiClient.authenticatedApiRequest<
    ApiResponse<AccountStatusResponse>
  >('/vendors/toggle-status', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async function AccountStatusToggleByAdmin(
  id: string,
  data: AccountStatusToggle
): Promise<ApiResponse<AccountStatusResponse>> {
  return await apiClient.authenticatedApiRequest<
    ApiResponse<AccountStatusResponse>
  >(`/vendors/toggle-status/${id}`, {
    // Fixed missing slash
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
): Promise<ApiResponse<VendorPaginateResponse>> {
  const queryString = buildQueryString(filters);
  const endpoint = queryString
    ? `/vendors/admin/list?${queryString}`
    : '/vendors/admin/list';

  return await apiClient.authenticatedApiRequest<
    ApiResponse<VendorPaginateResponse>
  >(endpoint);
}

async function updateVerificationStatus(
  id: string,
  data: VerificationStatusUpdate
): Promise<ApiResponse<Vendor>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<Vendor>>(
    `/vendors/admin/verify/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

async function getVendorProfileCompletion(): Promise<
  ApiResponse<{ profileCompletion: number; isComplete: boolean }>
> {
  return await apiClient.authenticatedApiRequest<
    ApiResponse<{ profileCompletion: number; isComplete: boolean }>
  >('/vendors/profile/completion');
}

async function getTopVendors(): Promise<ApiResponse<AllVendorsResponse>> {
  return await apiClient.authenticatedApiRequest<
    ApiResponse<AllVendorsResponse>
  >('/vendors/top');
}

// ===== HOOKS =====

// Profile Hooks
export const useVendorProfile = () => {
  return useQuery({
    queryKey: vendorKeys.profile,
    queryFn: getVendorProfile,
    select: (data) => data.data,
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateVendorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Vendor) => createNewVendorProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(vendorKeys.profile, data);
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
};

export const useUpdateVendorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Vendor>) => updateVendorProfile(data),
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

// Public Vendor Hooks
export const useVendors = (filters: VendorFilters = {}) => {
  return useQuery({
    queryKey: vendorKeys.list(filters),
    queryFn: () => getAllVendors(filters),
    select: (data) => data.data,
    staleTime: 2 * 60 * 1000,
  });
};

export const useVendorById = (id: string) => {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => getVendorById(id),
    select: (data) => data.data,
    enabled: Boolean(id?.trim()),
    staleTime: 5 * 60 * 1000,
  });
};

// Document Management Hooks
export const useUploadDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DocumentUpload) => uploadDocuments(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.profile });
      queryClient.invalidateQueries({ queryKey: vendorKeys.documents });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
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
    mutationFn: ({
      settingType,
      data,
    }: {
      settingType: SettingType;
      data: SettingsUpdate;
    }) => updateSettings<T>(settingType, data),
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
    mutationFn: (data: AccountStatusToggle) => AccountDeactivateByVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.profile });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
};

export const useToggleAccountStatusByAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AccountStatusToggle }) =>
      AccountStatusToggleByAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.admin });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorKeys.stats('admin') });
    },
  });
};

// Statistics Hooks
export const useVendorStats = () => {
  return useQuery({
    queryKey: vendorKeys.stats('vendor'),
    queryFn: () => getVendorStats(),
    select: (data) => data.data,
    enabled: apiClient.isAuthenticated(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: vendorKeys.stats('admin'),
    queryFn: () => getAdminStats(),
    select: (data) => data.data,
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  });
};

// Admin Hooks
export const useVendorsForAdmin = (filters: VendorFilters = {}) => {
  return useQuery({
    queryKey: vendorKeys.adminList(filters),
    queryFn: () => getVendorsForAdmin(filters),
    select: (data) => data.data,
    enabled: apiClient.isAuthenticated(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpdateVerificationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      data,
    }: {
      vendorId: string;
      data: VerificationStatusUpdate;
    }) => updateVerificationStatus(vendorId, data),
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
  return vendor?.verificationStatus === 'verified';
};
