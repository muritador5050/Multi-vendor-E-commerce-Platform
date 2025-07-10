import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
  DollarSign,
  Users,
} from 'lucide-react';

// API Configuration
const API_BASE = 'http://localhost:3000/api'; // Update with your API base URL

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v.toString()));
      } else {
        searchParams.set(key, value.toString());
      }
    }
  }

  return searchParams.toString();
};

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}/orders${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Network error' }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

// Query Keys
const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (params) => [...orderKeys.lists(), params],
  details: (id) => [...orderKeys.all, 'details', id],
  stats: () => [...orderKeys.all, 'stats'],
};

// API Functions
const orderApi = {
  // Get all orders with filters and pagination
  getOrders: async (params = {}) => {
    const queryString = buildQueryString(params);
    const endpoint = queryString ? `?${queryString}` : '';
    return apiRequest(endpoint);
  },

  // Get single order by ID
  getOrderById: async (id) => {
    return apiRequest(`/${id}`);
  },

  // Create new order
  createOrder: async (orderData) => {
    return apiRequest('', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Update order status
  updateOrderStatus: async ({ id, ...statusData }) => {
    return apiRequest(`/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  },

  // Delete order
  deleteOrder: async (id) => {
    return apiRequest(`/${id}`, {
      method: 'DELETE',
    });
  },

  // Get order statistics
  getOrderStats: async () => {
    return apiRequest('/stats');
  },
};

// Custom Hooks
const useOrders = (params = {}) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.getOrders(params),
    keepPreviousData: true,
  });
};

const useOrderById = (id) => {
  return useQuery({
    queryKey: orderKeys.details(id),
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!id,
  });
};

const useOrderStats = () => {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: orderApi.getOrderStats,
  });
};

const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.updateOrderStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.details(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

// Components
const OrderStats = () => {
  const { data: stats, isLoading, error } = useOrderStats();

  if (isLoading)
    return <div className='text-center py-4'>Loading stats...</div>;
  if (error)
    return (
      <div className='text-red-500 text-center py-4'>Error loading stats</div>
    );

  const overview = stats?.data?.overview || {};
  const monthlyTrends = stats?.data?.monthlyTrends || [];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex items-center'>
          <Package className='h-8 w-8 text-blue-600' />
          <div className='ml-4'>
            <p className='text-sm font-medium text-gray-600'>Total Orders</p>
            <p className='text-2xl font-bold text-gray-900'>
              {overview.totalOrders || 0}
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex items-center'>
          <DollarSign className='h-8 w-8 text-green-600' />
          <div className='ml-4'>
            <p className='text-sm font-medium text-gray-600'>Total Revenue</p>
            <p className='text-2xl font-bold text-gray-900'>
              ${overview.totalRevenue?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex items-center'>
          <TrendingUp className='h-8 w-8 text-purple-600' />
          <div className='ml-4'>
            <p className='text-sm font-medium text-gray-600'>
              Average Order Value
            </p>
            <p className='text-2xl font-bold text-gray-900'>
              ${overview.averageOrderValue?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex items-center'>
          <Users className='h-8 w-8 text-orange-600' />
          <div className='ml-4'>
            <p className='text-sm font-medium text-gray-600'>Pending Orders</p>
            <p className='text-2xl font-bold text-gray-900'>
              {overview.pendingOrders || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderFilters = ({ filters, onFiltersChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className='bg-white p-4 rounded-lg shadow-md mb-4'>
      <div className='flex flex-wrap gap-4 items-center'>
        <div className='flex-1 min-w-64'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search orders...'
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200'
        >
          <Filter className='h-4 w-4' />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <select
            value={filters.orderStatus || ''}
            onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>All Status</option>
            <option value='pending'>Pending</option>
            <option value='processing'>Processing</option>
            <option value='shipped'>Shipped</option>
            <option value='delivered'>Delivered</option>
            <option value='cancelled'>Cancelled</option>
            <option value='returned'>Returned</option>
          </select>

          <select
            value={filters.paymentStatus || ''}
            onChange={(e) =>
              handleFilterChange('paymentStatus', e.target.value)
            }
            className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>All Payment Status</option>
            <option value='pending'>Pending</option>
            <option value='completed'>Completed</option>
            <option value='failed'>Failed</option>
            <option value='refunded'>Refunded</option>
          </select>

          <input
            type='date'
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />

          <input
            type='date'
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
      )}
    </div>
  );
};

const OrderTable = ({ orders, onViewOrder, onUpdateStatus, onDeleteOrder }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='bg-white rounded-lg shadow-md overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Order ID
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Customer
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Products
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Total Price
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {orders.map((order) => (
              <tr key={order._id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {order._id.slice(-8)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {order.user?.name || 'N/A'}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {order.user?.email || 'N/A'}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {order.products?.length || 0} items
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  ${order.totalPrice?.toFixed(2)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {formatDate(order.createdAt)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => onViewOrder(order._id)}
                      className='text-blue-600 hover:text-blue-900'
                    >
                      <Eye className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() => onUpdateStatus(order)}
                      className='text-green-600 hover:text-green-900'
                    >
                      <Edit className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() => onDeleteOrder(order._id)}
                      className='text-red-600 hover:text-red-900'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Pagination = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination;

  return (
    <div className='flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6'>
      <div className='flex-1 flex justify-between sm:hidden'>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
        >
          Next
        </button>
      </div>
      <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
        <div>
          <p className='text-sm text-gray-700'>
            Page <span className='font-medium'>{currentPage}</span> of{' '}
            <span className='font-medium'>{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
            >
              <ChevronRight className='h-5 w-5' />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const OrderDetailsModal = ({ orderId, onClose }) => {
  const { data, isLoading, error } = useOrderById(orderId);

  if (!orderId) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 transition-opacity'>
          <div
            className='absolute inset-0 bg-gray-500 opacity-75'
            onClick={onClose}
          ></div>
        </div>

        <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div className='sm:flex sm:items-start'>
              <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full'>
                <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                  Order Details
                </h3>

                {isLoading && (
                  <div className='text-center py-4'>Loading...</div>
                )}
                {error && (
                  <div className='text-red-500 text-center py-4'>
                    Error loading order details
                  </div>
                )}

                {data?.data && (
                  <div className='space-y-4'>
                    <div>
                      <p className='font-medium'>Order ID:</p>
                      <p className='text-gray-600'>{data.data._id}</p>
                    </div>
                    <div>
                      <p className='font-medium'>Customer:</p>
                      <p className='text-gray-600'>
                        {data.data.user?.name} ({data.data.user?.email})
                      </p>
                    </div>
                    <div>
                      <p className='font-medium'>Products:</p>
                      <ul className='text-gray-600 list-disc list-inside'>
                        {data.data.products?.map((item, index) => (
                          <li key={index}>
                            {item.product?.name} - Qty: {item.quantity} - $
                            {item.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className='font-medium'>Total Price:</p>
                      <p className='text-gray-600'>${data.data.totalPrice}</p>
                    </div>
                    <div>
                      <p className='font-medium'>Status:</p>
                      <p className='text-gray-600'>{data.data.orderStatus}</p>
                    </div>
                    <div>
                      <p className='font-medium'>Payment Method:</p>
                      <p className='text-gray-600'>{data.data.paymentMethod}</p>
                    </div>
                    {data.data.shippingAddress && (
                      <div>
                        <p className='font-medium'>Shipping Address:</p>
                        <p className='text-gray-600'>
                          {data.data.shippingAddress.street},{' '}
                          {data.data.shippingAddress.city},{' '}
                          {data.data.shippingAddress.state}{' '}
                          {data.data.shippingAddress.zipCode}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
            <button
              onClick={onClose}
              className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UpdateStatusModal = ({ order, onClose }) => {
  const [orderStatus, setOrderStatus] = useState(order?.orderStatus || '');
  const [trackingNumber, setTrackingNumber] = useState(
    order?.trackingNumber || ''
  );
  const updateStatusMutation = useUpdateOrderStatus();

  const handleSubmit = (e) => {
    e.preventDefault();
    updateStatusMutation.mutate(
      {
        id: order._id,
        orderStatus,
        trackingNumber,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!order) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 transition-opacity'>
          <div
            className='absolute inset-0 bg-gray-500 opacity-75'
            onClick={onClose}
          ></div>
        </div>

        <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <form onSubmit={handleSubmit}>
            <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
              <div className='sm:flex sm:items-start'>
                <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full'>
                  <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                    Update Order Status
                  </h3>

                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Order Status
                      </label>
                      <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                        className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        required
                      >
                        <option value=''>Select Status</option>
                        <option value='pending'>Pending</option>
                        <option value='processing'>Processing</option>
                        <option value='shipped'>Shipped</option>
                        <option value='delivered'>Delivered</option>
                        <option value='cancelled'>Cancelled</option>
                        <option value='returned'>Returned</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Tracking Number (Optional)
                      </label>
                      <input
                        type='text'
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Enter tracking number'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
              <button
                type='submit'
                disabled={updateStatusMutation.isLoading}
                className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50'
              >
                {updateStatusMutation.isLoading
                  ? 'Updating...'
                  : 'Update Status'}
              </button>
              <button
                type='button'
                onClick={onClose}
                className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Component
const OrderManagement = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    orderStatus: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState(null);

  const { data: ordersData, isLoading, error } = useOrders(filters);
  const deleteOrderMutation = useDeleteOrder();

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrderForUpdate(order);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  if (isLoading)
    return <div className='text-center py-8'>Loading orders...</div>;
  if (error)
    return (
      <div className='text-red-500 text-center py-8'>
        Error loading orders: {error.message}
      </div>
    );

  const orders = ordersData?.data || [];
  const pagination = ordersData?.pagination || {};

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Order Management</h1>
        <p className='mt-2 text-sm text-gray-600'>
          Manage and track all orders in your system
        </p>
      </div>

      <OrderStats />

      <OrderFilters filters={filters} onFiltersChange={setFilters} />

      <OrderTable
        orders={orders}
        onViewOrder={handleViewOrder}
        onUpdateStatus={handleUpdateStatus}
        onDeleteOrder={handleDeleteOrder}
      />

      {pagination.totalPages > 1 && (
        <div className='mt-4'>
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      )}

      <OrderDetailsModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />

      <UpdateStatusModal
        order={selectedOrderForUpdate}
        onClose={() => setSelectedOrderForUpdate(null)}
      />
    </div>
  );
};
