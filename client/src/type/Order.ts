import type { User } from './auth';
import type { Product } from './product';

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type PaymentMethod = 'card' | 'paypal' | 'stripe' | 'bank_transfer' | string;

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface Order {
  _id: string;
  user: User;
  products: Product[];
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  shippingCost?: number;
  estimatedDelivery?: string;
  orderStatus?: string;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  deliveredAt?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
export interface OrderPagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
export interface OrdersResponse {
  orders: Order[];
  pagination: OrderPagination;
}

export interface OrderParams {
  page?: number;
  limit?: number;
  orderStatus?: string;
  paymentStatus?: string;
  user?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export interface MonthlyStats {
  _id: {
    year: number;
    month: number;
  };
  ordersCount: number;
  revenue: number;
}

export interface OrderStatsResponse {
  overview: OrderStats;
  monthlyTrends: MonthlyStats[];
}

// Analytics Types
export interface DailySalesReport {
  _id: string; // Date in YYYY-MM-DD format
  totalSales: number;
  orders: number;
}

export interface ProductSalesReport {
  productId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface VendorSalesAnalytics {
  totalSales: number;
  totalOrders: number;
  totalProductsSold: number;
}
