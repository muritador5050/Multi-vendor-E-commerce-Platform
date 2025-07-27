import type { ApiResponse } from '@/type/ApiResponse';
import type {
  DailySalesReport,
  Order,
  OrderParams,
  OrderStatsResponse,
  ProductSalesReport,
  VendorSalesAnalytics,
  OrdersResponse,
} from '@/type/Order';
import { apiClient } from '@/utils/Api';
import { buildQueryString } from '@/utils/QueryString';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const getOrders = async (
  params: OrderParams = {}
): Promise<ApiResponse<OrdersResponse>> => {
  const queryString = buildQueryString(params);
  const endpoint = queryString ? `/orders?${queryString}` : '/orders';
  const response =
    apiClient.authenticatedApiRequest<ApiResponse<OrdersResponse>>(endpoint);
  return response;
};

const getOrderById = async (id: string): Promise<ApiResponse<Order>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<Order>>(`/orders/${id}`);
};

const createOrder = async (
  orderData: Omit<Order, '_id'>
): Promise<ApiResponse<Order>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<Order>>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

const updateOrderStatus = async (
  id: string,
  statusData: Partial<
    Pick<Order, 'orderStatus' | 'paymentStatus' | 'deliveredAt'>
  >
): Promise<ApiResponse<Order>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<Order>>(
    `/orders/${id}/status`,
    {
      method: 'PUT',
      body: JSON.stringify(statusData),
    }
  );
};

const deleteOrder = async (id: string): Promise<ApiResponse<void>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<void>>(`/orders/${id}`, {
    method: 'DELETE',
  });
};

// Get order statistics
const getOrderStats = async (): Promise<ApiResponse<OrderStatsResponse>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<OrderStatsResponse>>(
    '/orders/stats'
  );
};

const getDailySalesReport = async (): Promise<
  ApiResponse<DailySalesReport[]>
> => {
  return apiClient.authenticatedApiRequest<ApiResponse<DailySalesReport[]>>(
    '/orders/analytics/sales-by-date'
  );
};

const getSalesByProduct = async (): Promise<
  ApiResponse<ProductSalesReport[]>
> => {
  return apiClient.authenticatedApiRequest<ApiResponse<ProductSalesReport[]>>(
    '/orders/analytics/sales-by-product'
  );
};

const getVendorSalesAnalytics = async (): Promise<
  ApiResponse<VendorSalesAnalytics>
> => {
  return apiClient.authenticatedApiRequest<ApiResponse<VendorSalesAnalytics>>(
    '/orders/analytics/vendor-sales-report'
  );
};

// Query keys (unchanged)
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderParams) => [...orderKeys.lists(), params] as const,
  details: (id: string) => [...orderKeys.all, 'details', id] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
  dailySales: () => [...orderKeys.all, 'daily-sales'] as const,
  productSales: () => [...orderKeys.all, 'product-sales'] as const,
  vendorSales: () => [...orderKeys.all, 'vendor-sales'] as const,
};

export const useOrders = (params: OrderParams = {}) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => getOrders(params),
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });
};

export const useOrderById = (id: string) => {
  return useQuery({
    queryKey: orderKeys.details(id),
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
};

export const useOrderStats = () => {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: getOrderStats,
    staleTime: 30 * 1000, // Add stale time for consistency
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

export const useUpdateOrderStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      statusData: Partial<
        Pick<Order, 'orderStatus' | 'paymentStatus' | 'deliveredAt'>
      >
    ) => updateOrderStatus(id, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.details(id),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

export const useDailySalesReport = () => {
  return useQuery({
    queryKey: orderKeys.dailySales(),
    queryFn: getDailySalesReport,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductSalesReport = () => {
  return useQuery({
    queryKey: orderKeys.productSales(),
    queryFn: getSalesByProduct,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVendorSalesAnalytics = () => {
  return useQuery({
    queryKey: orderKeys.vendorSales(),
    queryFn: getVendorSalesAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
