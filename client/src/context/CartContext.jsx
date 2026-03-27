import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const value = useMemo(() => ({
    items,
    addItem(item) {
      setItems((prev) => [...prev, item]);
    },
    clearCart() {
      setItems([]);
    },
    removeItem(index) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    },
    get subtotal() {
      return items.reduce((sum, item) => sum + item.totalPrice, 0);
    },
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
