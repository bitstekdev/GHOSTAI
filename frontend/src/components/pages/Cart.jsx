import React from 'react';
import { 
  Trash2, ShoppingBag, Minus, Plus, ArrowRight, ChevronLeft
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Cart = ({ onNavigate }) => {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900/50 p-12 rounded-3xl border border-gray-800 text-center max-w-lg">
          <div className="bg-purple-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-purple-400" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Looks like you haven't added any AI stories to your collection yet.</p>
          <button onClick={() => onNavigate('home')} className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl transition-all">
            Browse Stories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          Your Cart <span className="text-gray-500 text-xl font-normal">({totalItems} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex gap-4 items-center">
                <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                  <img src={item.story.coverImage?.s3Url} alt={item.story.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-white">{item.story.title}</h3>
                  <p className="text-sm text-gray-400">{item.story.genre} • {item.story.orientation}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center bg-black/40 border border-gray-700 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:text-purple-400 transition-colors text-white"
                      >
                        <Minus size={16}/>
                      </button>
                      <span className="px-3 text-sm font-medium text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:text-purple-400 transition-colors text-white"
                      >
                        <Plus size={16}/>
                      </button>
                    </div>
                    <span className="text-purple-400 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-3 text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="h-px bg-gray-800" />
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => onNavigate('checkout')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group">
                Checkout Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-widest">Secure 256-bit SSL encrypted payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
