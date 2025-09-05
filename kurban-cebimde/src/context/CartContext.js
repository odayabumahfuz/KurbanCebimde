import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addItem(newItem) {
    setItems(prev => [...prev, newItem]);
  }

  function removeItemById(id) {
    setItems(prev => prev.filter(x => x.id !== id));
  }

  function updateItemQuantity(id, nextQty) {
    setItems(prev => prev.map(x => {
      if (x.id !== id) return x;
      const qtyNum = Math.max(1, Number(nextQty || 1));
      const unitPrice = Number(x.unitPrice || 0);
      return { ...x, qty: qtyNum, amount: unitPrice * qtyNum };
    }));
  }

  function clearCart() {
    setItems([]);
  }

  const value = useMemo(() => ({
    items,
    addItem,
    removeItemById,
    updateItemQuantity,
    clearCart,
    count: items.length,
    total: items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0),
  }), [items]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}


