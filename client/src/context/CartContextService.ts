import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/type/product';
import { useIsAuthenticated } from './AuthContextService';
import type { CartData } from '@/type/Cart';
import { apiClient } from '@/utils/Api';
import type { ApiResponse } from '@/type/ApiResponse';

// Query keys for cart operations
const cartKeys = {
  all: ['cart'] as const,
  items: () => [...cartKeys.all, 'items'] as const,
};

const fetchCart = async (): Promise<CartData> => {
  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<CartData>
  >('/carts/items');

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
  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<CartData>
  >('/carts/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });

  if (!response.success) {
    if (response.message?.includes('stock')) {
      throw new Error('Sorry, this item is out of stock');
    }
    if (response.message?.includes('limit')) {
      throw new Error("You've reached the maximum quantity for this item");
    }
    throw new Error(response.message || 'Failed to add item to cart');
  }

  return {
    items: response.data?.items || [],
    totalItems: response.data?.totalItems || 0,
    totalAmount: response.data?.totalAmount || 0,
  };
};

const updateItemQuantity = async ({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<CartData> => {
  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<CartData>
  >(`/carts/items/${productId}`, {
    method: 'PATCH',
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
  const response = await apiClient.authenticatedApiRequest<ApiResponse<void>>(
    `/carts/items/${productId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to remove item');
  }
};

const clearCartItems = async (): Promise<void> => {
  const response = await apiClient.authenticatedApiRequest<ApiResponse<void>>(
    '/carts/clear',
    {
      method: 'DELETE',
    }
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to clear cart');
  }
};

export function useCart() {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: cartKeys.items(),
    queryFn: fetchCart,
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addItemToCart,
    onMutate: async ({ productId, quantity = 1 }) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.items() });

      const previousCart = queryClient.getQueryData<CartData>(cartKeys.items());

      if (previousCart) {
        const updatedCart = { ...previousCart };
        const existingItemIndex = updatedCart.items.findIndex(
          (item) => item.product._id === productId
        );

        if (existingItemIndex >= 0) {
          updatedCart.items[existingItemIndex] = {
            ...updatedCart.items[existingItemIndex],
            quantity: updatedCart.items[existingItemIndex].quantity + quantity,
          };
        } else {
          updatedCart.items.push({
            _id: productId,
            product: { _id: productId } as Product,
            quantity,
          });
        }

        updatedCart.totalItems = updatedCart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        queryClient.setQueryData(cartKeys.items(), updatedCart);
      }

      return { previousCart };
    },

    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.items(), data);
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.items(), context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
    },
  });
}

export function useUpdateQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateItemQuantity,
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({
        queryKey: cartKeys.items(),
      });

      const previousCart = queryClient.getQueryData<CartData>(cartKeys.items());

      if (previousCart) {
        const updatedCart = { ...previousCart };
        const itemIndex = updatedCart.items.findIndex(
          (item) => item.product._id === productId
        );

        if (itemIndex >= 0) {
          updatedCart.items[itemIndex] = {
            ...updatedCart.items[itemIndex],
            quantity,
          };

          // Update totals
          updatedCart.totalItems = updatedCart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          // Fix: Calculate totalAmount in optimistic update
          updatedCart.totalAmount = updatedCart.items.reduce(
            (sum, item) => sum + (item.product.price || 0) * item.quantity,
            0
          );

          queryClient.setQueryData(cartKeys.items(), updatedCart);
        }
      }

      return { previousCart };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.items(), data);
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.items(), context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
    },
    retry: 1,
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItem,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.items() });

      const previousCart = queryClient.getQueryData<CartData>(cartKeys.items());

      if (previousCart) {
        const updatedCart = {
          ...previousCart,
          items: previousCart.items.filter(
            (item) => item.product._id !== productId
          ),
        };

        updatedCart.totalItems = updatedCart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        updatedCart.totalAmount = updatedCart.items.reduce(
          (sum, item) => sum + (item.product.price || 0) * item.quantity,
          0
        );

        queryClient.setQueryData(cartKeys.items(), updatedCart);
      }

      return { previousCart };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.items(), context.previousCart);
      }
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCartItems,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartKeys.items() });

      const previousCart = queryClient.getQueryData<CartData>(cartKeys.items());

      queryClient.setQueryData(cartKeys.items(), {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });

      return { previousCart };
    },
    onSuccess: () => {
      queryClient.setQueryData(cartKeys.items(), {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.items(), context.previousCart);
      }
    },
  });
}

export function useClearCartOnLogout() {
  const queryClient = useQueryClient();

  const clearCartData = () => {
    queryClient.removeQueries({ queryKey: cartKeys.items() });
  };

  return clearCartData;
}

export function useCartLoading() {
  const cart = useCart();
  const addToCart = useAddToCart();
  const updateQuantity = useUpdateQuantity();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  return {
    isLoading: cart.isLoading,
    isMutating:
      addToCart.isPending ||
      updateQuantity.isPending ||
      removeFromCart.isPending ||
      clearCart.isPending,
  };
}

export function useCartCount() {
  const { data } = useCart();
  return data?.totalItems || 0;
}

export function useIsInCart(productId: string) {
  const { data } = useCart();
  return data?.items.some((item) => item.product._id === productId) || false;
}

export function useCartItem(productId: string) {
  const { data } = useCart();
  return data?.items.find((item) => item.product._id === productId);
}
