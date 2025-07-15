import type { ApiResponse } from '@/type/ApiResponse';
import type {
  WishlistItem,
  WishlistParams,
  WishlistResponse,
} from '@/type/Wishlist';
import { apiClient } from '@/utils/Api';
import { buildQueryString } from '@/utils/QueryString';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// API functions
const wishlistApi = {
  // Get wishlist with pagination and sorting
  getWishlist: async (
    params: WishlistParams = {}
  ): Promise<WishlistResponse> => {
    const queryString = buildQueryString(params);
    const endpoint = queryString ? `/wishlists?${queryString}` : '/wishlists';
    return apiClient.publicApiRequest<WishlistResponse>(endpoint);
  },

  // Add product to wishlist
  addToWishlist: async (
    productId: string
  ): Promise<ApiResponse<WishlistItem>> => {
    return apiClient.authenticatedApiRequest<ApiResponse<WishlistItem>>(
      '/wishlists',
      {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }
    );
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId: string): Promise<ApiResponse> => {
    return apiClient.authenticatedApiRequest<ApiResponse>(
      `/wishlists/${productId}`,
      {
        method: 'DELETE',
      }
    );
  },

  // Get wishlist count
  getWishlistCount: async (): Promise<{ count: number }> => {
    return apiClient.authenticatedApiRequest<{ count: number }>(
      '/wishlists/count'
    );
  },

  // Check if product is in wishlist
  checkWishlistStatus: async (
    productId: string
  ): Promise<{ isInWishlist: boolean }> => {
    return apiClient.authenticatedApiRequest<{ isInWishlist: boolean }>(
      `/wishlists/check/${productId}`
    );
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
