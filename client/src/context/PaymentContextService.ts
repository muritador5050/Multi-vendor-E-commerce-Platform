// Export all hooks and utilities
import type { ApiResponse } from '@/type/ApiResponse';
import type {
  CreatedPaymentResponse,
  PaginatedPayments,
  Payment,
  PaymentAnalytics,
  PaymentFilters,
  SinglePaymentResponse,
  UpdatePaymentStatusData,
  VendorPaymentsResponse,
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

// Create Payment
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CreatedPaymentResponse>,
    Error,
    { orderId: string }
  >({
    mutationFn: async ({ orderId }) => {
      return apiClient.authenticatedApiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
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
    queryFn: async () => await apiClient.authenticatedApiRequest(endpoint),
  });
};

// Get Payment by ID
export const useGetPaymentById = (id: string) => {
  return useQuery<ApiResponse<SinglePaymentResponse>, Error>({
    queryKey: paymentKeys.detail(id),
    queryFn: async () =>
      await apiClient.authenticatedApiRequest(`/payments/${id}`),
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
          method: 'PATCH',
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
      return apiClient.authenticatedApiRequest(`/payments/${id}`, {
        method: 'DELETE',
      });
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
    ? `/payments/analytics?${queryString}`
    : '/payments/analytics';

  return useQuery<ApiResponse<PaymentAnalytics>, Error>({
    queryKey: paymentKeys.analytics(period),
    queryFn: async () =>
      await apiClient.authenticatedApiRequest<ApiResponse<PaymentAnalytics>>(
        endpoint
      ),
  });
};

export const useGetVendorRelatedPayments = () => {
  return useQuery<ApiResponse<VendorPaymentsResponse>, Error>({
    queryKey: paymentKeys.analytics(),
    queryFn: async () =>
      await apiClient.authenticatedApiRequest<
        ApiResponse<VendorPaymentsResponse>
      >('/payments/analytics/vendor'),
  });
};
