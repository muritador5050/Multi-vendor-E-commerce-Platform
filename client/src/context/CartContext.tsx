import type { Product } from '@/utils/ProductType';
import React, { useState } from 'react';
import { CartContext } from './AuthContext';

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Product[]>([]);

  const addToCart = (newProduct: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((p) => p.id === newProduct.id);
      if (existing) {
        return prevCart.map((p) =>
          p.id === newProduct.id
            ? { ...p, quantity: p.quantity + newProduct.quantity }
            : p
        );
      }
      return [...prevCart, newProduct];
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
