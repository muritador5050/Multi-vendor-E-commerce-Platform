import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Product } from '@/type/product';

// Types
interface CartItem {
  product: Product;
  quantity: number;
  _id?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

interface CartContextType {
  cart: CartState;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  loading: false,
  error: null,
};

// Action types
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | {
      type: 'SET_CART';
      payload: { items: CartItem[]; totalItems: number; totalAmount: number };
    }
  | { type: 'CLEAR_CART' };

//Reducer
const cartReducer = (state: CartState, action: CartAction) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalAmount: action.payload.totalAmount,
        loading: false,
        error: null,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// API Configuration
const apiBase = import.meta.env.VITE_API_URL;

//API function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${apiBase}/cart${endpoint}`, {
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

//Cart Provider Component
export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  const refreshCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiRequest('/items');

      if (response.success) {
        dispatch({
          type: 'SET_CART',
          payload: {
            items: response.data.results.items || [],
            totalItems: response.data.results.totalItems || 0,
            totalAmount: response.data.results.totalAmount || 0,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load cart',
      });
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiRequest('/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.success) {
        dispatch({
          type: 'SET_CART',
          payload: {
            items: response.data.results.items,
            totalItems: response.data.results.totalItems,
            totalAmount: response.data.results.totalAmount,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to add item to cart',
      });
      throw error; // Re-throw so calling component can handle it
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiRequest(`/items/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });

      if (response.success) {
        dispatch({
          type: 'SET_CART',
          payload: {
            items: response.data.results.items,
            totalItems: response.data.results.totalItems,
            totalAmount: response.data.results.totalAmount,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to update quantity',
      });
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await apiRequest(`/items/${productId}`, {
        method: 'DELETE',
      });

      // Refresh cart after removal
      await refreshCart();
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to remove item',
      });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await apiRequest('/clear', {
        method: 'DELETE',
      });

      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to clear cart',
      });
      throw error;
    }
  };

  const contextValue: CartContextType = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
