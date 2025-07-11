import { apiBase } from '@/api/ApiService';
import type { Product } from '@/type/product';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type PaymentMethod = 'card' | 'paypal' | 'stripe' | 'bank_transfer' | string;

interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface Order {
  _id: string;
  user: string;
  products: Product[];
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  shippingCost?: number;
  estimatedDelivery?: string;
  orderStatus?: string;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  deliveredAt?: string;
}
interface PaginationResponse<T> {
  order: T[];
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface OrderParams {
  page?: number;
  limit?: number;
  orderStatus?: string;
  paymentStatus?: string;
  user?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

interface MonthlyStats {
  _id: {
    year: number;
    month: number;
  };
  ordersCount: number;
  revenue: number;
}

interface OrderStatsResponse {
  overview: OrderStats;
  monthlyTrends: MonthlyStats[];
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQueryString = (params: OrderParams): string => {
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
  const response = await fetch(`${apiBase}/orders${endpoint}`, {
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

// API Functions
const orderApi = {
  getOrders: async (
    params: OrderParams = {}
  ): Promise<ApiResponse<PaginationResponse<Order>>> => {
    const queryString = buildQueryString(params);
    const endpoint = queryString ? `?${queryString}` : '';
    return apiRequest<PaginationResponse<Order>>(endpoint);
  },

  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    return apiRequest<Order>(`/${id}`);
  },

  createOrder: async (
    orderData: Omit<Order, '_id'>
  ): Promise<ApiResponse<Order>> => {
    return apiRequest<Order>('', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  updateOrderStatus: async (
    id: string,
    statusData: Partial<
      Pick<Order, 'orderStatus' | 'paymentStatus' | 'deliveredAt'>
    >
  ): Promise<ApiResponse<Order>> => {
    return apiRequest<Order>(`/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  },

  // Delete order
  deleteOrder: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/${id}`, {
      method: 'DELETE',
    });
  },

  // Get order statistics
  getOrderStats: async (): Promise<ApiResponse<OrderStatsResponse>> => {
    return apiRequest<OrderStatsResponse>('/stats');
  },
};

// Query Keys
const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderParams) => [...orderKeys.lists(), params] as const,
  details: (id: string) => [...orderKeys.all, 'details', id] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
};

// Custom Hooks
const useOrders = (params: OrderParams = {}) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.getOrders(params),
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });
};

const useOrderById = (id: string) => {
  return useQuery({
    queryKey: orderKeys.details(id),
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!id,
  });
};

const useOrderStats = () => {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: orderApi.getOrderStats,
  });
};

const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

const useUpdateOrderStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      statusData: Partial<
        Pick<Order, 'orderStatus' | 'paymentStatus' | 'deliveredAt'>
      >
    ) => orderApi.updateOrderStatus(id, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.details(id),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

export {
  useOrders,
  useOrderById,
  useOrderStats,
  useCreateOrder,
  useUpdateOrderStatus,
  useDeleteOrder,
};
