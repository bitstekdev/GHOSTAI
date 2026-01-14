import React from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { cartItems, removeFromCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, i) => sum + (i.price || 0), 0).toFixed(2);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Cart is empty
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cartItems.map((item) => (
        <div key={item.storyId} className="flex gap-4 bg-gray-900 p-4 rounded-xl mb-4">
          <img src={item.cover} className="w-24 rounded" alt={item.title} />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p>${item.price}</p>
          </div>
          <button
            onClick={() => removeFromCart(item.storyId)}
            className="text-red-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="mt-6 flex justify-between items-center">
        <p className="text-xl font-bold">Total: ${total}</p>
        <button
          onClick={() => navigate("/order")}
          className="bg-purple-600 px-6 py-3 rounded-lg font-semibold"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
