import { createContext, useContext, useEffect, useState } from "react";
import {
  getCartApi,
  addToCartApi,
  updateCartApi,
  removeCartApi,
  clearCartApi,
} from "../components/Cart/cart.api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    setLoading(true);
    const res = await getCartApi();
    setCart(res.data.cart || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (payload) => {
    await addToCartApi(payload);
    fetchCart();
  };

  const updateQuantity = async (storyId, planId, quantity) => {
    await updateCartApi({ storyId, planId, quantity });
    fetchCart();
  };

  const removeItem = async (storyId, planId) => {
    await removeCartApi({ storyId, planId });
    fetchCart();
  };

  const clearCart = async () => {
    await clearCartApi();
    setCart([]);
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const totalPrice = cart.reduce(
    (sum, i) => sum + i.planId.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
