import React from "react";
import {
  Trash2,
  ShoppingBag,
  Minus,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cart,
    updateQuantity,
    removeItem,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();
  console.log("cart items:", cart);

  // EMPTY CART
  if (!cart.length) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
        <div className="bg-gray-900/50 p-12 rounded-3xl border border-gray-800 text-center max-w-lg">
          <div className="bg-purple-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-purple-400" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-8">
            Add a story to continue
          </p>
          <button
            onClick={() => navigate("/stories")}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl"
          >
            Browse Stories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Your Cart{" "}
            <span className="text-gray-500 text-lg font-normal">
              ({totalItems} items)
            </span>
          </h1>

        <div className="flex gap-4">
                <button
                    onClick={clearCart}
                    className="text-sm text-red-400 hover:text-red-300"
                >
                    Clear cart
                </button>
               <span className="text-gray-600">|</span>
                <button
                    onClick={() => navigate("/stories")}
                    className="text-sm text-purple-400 hover:text-purple-300"
                >
                    Browse Stories
                </button>
                </div>
        </div>

        {/* CART CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT - CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.storyId._id}-${item.planId._id}`}
                className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex gap-4"
              >
                {/* IMAGE */}
                <img
                  src={item.storyId.coverImage?.s3Url}
                  alt={item.storyId.title}
                  className="w-24 h-32 rounded-xl object-cover"
                />

                {/* DETAILS */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    {item.storyId.title}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {item.storyId.numOfPages} pages •{" "}
                    {item.storyId.orientation}
                  </p>

                  <p className="text-sm text-purple-400 mt-1">
                    Plan: {item.planId.name}
                  </p>

                  {/* QTY + PRICE */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center bg-black/40 border border-gray-700 rounded-lg p-1">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.storyId._id,
                            item.planId._id,
                            item.quantity - 1
                          )
                        }
                        className="p-1 hover:text-purple-400 text-white"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="px-3 text-sm text-white">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.storyId._id,
                            item.planId._id,
                            item.quantity + 1
                          )
                        }
                        className="p-1 hover:text-purple-400 text-white"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <span className="ml-auto font-bold text-purple-400">
                      ₹{item.planId.price * item.quantity}
                    </span>
                  </div>
                </div>

                {/* REMOVE */}
                <button
                  onClick={() =>
                    removeItem(item.storyId._id, item.planId._id)
                  }
                  className="text-gray-500 hover:text-red-400"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT - CHECKOUT */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-400">FREE</span>
                </div>

                <div className="h-px bg-gray-800" />

                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600
                           hover:from-purple-500 hover:to-pink-500
                           text-white font-bold py-4 rounded-xl
                           flex items-center justify-center gap-2"
              >
                Checkout Now
                <ArrowRight size={20} />
              </button>

              <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-widest">
                Secure 256-bit SSL encrypted payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
