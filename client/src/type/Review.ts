import type { User } from './auth';
import type { Product } from './product';

export interface Review {
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

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ReviewParams {
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

export interface CreateReviewData {
  product: string;
  rating: number;
  comment?: string;
}

export interface AverageRatingResponse {
  avgRating: number;
  totalReviews: number;
}

export interface ReviewStats {
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
