export interface Product {
  _id: string;
  name: string;
  description: string;
  slug: string;
  price: number;
  discount: number;
  quantityInStock: number;
  images: string[];
  category: string;
  attributes: Record<string, string>;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  isDeleted: boolean;
  vendor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  slug?: string;
  price: number;
  discount?: number;
  quantityInStock?: number;
  images?: string[];
  category: string;
  attributes?: Record<string, string>;
  averageRating?: number;
  totalReviews?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  vendor?: string;
}

export interface CreateProductResponse {
  data: CreateProductInput;
  count: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  _id: string;
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

export interface ProductPopulated extends Omit<Product, 'category' | 'vendor'> {
  category: {
    _id: string;
    name: string;
  };
  vendor?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface ProductPaginatedResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}
