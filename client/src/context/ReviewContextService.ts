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

// API Functions
const getReviews = async (
  params: ReviewParams = {}
): Promise<ApiResponse<ReviewsResponse>> => {
  const queryString = buildQueryString(params);
  const endpoint = queryString ? `/reviews?${queryString}` : '/reviews';
  return apiClient.publicApiRequest(endpoint);
};

const getReviewById = async (id: string): Promise<ApiResponse<Review>> => {
  return apiClient.publicApiRequest(`/reviews/${id}`);
};

const createReview = async (
  data: CreateReviewData
): Promise<ApiResponse<Review>> => {
  return apiClient.authenticatedApiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const deleteReview = async (id: string): Promise<ApiResponse<void>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<void>>(
    `/reviews/${id}`,
    { method: 'DELETE' }
  );
};

const toggleReviewApproval = async (
  id: string
): Promise<ApiResponse<Review>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<Review>>(
    `/reviews/${id}/approve`,
    { method: 'PATCH' }
  );
};

const getAverageRating = async (
  productId: string
): Promise<ApiResponse<AverageRatingResponse>> => {
  return apiClient.publicApiRequest<ApiResponse<AverageRatingResponse>>(
    `/reviews/product/${productId}/average-rating`
  );
};

const getReviewStats = async (): Promise<ApiResponse<ReviewStats>> => {
  return apiClient.authenticatedApiRequest<ApiResponse<ReviewStats>>(
    '/reviews/stats'
  );
};

// Core Hooks
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
    staleTime: 1000 * 60 * 15,
  });
};

// Mutation Hooks
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.lists() });

      const productId =
        typeof data.data?.productId === 'string'
          ? data.data.productId
          : data.data?.productId?._id;

      if (productId) {
        queryClient.invalidateQueries({
          queryKey: reviewQueryKeys.averageRating(productId),
        });
      }

      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.stats() });
    },
    onError: (error) => {
      console.error('Create review error:', error);
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: (_, reviewId) => {
      queryClient.removeQueries({ queryKey: reviewQueryKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.stats() });
    },
  });
};

export const useToggleReviewApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleReviewApproval,
    onSuccess: (data, reviewId) => {
      queryClient.setQueryData(
        reviewQueryKeys.detail(reviewId),
        (old: ApiResponse<Review> | undefined) => {
          if (!old || !data.data) return old;
          return { ...old, data: data.data };
        }
      );

      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.stats() });
    },
  });
};

// Optimistic Update Utility
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
        return { ...old, data: { ...old.data, ...updates } };
      }
    );
  };

  return { updateReviewOptimistically };
};

export const useProductReviews = (
  productId: string,
  params: Omit<ReviewParams, 'productId'> = {}
) => useReviews({ ...params, productId });

export const useUserReviews = (
  userId: string,
  params: Omit<ReviewParams, 'userId'> = {}
) => useReviews({ ...params, userId });

export const useApprovedReviews = (
  params: Omit<ReviewParams, 'isApproved'> = {}
) => useReviews({ ...params, isApproved: true });

export const usePendingReviews = (
  params: Omit<ReviewParams, 'isApproved'> = {}
) => useReviews({ ...params, isApproved: false });
