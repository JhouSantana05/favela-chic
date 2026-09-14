import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  totalItems: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'favela_chic_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.warn('Erro ao salvar carrinho no localStorage:', err);
    }
  }, [cart]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    const itemId = `${product.id}::${size}::${color}`;
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          selectedSize: size,
          selectedColor: color,
          quantity,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        totalItems,
        subtotal,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser utilizado dentro de um CartProvider');
  }
  return context;
}
