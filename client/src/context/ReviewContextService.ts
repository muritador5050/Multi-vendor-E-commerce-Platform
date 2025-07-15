import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AverageRatingResponse,
  CreateReviewData,
  Review,
  ReviewParams,
  ReviewsResponse,
  ReviewStats,
} from '@/type/Review';
import { buildQueryString } from '@/utils/QueryString';
import type { ApiResponse } from '@/type/ApiResponse';
import { apiClient } from '@/utils/Api';

const getReviews = async (
  params: ReviewParams = {}
): Promise<ApiResponse<ReviewsResponse>> => {
  const queryString = buildQueryString(params);
  const endpoint = queryString ? `/reviews?${queryString}` : '/reviews';
  return apiClient.publicApiRequest<ApiResponse<ReviewsResponse>>(endpoint);
};

// Get single review by ID - Fixed missing slash
const getReviewById = async (id: string): Promise<ApiResponse<Review>> => {
  return apiClient.publicApiRequest<ApiResponse<Review>>(`/reviews/${id}`);
};

// Create a new review
const createReview = async (
  data: CreateReviewData
): Promise<ApiResponse<Review>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<Review>>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Delete review - Fixed missing slash
const deleteReview = async (id: string): Promise<ApiResponse<void>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<void>>(
    `/reviews/${id}`,
    {
      method: 'DELETE',
    }
  );
};

// Toggle review approval (admin only) - Fixed missing slash
const toggleReviewApproval = async (
  id: string
): Promise<ApiResponse<Review>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<Review>>(
    `/reviews/${id}/approve`,
    {
      method: 'PUT',
    }
  );
};

// Get average rating for a product - Fixed API call method
const getAverageRating = async (
  productId: string
): Promise<ApiResponse<AverageRatingResponse>> => {
  return apiClient.publicApiRequest<ApiResponse<AverageRatingResponse>>(
    `/reviews/product/${productId}/average-rating`
  );
};

// Get review statistics (admin only)
const getReviewStats = async (): Promise<ApiResponse<ReviewStats>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<ReviewStats>>(
    '/reviews/stats'
  );
};

// React Query Keys
export const reviewQueryKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewQueryKeys.all, 'list'] as const,
  list: (params: ReviewParams) => [...reviewQueryKeys.lists(), params] as const,
  details: () => [...reviewQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewQueryKeys.details(), id] as const,
  stats: () => [...reviewQueryKeys.all, 'stats'] as const,
  averageRating: (productId: string) =>
    [...reviewQueryKeys.all, 'averageRating', productId] as const,
};

// React Query Hooks
export const useReviews = (params: ReviewParams = {}) => {
  return useQuery({
    queryKey: reviewQueryKeys.list(params),
    queryFn: () => getReviews(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useReview = (id: string) => {
  return useQuery({
    queryKey: reviewQueryKeys.detail(id),
    queryFn: () => getReviewById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAverageRating = (productId: string) => {
  return useQuery({
    queryKey: reviewQueryKeys.averageRating(productId),
    queryFn: () => getAverageRating(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useReviewStats = () => {
  return useQuery({
    queryKey: reviewQueryKeys.stats(),
    queryFn: () => getReviewStats(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

// Mutation Hooks
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: (data) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.lists() });

      // Invalidate average rating for the product - Fixed property access
      if (data.data?.product?._id) {
        queryClient.invalidateQueries({
          queryKey: reviewQueryKeys.averageRating(data.data.product._id),
        });
      }

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.stats() });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: (_, reviewId) => {
      // Remove the review from cache
      queryClient.removeQueries({ queryKey: reviewQueryKeys.detail(reviewId) });

      // Invalidate reviews list
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.stats() });
    },
  });
};

export const useToggleReviewApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleReviewApproval,
    onSuccess: (data, reviewId) => {
      // Update the specific review in cache - Fixed type assertion
      queryClient.setQueryData(
        reviewQueryKeys.detail(reviewId),
        (old: ApiResponse<Review> | undefined) => {
          if (!old || !data.data) return old;
          return {
            ...old,
            data: data.data,
          };
        }
      );

      // Invalidate reviews list to update approval status
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.stats() });
    },
  });
};

// Custom hook for product reviews
export const useProductReviews = (
  productId: string,
  params: Omit<ReviewParams, 'product'> = {}
) => {
  return useReviews({ ...params, product: productId });
};

// Custom hook for user reviews
export const useUserReviews = (
  userId: string,
  params: Omit<ReviewParams, 'user'> = {}
) => {
  return useReviews({ ...params, user: userId });
};

// Custom hook for approved reviews only
export const useApprovedReviews = (
  params: Omit<ReviewParams, 'isApproved'> = {}
) => {
  return useReviews({ ...params, isApproved: true });
};

// Custom hook for pending reviews (admin)
export const usePendingReviews = (
  params: Omit<ReviewParams, 'isApproved'> = {}
) => {
  return useReviews({ ...params, isApproved: false });
};

// Utility hook for optimistic updates
export const useOptimisticReviewUpdate = () => {
  const queryClient = useQueryClient();

  const updateReviewOptimistically = (
    reviewId: string,
    updates: Partial<Review>
  ) => {
    queryClient.setQueryData(
      reviewQueryKeys.detail(reviewId),
      (old: ApiResponse<Review> | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: { ...old.data, ...updates },
        };
      }
    );
  };

  return { updateReviewOptimistically };
};
