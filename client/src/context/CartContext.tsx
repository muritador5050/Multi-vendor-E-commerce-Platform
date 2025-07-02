import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/type/product';
import { useIsAuthenticated } from '@/hooks/useAuth';

// Types
interface CartItem {
  product: Product;
  quantity: number;
  _id?: string;
}

interface CartData {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

type CartResponse = ApiResponse<CartData>;

// API Configuration
const apiBase = import.meta.env.VITE_API_URL;

// Query Keys
export const cartKeys = {
  all: ['cart'] as const,
  items: () => [...cartKeys.all, 'items'] as const,
};

// API Functions
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse> => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${apiBase}/carts${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
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

const fetchCart = async (): Promise<CartData> => {
  const response: CartResponse = await apiRequest('/items');

  if (!response.success) {
    throw new Error(response.message || 'Failed to load cart');
  }

  return {
    items: response.data?.items || [],
    totalItems: response.data?.totalItems || 0,
    totalAmount: response.data?.totalAmount || 0,
  };
};

const addItemToCart = async ({
  productId,
  quantity = 1,
}: {
  productId: string;
  quantity?: number;
}): Promise<CartData> => {
  const response: CartResponse = await apiRequest('/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to add item to cart');
  }

  return {
    items: response.data?.items || [],
    totalItems: response.data?.totalItems || 0,
    totalAmount: response.data?.totalAmount || 0,
  };
};

const updateCartItemQuantity = async ({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<CartData> => {
  const response: CartResponse = await apiRequest(`/items/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to update quantity');
  }

  return {
    items: response.data?.items || [],
    totalItems: response.data?.totalItems || 0,
    totalAmount: response.data?.totalAmount || 0,
  };
};

const removeCartItem = async (productId: string): Promise<void> => {
  const response: ApiResponse = await apiRequest(`/items/${productId}`, {
    method: 'DELETE',
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to remove item');
  }
};

const clearCartItems = async (): Promise<void> => {
  const response: ApiResponse = await apiRequest('/clear', {
    method: 'DELETE',
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to clear cart');
  }
};

// Custom Hooks
export function useCart() {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: cartKeys.items(),
    queryFn: fetchCart,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();

  return useMutation({
    mutationFn: addItemToCart,
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.items(), data);
    },
    onError: (error) => {
      if (!isAuthenticated) {
        throw new Error('Please login to add items to cart');
      }
      throw error;
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();

  return useMutation({
    mutationFn: updateCartItemQuantity,
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.items(), data);
    },
    retry: 3,
    onError: (error) => {
      if (!isAuthenticated) {
        throw new Error('Please login to update cart');
      }
      throw error;
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();

  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
    },
    onError: (error) => {
      if (!isAuthenticated) {
        throw new Error('Please login to remove items from cart');
      }
      throw error;
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();

  return useMutation({
    mutationFn: clearCartItems,
    onSuccess: () => {
      queryClient.setQueryData(cartKeys.items(), {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    },
    onError: (error) => {
      if (!isAuthenticated) {
        throw new Error('Please login to clear cart');
      }
      throw error;
    },
  });
}

// Hook to clear cart data on logout (use in your auth logic)
export function useClearCartOnLogout() {
  const queryClient = useQueryClient();

  const clearCartData = () => {
    queryClient.removeQueries({ queryKey: cartKeys.items() });
  };

  return clearCartData;
}
