import { apiBase } from '@/api/ApiService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/type/product';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Review {
  _id: string;
  user: User;
  product: Product;
  comment: string;
  rating: number;
  isApproved: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ReviewParams {
  page?: number;
  limit?: number;
  product?: string;
  user?: string;
  isApproved?: boolean;
  isDeleted?: boolean;
  minRating?: number;
  maxRating?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

interface CreateReviewData {
  product: string;
  rating: number;
  comment?: string;
}

interface AverageRatingResponse {
  avgRating: number;
  totalReviews: number;
}

interface ReviewStats {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  averageRating: number;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
}

// Utility functions
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQueryString = (params: ReviewParams): string => {
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
  const response = await fetch(`${apiBase}/reviews${endpoint}`, {
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
export const reviewApi = {
  // Get all reviews with filtering and pagination
  getReviews: async (
    params: ReviewParams = {}
  ): Promise<ApiResponse<ReviewsResponse>> => {
    const queryString = buildQueryString(params);
    const endpoint = queryString ? `?${queryString}` : '';
    return apiRequest<ReviewsResponse>(endpoint);
  },

  // Get single review by ID
  getReviewById: async (id: string): Promise<ApiResponse<Review>> => {
    return apiRequest<Review>(`/${id}`);
  },

  // Create a new review
  createReview: async (
    data: CreateReviewData
  ): Promise<ApiResponse<Review>> => {
    return apiRequest<Review>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete a review
  deleteReview: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle review approval (admin only)
  toggleReviewApproval: async (id: string): Promise<ApiResponse<Review>> => {
    return apiRequest<Review>(`/${id}/approve`, {
      method: 'PUT',
    });
  },

  // Get average rating for a product
  getAverageRating: async (
    productId: string
  ): Promise<ApiResponse<AverageRatingResponse>> => {
    return apiRequest<AverageRatingResponse>(
      `/product/${productId}/average-rating`
    );
  },

  // Get review statistics (admin only)
  getReviewStats: async (): Promise<ApiResponse<ReviewStats>> => {
    return apiRequest<ReviewStats>('/stats');
  },
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
    queryFn: () => reviewApi.getReviews(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useReview = (id: string) => {
  return useQuery({
    queryKey: reviewQueryKeys.detail(id),
    queryFn: () => reviewApi.getReviewById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAverageRating = (productId: string) => {
  return useQuery({
    queryKey: reviewQueryKeys.averageRating(productId),
    queryFn: () => reviewApi.getAverageRating(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useReviewStats = () => {
  return useQuery({
    queryKey: reviewQueryKeys.stats(),
    queryFn: () => reviewApi.getReviewStats(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

// Mutation Hooks
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewApi.createReview,
    onSuccess: (data) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.lists() });

      // Invalidate average rating for the product
      if (data.data?.product) {
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
    mutationFn: reviewApi.deleteReview,
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
    mutationFn: reviewApi.toggleReviewApproval,
    onSuccess: (data, reviewId) => {
      // Update the specific review in cache
      queryClient.setQueryData(
        reviewQueryKeys.detail(reviewId),
        (old: ApiResponse<Review> | undefined) => {
          if (!old) return old;
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

export {
  type Review,
  type ReviewParams,
  type CreateReviewData,
  type AverageRatingResponse,
  type ReviewStats,
  type ReviewsResponse,
  type User,
  type ApiResponse,
};
