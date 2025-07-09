import { apiBase } from '@/api/ApiService';
import type { Product } from '@/type/product';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
}

interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
  vendor?: string;
  material?: string;
  size?: string;
  color?: string;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQueryString = (params: ProductQueryParams): string => {
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

const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (params: Record<string, string>) => [...orderKeys.lists(), params],
  details: (id: string) => [...orderKeys.all, 'details', id],
};

export const useOrders = (params: Record<string, string>) => {
  return useQuery<ApiResponse<PaginatedResponse<Product>>>({
    queryKey: orderKeys.list(params),
    queryFn: () =>
      apiRequest<PaginatedResponse<Product>>(`?${new URLSearchParams(params)}`),
    staleTime: 1000 * 60 * 5,
  });
};

export const useOrderDetails = (id: string) => {
  return useQuery<ApiResponse<Product>>({
    queryKey: orderKeys.details(id),
    queryFn: () => apiRequest<Product>(`/${id}`),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Product>, Error, Partial<Product>>({
    mutationFn: async (orderData) => {
      const response = await apiRequest<Product>('/', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Product>,
    Error,
    { id: string; data: Partial<Product> }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest<Product>(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (id) => {
      const response = await apiRequest<null>(`/${id}`, {
        method: 'DELETE',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

export const useOrderSearch = (params: ProductQueryParams) => {
  return useQuery<ApiResponse<PaginatedResponse<Product>>>({
    queryKey: orderKeys.list(params),
    queryFn: () =>
      apiRequest<PaginatedResponse<Product>>(`?${buildQueryString(params)}`),
    staleTime: 1000 * 60 * 5,
  });
};
