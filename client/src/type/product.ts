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

// API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  result?: T;
  results?: T;
  products?: Product[];
  count?: number;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

// Form data
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
