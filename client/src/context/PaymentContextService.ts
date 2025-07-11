// Export all hooks and utilities
import { apiBase } from '@/api/ApiService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  results?: T;
  count?: number;
  totalPayments?: number;
  numOfPages?: number;
  currentPage?: number;
}

// Payment Types
interface Payment {
  _id: string;
  order: string;
  paymentProvider: 'stripe' | 'paystack';
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  paidAt?: Date;
  failureReason?: string;
  transactionDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreatePaymentData {
  order: string;
  paymentProvider: 'stripe' | 'paystack';
  amount: number;
  currency?: string;
}

interface CreatePaymentResponse {
  results: Payment;
  checkoutUrl: string;
}

interface UpdatePaymentStatusData {
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  paidAt?: string;
}

interface PaymentFilters {
  status?: string;
  orderId?: string;
  paidAt?: string;
  paymentProvider?: string;
  page?: number;
  limit?: number;
}

interface PaymentAnalytics {
  period: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalSpent: number;
    totalTransactions: number;
    averageTransactionAmount: number;
    largestTransaction: number;
    smallestTransaction: number;
    successRate: string;
  };
  paymentCounts: {
    successful: number;
    failed: number;
    pending: number;
  };
  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  monthlyTrends: Array<{
    year: number;
    month: number;
    monthName: string;
    totalAmount: number;
    transactionCount: number;
    avgAmount: number;
  }>;
  paymentMethodBreakdown: Array<{
    paymentMethod: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
    percentage: number;
  }>;
  recentTransactions: Payment[];
}

// Utility functions
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v.toString()));
      } else {
        searchParams.set(key, value.toString());
      }
    }
  }

  return searchParams.toString();
};

const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const response = await fetch(`${apiBase}/payments${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Network error' }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

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
      return apiRequest<CreatePaymentResponse>('/', {
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
  const endpoint = queryString ? `/?${queryString}` : '/';

  return useQuery<ApiResponse<Payment[]>, Error>({
    queryKey: paymentKeys.list(filters),
    queryFn: () => apiRequest<Payment[]>(endpoint),
  });
};

// Get Payment by ID
export const useGetPaymentById = (id: string) => {
  return useQuery<ApiResponse<Payment>, Error>({
    queryKey: paymentKeys.detail(id),
    queryFn: () => apiRequest<Payment>(`/${id}`),
    enabled: !!id,
  });
};

// Get User's Payments
export const useGetUserPayments = () => {
  return useQuery<ApiResponse<Payment[]>, Error>({
    queryKey: paymentKeys.userPayments(),
    queryFn: () => apiRequest<Payment[]>('/my-payments'),
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
      return apiRequest<Payment>(`/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
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
      return apiRequest<void>(`/${id}`, {
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
  const endpoint = `/admin/analytics?${queryString}`;

  return useQuery<ApiResponse<PaymentAnalytics>, Error>({
    queryKey: paymentKeys.analytics(period),
    queryFn: () => apiRequest<PaymentAnalytics>(endpoint),
  });
};

// Export types for use in components
export type {
  Payment,
  CreatePaymentData,
  CreatePaymentResponse,
  UpdatePaymentStatusData,
  PaymentFilters,
  PaymentAnalytics,
  ApiResponse,
};
