export interface Product {
  _id: string;
  name: string;
  description: string;
  slug: string;
  price: number;
  discount: number;
  quantityInStock: number;
  images: string[];
  category: { _id: string; name: string; slug?: string; image?: string };
  attributes: Record<string, string>;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  isDeleted: boolean;
  vendor?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ProductDocument {
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
  isDeleted?: boolean;
  vendor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  discount?: number;
  quantityInStock: number;
  images?: string[];
  category: string;
  attributes?: Record<string, string>;
  vendor?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  _id: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  discount: number;
  quantityInStock: number;
  images: File[];
  category: string;
  attributes: Record<string, string>;
  vendorId?: string;
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
  limit: number;
}

export interface ProductPaginatedResponse {
  products: Product[];
  pagination: Pagination;
}
