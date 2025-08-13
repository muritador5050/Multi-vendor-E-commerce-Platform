import type { ApiResponse } from '@/type/ApiResponse';
import type {
  DailySalesReport,
  Order,
  OrderParams,
  OrderStatsResponse,
  ProductSalesReport,
  VendorSalesAnalytics,
  OrdersResponse,
  CreateOrderRequest,
} from '@/type/Order';
import { apiClient } from '@/utils/Api';
import { buildQueryString } from '@/utils/QueryString';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

// API Functions
const getOrders = async (
  params: OrderParams = {}
): Promise<ApiResponse<OrdersResponse>> => {
  const queryString = buildQueryString(params);
  const endpoint = queryString ? `/orders?${queryString}` : '/orders';
  return await apiClient.authenticatedApiRequest(endpoint);
};

const getOrderById = async (id: string): Promise<ApiResponse<Order>> => {
  return await apiClient.authenticatedApiRequest(`/orders/${id}`);
};

const createOrder = async (
  orderData: CreateOrderRequest
): Promise<ApiResponse<Order>> => {
  return await apiClient.authenticatedApiRequest('/orders', {
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
  return await apiClient.authenticatedApiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  });
};

const deleteOrder = async (id: string): Promise<ApiResponse<void>> => {
  return await apiClient.authenticatedApiRequest(`/orders/${id}`, {
    method: 'DELETE',
  });
};

const getOrderStats = async (): Promise<ApiResponse<OrderStatsResponse>> => {
  return await apiClient.authenticatedApiRequest('/orders/stats');
};

const getDailySalesReport = async (): Promise<
  ApiResponse<DailySalesReport[]>
> => {
  return await apiClient.authenticatedApiRequest(
    '/orders/analytics/sales-by-date'
  );
};

const getSalesByProduct = async (): Promise<
  ApiResponse<ProductSalesReport[]>
> => {
  return await apiClient.authenticatedApiRequest(
    '/orders/analytics/sales-by-product'
  );
};

const getVendorSalesAnalytics = async (): Promise<
  ApiResponse<VendorSalesAnalytics>
> => {
  return await apiClient.authenticatedApiRequest(
    '/orders/analytics/vendor-sales-report'
  );
};

// Query Hooks with Data Selection
export const useOrders = (params: OrderParams = {}) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => getOrders(params),
    select: (data: ApiResponse<OrdersResponse>) => data.data,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useOrderById = (id: string) => {
  return useQuery({
    queryKey: orderKeys.details(id),
    queryFn: () => getOrderById(id),
    select: (data: ApiResponse<Order>) => data.data,
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};

export const useOrderStats = () => {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: getOrderStats,
    select: (data: ApiResponse<OrderStatsResponse>) => data.data,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useDailySalesReport = () => {
  return useQuery({
    queryKey: orderKeys.dailySales(),
    queryFn: getDailySalesReport,
    select: (data: ApiResponse<DailySalesReport[]>) => data.data,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useProductSalesReport = () => {
  return useQuery({
    queryKey: orderKeys.productSales(),
    queryFn: getSalesByProduct,
    select: (data: ApiResponse<ProductSalesReport[]>) => data.data,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useVendorSalesAnalytics = () => {
  return useQuery({
    queryKey: orderKeys.vendorSales(),
    queryFn: getVendorSalesAnalytics,
    select: (data: ApiResponse<VendorSalesAnalytics>) => data.data,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Mutation Hooks
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });

      // Optionally set the new order data directly
      if (data.data) {
        queryClient.setQueryData(orderKeys.details(data.data._id), data.data);
      }
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      statusData,
    }: {
      id: string;
      statusData: Partial<
        Pick<Order, 'orderStatus' | 'paymentStatus' | 'deliveredAt'>
      >;
    }) => updateOrderStatus(id, statusData),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.details(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });

      // Update the specific order cache if data is available
      if (data.data) {
        queryClient.setQueryData(orderKeys.details(variables.id), data.data);
      }
    },
    onError: (error) => {
      console.error('Failed to update order status:', error);
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: (data, orderId) => {
      // Invalidate list and stats queries
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });

      // Remove the specific order from cache
      queryClient.removeQueries({ queryKey: orderKeys.details(orderId) });
    },
    onError: (error) => {
      console.error('Failed to delete order:', error);
    },
  });
};
