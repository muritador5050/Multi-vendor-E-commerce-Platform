// Export all hooks and utilities
import type { ApiResponse } from '@/type/ApiResponse';
import type {
  CreatePaymentData,
  CreatePaymentResponse,
  PaginatedPayments,
  Payment,
  PaymentAnalytics,
  PaymentFilters,
  UpdatePaymentStatusData,
} from '@/type/Payment';
import { apiClient } from '@/utils/Api';
import { buildQueryString } from '@/utils/QueryString';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters: PaymentFilters) =>
    [...paymentKeys.lists(), { filters }] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  userPayments: () => [...paymentKeys.all, 'user'] as const,
  analytics: (period?: string) =>
    [...paymentKeys.all, 'analytics', period] as const,
};

// Hooks

// Create Payment
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CreatePaymentResponse>,
    Error,
    CreatePaymentData
  >({
    mutationFn: async (data) => {
      return apiClient.authenticatedApiRequest<
        ApiResponse<CreatePaymentResponse>
      >('/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
};

// Get All Payments (Admin)
export const useGetAllPayments = (filters: PaymentFilters = {}) => {
  const queryString = buildQueryString(filters);
  const endpoint = queryString ? `/payments?${queryString}` : '/payments';

  return useQuery<ApiResponse<PaginatedPayments>, Error>({
    queryKey: paymentKeys.list(filters),
    queryFn: async () =>
      await apiClient.authenticatedApiRequest<ApiResponse<PaginatedPayments>>(
        endpoint
      ),
  });
};

// Get Payment by ID
export const useGetPaymentById = (id: string) => {
  return useQuery<ApiResponse<Payment>, Error>({
    queryKey: paymentKeys.detail(id),
    queryFn: async () =>
      await apiClient.authenticatedApiRequest<ApiResponse<Payment>>(
        `/payments/${id}`
      ),
    enabled: !!id,
  });
};

// Get User's Payments
export const useGetUserPayments = () => {
  return useQuery<ApiResponse<Payment[]>, Error>({
    queryKey: paymentKeys.userPayments(),
    queryFn: async () =>
      await apiClient.authenticatedApiRequest<ApiResponse<Payment[]>>(
        '/payments/my-payments'
      ),
  });
};

// Update Payment Status (Admin)
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Payment>,
    Error,
    { id: string; data: UpdatePaymentStatusData }
  >({
    mutationFn: async ({ id, data }) => {
      return apiClient.authenticatedApiRequest<ApiResponse<Payment>>(
        `/payments/${id}/status`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.userPayments() });
    },
  });
};

// Delete Payment (Admin)
export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async (id) => {
      return apiClient.authenticatedApiRequest<ApiResponse<void>>(
        `/payments/${id}`,
        {
          method: 'DELETE',
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
};

// Get Payment Analytics
export const useGetPaymentAnalytics = (period: string = '12months') => {
  const queryString = buildQueryString({ period });
  const endpoint = queryString
    ? `/payments/admin/analytics?${queryString}`
    : '/payments/admin/analytics';

  return useQuery<ApiResponse<PaymentAnalytics>, Error>({
    queryKey: paymentKeys.analytics(period),
    queryFn: async () =>
      await apiClient.authenticatedApiRequest<ApiResponse<PaymentAnalytics>>(
        endpoint
      ),
  });
};
