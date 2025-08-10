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
  getWishlist: async (
    params: WishlistParams = {}
  ): Promise<WishlistResponse> => {
    const queryString = buildQueryString(params);
    const endpoint = queryString ? `/wishlists?${queryString}` : '/wishlists';
    return await apiClient.authenticatedApiRequest(endpoint);
  },

  // Add product to wishlist
  addToWishlist: async (
    productId: string
  ): Promise<ApiResponse<WishlistItem>> => {
    return await apiClient.authenticatedApiRequest('/wishlists', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId: string): Promise<ApiResponse> => {
    return await apiClient.authenticatedApiRequest(`/wishlists/${productId}`, {
      method: 'DELETE',
    });
  },

  // Get wishlist count - Fixed return type to match backend response
  getWishlistCount: async (): Promise<ApiResponse<number>> => {
    return await apiClient.authenticatedApiRequest('/wishlists/count');
  },

  // Fixed return type to match backend response
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
  });
};

export const useWishlistCount = () => {
  return useQuery({
    queryKey: ['wishlist-count'],
    queryFn: () => wishlistApi.getWishlistCount(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useWishlistStatus = (productId: string) => {
  return useQuery({
    queryKey: ['wishlist-status', productId],
    queryFn: () => wishlistApi.checkWishlistStatus(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistApi.addToWishlist(productId),
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist-count'] });
      await queryClient.cancelQueries({
        queryKey: ['wishlist-status', productId],
      });

      // Snapshot previous values
      const previousCount = queryClient.getQueryData(['wishlist-count']);
      const previousStatus = queryClient.getQueryData([
        'wishlist-status',
        productId,
      ]);

      // Optimistically update count - Fix: Handle ApiResponse<number> correctly
      queryClient.setQueryData(
        ['wishlist-count'],
        (old: ApiResponse<number> | undefined) => {
          if (!old || old.data === undefined) return { data: 1 };
          return { ...old, data: old.data + 1 };
        }
      );

      // Optimistically update status - Fix: Handle ApiResponse<boolean> correctly
      queryClient.setQueryData(
        ['wishlist-status', productId],
        (old: ApiResponse<boolean> | undefined) => {
          if (!old || old.data === undefined) return { data: true };
          return { ...old, data: true };
        }
      );

      return { previousCount, previousStatus };
    },
    onError: (err, productId, context) => {
      // Rollback on error
      if (context?.previousCount) {
        queryClient.setQueryData(['wishlist-count'], context.previousCount);
      }
      if (context?.previousStatus) {
        queryClient.setQueryData(
          ['wishlist-status', productId],
          context.previousStatus
        );
      }
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
    },
  });
};

// Enhanced removeFromWishlist with correct types
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['remove-from-wishlist'],
    mutationFn: (productId: string) =>
      wishlistApi.removeFromWishlist(productId),
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      await queryClient.cancelQueries({ queryKey: ['wishlist-count'] });
      await queryClient.cancelQueries({
        queryKey: ['wishlist-status', productId],
      });

      // Snapshot previous values
      const previousWishlist = queryClient.getQueryData(['wishlist']);
      const previousCount = queryClient.getQueryData(['wishlist-count']);
      const previousStatus = queryClient.getQueryData([
        'wishlist-status',
        productId,
      ]);

      queryClient.setQueryData(
        ['wishlist'],
        (old: WishlistResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.product._id !== productId),
          };
        }
      );

      queryClient.setQueryData(
        ['wishlist-count'],
        (old: ApiResponse<number> | undefined) => {
          if (!old || old.data === undefined) return { data: 0 };
          return { ...old, data: Math.max(0, old.data - 1) };
        }
      );

      queryClient.setQueryData(
        ['wishlist-status', productId],
        (old: ApiResponse<boolean> | undefined) => {
          if (!old || old.data === undefined) return { data: false };
          return { ...old, data: false };
        }
      );

      return { previousWishlist, previousCount, previousStatus };
    },
    onError: (err, productId, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
      }
      if (context?.previousCount) {
        queryClient.setQueryData(['wishlist-count'], context.previousCount);
      }
      if (context?.previousStatus) {
        queryClient.setQueryData(
          ['wishlist-status', productId],
          context.previousStatus
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
    },
  });
};
