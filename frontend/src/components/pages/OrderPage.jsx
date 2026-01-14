import React from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function OrderPage() {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, i) => sum + (i.price || 0), 0).toFixed(2);

  return (
    <div className="min-h-screen bg-black text-white flex justify-center px-4">
      <div className="bg-gray-900 p-6 rounded-xl max-w-lg w-full mt-10">
        <h1 className="text-2xl font-bold mb-4">Order Summary</h1>

        {cartItems.map((item) => (
          <div key={item.storyId} className="flex justify-between mb-2">
            <span>{item.title}</span>
            <span>${item.price}</span>
          </div>
        ))}

        <hr className="my-4 border-gray-700" />

        <p className="text-lg font-semibold mb-4">Total: ${total}</p>

        <button
          onClick={() => navigate("/payment")}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-lg font-semibold"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
