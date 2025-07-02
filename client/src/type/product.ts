// Core data models
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  quantityInStock: number;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
    image: string;
  };
  attributes: Record<string, unknown>;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  vendor: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  slug: string;
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Unified API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Specific response types
export type ProductResponse = ApiResponse<Product>;
export type ProductListResponse = ApiResponse<{
  products: Product[];
  pagination: Pagination;
}>;

// Form and query interfaces
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  discount?: number;
  quantityInStock: number;
  images: string[];
  categoryId: string;
  attributes?: Record<string, unknown>;
  isActive?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
}
