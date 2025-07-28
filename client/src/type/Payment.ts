export interface Payment {
  _id: string;
  order: string;
  paymentProvider: 'stripe' | 'paystack';
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  paidAt?: Date;
  failureReason?: string;
  transactionDetails?: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface CreatePaymentData {
  order: string;
  paymentProvider: 'stripe' | 'paystack';
  amount: number;
  currency?: string;
}

export interface CreatePaymentResponse {
  results: Payment;
  checkoutUrl: string;
}

export interface UpdatePaymentStatusData {
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  paidAt?: string;
}

export interface PaymentFilters {
  status?: string;
  orderId?: string;
  paidAt?: string;
  paymentProvider?: string;
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
    paymentMethod: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
    percentage: number;
  }>;
  recentTransactions: Payment[];
}
