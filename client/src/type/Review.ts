export interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  comment?: string;
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
  productId?: string;
  userId?: string;
  isApproved?: boolean;
  isDeleted?: boolean;
  minRating?: number;
  maxRating?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateReviewData {
  productId: string;
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
