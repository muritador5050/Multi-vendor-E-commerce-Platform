import { apiBase } from '@/api/ApiService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/type/product';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface WishlistItem {
  _id: string;
  user: string;
  product: Product;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface WishlistResponse {
  data: WishlistItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface WishlistParams {
  page?: number;
  limit?: number;
  sort?: 'addedAt' | 'createdAt' | 'updatedAt';
}

// Utility functions
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQueryString = (params: WishlistParams): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value.toString());
    }
  }

  return searchParams.toString();
};

const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${apiBase}/wishlist${endpoint}`, {
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

// API functions
const wishlistApi = {
  // Get wishlist with pagination and sorting
  getWishlist: async (
    params: WishlistParams = {}
  ): Promise<WishlistResponse> => {
    const queryString = buildQueryString(params);
    const endpoint = queryString ? `?${queryString}` : '';
    return apiRequest<WishlistResponse>(endpoint);
  },

  // Add product to wishlist
  addToWishlist: async (
    productId: string
  ): Promise<ApiResponse<WishlistItem>> => {
    return apiRequest<ApiResponse<WishlistItem>>('', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/${productId}`, {
      method: 'DELETE',
    });
  },

  // Get wishlist count
  getWishlistCount: async (): Promise<{ count: number }> => {
    return apiRequest<{ count: number }>('/count');
  },

  // Check if product is in wishlist
  checkWishlistStatus: async (
    productId: string
  ): Promise<{ isInWishlist: boolean }> => {
    return apiRequest<{ isInWishlist: boolean }>(`/${productId}`);
  },
};

// React Query hooks
export const useWishlist = (params: WishlistParams = {}) => {
  return useQuery({
    queryKey: ['wishlist', params],
    queryFn: () => wishlistApi.getWishlist(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWishlistCount = () => {
  return useQuery({
    queryKey: ['wishlist-count'],
    queryFn: () => wishlistApi.getWishlistCount(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWishlistStatus = (productId: string) => {
  return useQuery({
    queryKey: ['wishlist-status', productId],
    queryFn: () => wishlistApi.checkWishlistStatus(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistApi.addToWishlist(productId),
    onSuccess: (_data, productId) => {
      // Invalidate and refetch wishlist queries
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
      queryClient.invalidateQueries({
        queryKey: ['wishlist-status', productId],
      });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      wishlistApi.removeFromWishlist(productId),
    onSuccess: (_data, productId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
      queryClient.invalidateQueries({
        queryKey: ['wishlist-status', productId],
      });
    },
  });
};
