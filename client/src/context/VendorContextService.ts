import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  VendorDocument,
  Vendor,
  VendorStats,
  AdminVendorStats,
  VendorFilters,
  VerificationStatusUpdate,
  SettingsUpdate,
  SettingsResponse,
  VendorProfile,
  TopRatedVendorsResponse,
  singleVendor,
  SettingType,
  AccountStatusResponse,
  VendorPaginateResponse,
  VendorDocumentType,
  VerificationStatus,
} from '../type/vendor';
import type { ApiResponse, VendorApiResponse } from '@/type/ApiResponse';
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
  return await apiClient.authenticatedApiRequest('/vendors/profile');
}

async function getVendorProfileStatus(): Promise<
  VendorApiResponse<VendorProfile | null>
> {
  return await apiClient.authenticatedApiRequest('/vendors/profile-status');
}

async function createNewVendorProfile(
  data: Partial<Omit<Vendor, '_id'>>
): Promise<VendorApiResponse<VendorProfile>> {
  return await apiClient.authenticatedApiRequest('/vendors/onboarding', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Document Management
async function uploadDocuments(
  type: VendorDocumentType,
  files: File[]
): Promise<ApiResponse<VendorDocument>> {
  return await apiClient.authenticatedFormDataRequest<
    ApiResponse<VendorDocument>
  >('/vendors/documents', { type }, { documents: files });
}

async function getDocuments(): Promise<ApiResponse<VendorDocument[]>> {
  return await apiClient.authenticatedApiRequest<ApiResponse<VendorDocument[]>>(
    '/vendors/documents'
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

async function updateVendorProfile(
  data: Partial<Vendor>
): Promise<VendorApiResponse<VendorProfile>> {
  return await apiClient.authenticatedApiRequest<
    VendorApiResponse<VendorProfile>
  >('/vendors/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Public Vendor Routes
async function getAllVendors(
  filters: VendorFilters = {}
): Promise<ApiResponse<VendorPaginateResponse>> {
  const queryString = buildQueryString(filters);
  const endpoint = queryString ? `/vendors?${queryString}` : '/vendors';
  return await apiClient.authenticatedApiRequest(endpoint);
}

async function getVendorById(id: string): Promise<ApiResponse<singleVendor>> {
  return await apiClient.publicApiRequest(`/vendors/${id}`);
}

async function updateSettings<T extends SettingsResponse>(
  settingType: SettingType,
  data: SettingsUpdate,
  files?: { storeLogo?: File; storeBanner?: File }
): Promise<ApiResponse<T>> {
  const hasFiles =
    files &&
    Object.keys(files).some(
      (key) => files[key as keyof typeof files] instanceof File
    );

  if (hasFiles) {
    return await apiClient.authenticatedFormDataRequest(
      `/vendors/settings/${settingType}`,
      data,
      files,
      { method: 'PATCH' }
    );
  } else {
    return await apiClient.authenticatedApiRequest(
      `/vendors/settings/${settingType}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  }
}

// Account Status - Fixed URL bug
async function accountDeactivateByVendor(data: {
  reason?: string;
}): Promise<ApiResponse<AccountStatusResponse>> {
  return await apiClient.authenticatedApiRequest('/vendors/toggle-status', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

async function toggleVendorAccountStatusByAdmin(
  id: string,
  data: { reason?: string }
): Promise<ApiResponse<AccountStatusResponse>> {
  return await apiClient.authenticatedApiRequest(
    `/vendors/toggle-status/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
}

// Statistics
async function getVendorStats(): Promise<ApiResponse<VendorStats>> {
  return await apiClient.authenticatedApiRequest('/vendors/stats/vendor');
}

async function getAdminStats(): Promise<ApiResponse<AdminVendorStats>> {
  return await apiClient.authenticatedApiRequest('/vendors/stats/admin');
}

// Admin Routes
async function getVendorsForAdmin(
  filters: VendorFilters = {}
): Promise<ApiResponse<VendorPaginateResponse>> {
  const queryString = buildQueryString(filters);
  const endpoint = queryString
    ? `/vendors/admin/list?${queryString}`
    : '/vendors/admin/list';

  return await apiClient.authenticatedApiRequest(endpoint);
}

async function updateVerificationStatus(
  id: string,
  data: VerificationStatusUpdate
): Promise<
  ApiResponse<{
    veficationStatus: VerificationStatus;
    verifiedAt?: Date;
    verifiedBy?: string;
  }>
> {
  return await apiClient.authenticatedApiRequest(
    `/vendors/admin/verify/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
}

async function getVendorProfileCompletion(): Promise<
  ApiResponse<{ profileCompletion: number; isComplete: boolean }>
> {
  return await apiClient.authenticatedApiRequest('/vendors/profile/completion');
}

async function getTopVendors(): Promise<ApiResponse<TopRatedVendorsResponse>> {
  return await apiClient.authenticatedApiRequest('/vendors/top-rated');
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

export const useVendorDocuments = () => {
  return useQuery({
    queryKey: vendorKeys.documents,
    queryFn: getDocuments,
    select: (data) => data.data,
    enabled: apiClient.isAuthenticated(),
  });
};

export const useVendorProfileStatus = () => {
  return useQuery({
    queryKey: vendorKeys.profile,
    queryFn: getVendorProfileStatus,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateVendorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Omit<Vendor, '_id'>>) =>
      createNewVendorProfile(data),
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
    mutationFn: ({
      type,
      files,
    }: {
      type: VendorDocumentType;
      files: File[];
    }) => uploadDocuments(type, files),
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
      files,
    }: {
      settingType: SettingType;
      data: SettingsUpdate;
      files?: { storeLogo?: File; storeBanner?: File };
    }) => updateSettings<T>(settingType, data, files),
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
  // This mutation is for the vendor to deactivate their account
  return useMutation({
    mutationFn: (data: { reason?: string }) => accountDeactivateByVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.profile });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
};

export const useToggleAccountStatusByAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reason?: string } }) =>
      toggleVendorAccountStatusByAdmin(id, data),
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

export const useIsVendorApproved = () => {
  const vendor = useCurrentVendor();
  return vendor?.verificationStatus === 'approved';
};
