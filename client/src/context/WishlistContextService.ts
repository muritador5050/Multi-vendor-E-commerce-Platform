import type { ApiResponse } from '@/type/ApiResponse';
import type {
  WishlistItem,
  WishlistParams,
  WishlistResponse,
} from '@/type/Wishlist';
import { apiClient } from '@/utils/Api';
import { buildQueryString } from '@/utils/QueryString';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from './AuthContextService';

const wishlistApi = {
  getWishlist: async (
    params: WishlistParams = {}
  ): Promise<WishlistResponse> => {
    const queryString = buildQueryString(params);
    const endpoint = queryString ? `/wishlists?${queryString}` : '/wishlists';
    return await apiClient.authenticatedApiRequest(endpoint);
  },

  addToWishlist: async (
    productId: string
  ): Promise<ApiResponse<WishlistItem>> => {
    return await apiClient.authenticatedApiRequest('/wishlists', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  removeFromWishlist: async (productId: string): Promise<ApiResponse> => {
    return await apiClient.authenticatedApiRequest(`/wishlists/${productId}`, {
      method: 'DELETE',
    });
  },

  getWishlistCount: async (): Promise<ApiResponse<number>> => {
    return await apiClient.authenticatedApiRequest('/wishlists/count');
  },

  checkWishlistStatus: async (
    productId: string
  ): Promise<ApiResponse<boolean>> => {
    return await apiClient.authenticatedApiRequest(
      `/wishlists/check/${productId}`
    );
  },
};

// React Query hooks
export const useWishlist = (params: WishlistParams = {}) => {
  return useQuery({
    queryKey: ['wishlist', params],
    queryFn: () => wishlistApi.getWishlist(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useWishlistCount = () => {
  return useQuery({
    queryKey: ['wishlist-count'],
    queryFn: () => wishlistApi.getWishlistCount(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useWishlistStatus = (productId: string) => {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: ['wishlist-status', productId],
    queryFn: () => wishlistApi.checkWishlistStatus(productId),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['add-to-wishlist'],
    mutationFn: (productId: string) => wishlistApi.addToWishlist(productId),
    onSuccess: (_data, productId) => {
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
    mutationKey: ['remove-from-wishlist'],
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
