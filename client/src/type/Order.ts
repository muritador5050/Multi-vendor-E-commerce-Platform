type PaymentMethod = 'stripe' | 'paystack' | 'card' | 'bank_transfer';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderProduct {
  product: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  products: CreateOrderProduct[];
  shippingAddress: Address;
  billingAddress?: Address;
  useSameAddress: boolean;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  shippingCost?: number;
}

export interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  products: CreateOrderProduct[];
  shippingAddress: Address;
  billingAddress: Address;
  useSameAddress: boolean;
  paymentMethod: PaymentMethod;
  statusHistory: Array<{
    status: string;
    changedAt: Date;
    changedBy: string;
    reason: string;
  }>;
  orderStatus:
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'on_hold';
  totalPrice: number;
  shippingCost: number;
  trackingNumber: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
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
  _id: string;
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
