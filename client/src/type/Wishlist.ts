import type { Product } from './product';

export interface WishlistItem {
  _id: string;
  user: string;
  product: Product;
  addedAt: Date;
}

export interface WishlistResponse {
  data: WishlistItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface WishlistParams {
  page?: number;
  limit?: number;
  sort?: 'addedAt' | 'product.name';
}
