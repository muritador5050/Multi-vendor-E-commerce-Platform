import type { ApiResponse } from './ApiResponse';

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  discount: number;
  quantityInStock: number;
  images: string[];
  categoryId: string;
  attributes: Record<string, unknown>;
}
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

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
  vendor?: string;
  material?: string;
  size?: string;
  color?: string;
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
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

export interface ProductPaginatedResponse<T> {
  products: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}
