import React, { useState, createContext, useContext } from 'react';

// ==================== CART CONTEXT ====================
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (story) => {
    const existingItem = cart.find(item => item.id === story.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === story.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        id: story.id, 
        story, 
        quantity: 1, 
        price: 29.99 
      }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item => 
        item.id === id 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
