import React, { createContext, useContext, useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
