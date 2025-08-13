import type { Product } from './product';

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

export interface CartData {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}
