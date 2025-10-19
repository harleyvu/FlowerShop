import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
};

const KEY = 'CART_V1';
const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => {});
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems(prev => {
      const found = prev.find(p => p.productId === item.productId);
      if (found) {
        return prev.map(p => p.productId === item.productId ? { ...p, quantity: p.quantity + qty } : p);
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => setItems(prev => prev.filter(p => p.productId !== productId));

  const updateQty = (productId: string, qty: number) =>
    setItems(prev => prev.map(p => p.productId === productId ? { ...p, quantity: qty } : p));

  const clearCart = () => setItems([]);

  const total = items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

export default CartContext;
