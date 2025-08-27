import type { Order } from './Order';

type PaymentProvider = 'stripe' | 'paystack' | 'card' | 'bank_transfer';
type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'disputed';

export interface Payment {
  _id: string;
  orderId: string;
  paymentProvider: PaymentProvider;
  paymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: Date;
  failureReason?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  transactionDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SinglePaymentResponse {
  _id: string;
  orderId: Order;
  paymentProvider: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPayments {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatedPaymentResponse {
  payment: {
    _id: string;
    orderId: string;
    paymentProvider: PaymentProvider;
    paymentId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  checkoutUrl: string;
}

export interface UpdatePaymentStatusData {
  status: string;
  paidAt?: Date;
}

export interface PaymentFilters {
  status?: string;
  orderId?: string;
  paidAt?: string;
  paymentProvider?: PaymentStatus;
  page?: number;
  limit?: number;
}

export interface PaymentAnalytics {
  period: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalSpent: number;
    totalTransactions: number;
    averageTransactionAmount: number;
    largestTransaction: number;
    smallestTransaction: number;
    successRate: string;
  };

  paymentCounts: {
    successful: number;
    failed: number;
    pending: number;
  };

  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;

  monthlyTrends: Array<{
    year: number;
    month: number;
    monthName: string;
    totalAmount: number;
    transactionCount: number;
    avgAmount: number;
  }>;

  paymentMethodBreakdown: Array<{
    count: number;
    paymentProvider: string;
    totalAmount: number;
    avgAmount: number;
  }>;
  recentTransactions: Array<{
    _id: string;
    orderId: {
      _id: string;
    };
    paymentProvider: string;
    paymentId: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}
