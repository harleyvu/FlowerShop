import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  // optional stock information (when known)
  stock?: number;
};

type CartContextValue = {
  items: CartItem[];
  // returns true when operation succeeded, false when rejected due to stock
  addToCart: (item: Omit<CartItem, 'quantity'> & { stock?: number }, qty?: number) => boolean;
  removeFromCart: (productId: string) => void;
  // returns true when update succeeded, false when rejected due to stock
  updateQty: (productId: string, qty: number) => boolean;
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

  const addToCart = (item: Omit<CartItem, 'quantity'> & { stock?: number }, qty = 1) => {
    let ok = true;
    setItems(prev => {
      const found = prev.find(p => p.productId === item.productId);
      // determine stock to use: prefer existing stored stock, otherwise passed item.stock
      const knownStock = found?.stock ?? item.stock;
      if (found) {
        const newQty = found.quantity + qty;
        if (typeof knownStock === 'number' && newQty > knownStock) {
          ok = false; // reject
          return prev;
        }
        return prev.map(p => p.productId === item.productId ? { ...p, quantity: p.quantity + qty, stock: knownStock } : p);
      }
      if (typeof knownStock === 'number' && qty > knownStock) {
        ok = false;
        return prev;
      }
      return [...prev, { ...item, quantity: qty, stock: item.stock }];
    });
    return ok;
  };

  const removeFromCart = (productId: string) => setItems(prev => prev.filter(p => p.productId !== productId));

  const updateQty = (productId: string, qty: number) => {
    let ok = true;
    setItems(prev => prev.map(p => {
      if (p.productId !== productId) return p;
      if (typeof p.stock === 'number' && qty > p.stock) {
        ok = false;
        return p;
      }
      return { ...p, quantity: qty };
    }));
    return ok;
  };

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
