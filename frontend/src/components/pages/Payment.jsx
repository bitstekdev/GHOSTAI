import React, { useState } from 'react';
import { 
  CreditCard, ChevronLeft, Lock, Calendar, Hash, ShieldCheck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Payment = ({ onNavigate }) => {
  const { totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      clearCart();
      onNavigate('success');
    }, 2500);
  };

  const inputClasses = "w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-600";

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <button 
          onClick={() => onNavigate('checkout')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8" 
          disabled={isProcessing}
        >
          <ChevronLeft size={20} />
          Back to Details
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
          {isProcessing && (
            <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white font-bold">Verifying Transaction...</p>
              <p className="text-gray-400 text-sm mt-2">Please do not refresh the page.</p>
            </div>
          )}

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Secure Payment</h1>
              <p className="text-gray-400 text-sm">Step 3 of 3</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs uppercase font-bold mb-1">Total to Pay</p>
              <p className="text-2xl font-bold text-purple-400">${totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl mb-8 text-white flex flex-col justify-between h-44 shadow-xl">
            <div className="flex justify-between items-center">
              <CreditCard size={32} />
              <div className="flex gap-1">
                <div className="w-8 h-8 rounded-full bg-red-500/80" />
                <div className="w-8 h-8 rounded-full bg-yellow-500/80 -ml-4" />
              </div>
            </div>
            <div>
              <p className="text-xl font-mono tracking-widest">•••• •••• •••• ••••</p>
              <div className="flex justify-between mt-4">
                <span className="text-[10px] uppercase opacity-60">Card Holder</span>
                <span className="text-[10px] uppercase opacity-60">Expires</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-bold tracking-wider">YOUR NAME</span>
                <span className="text-sm font-bold tracking-wider">MM/YY</span>
              </div>
            </div>
          </div>

          <form onSubmit={handlePay} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Card Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input required type="text" placeholder="0000 0000 0000 0000" className={`${inputClasses} pl-12`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input required type="text" placeholder="MM / YY" className={`${inputClasses} pl-12`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">CVV</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input required type="text" placeholder="123" className={`${inputClasses} pl-12`} />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
              <Lock size={18} />
              Pay ${totalPrice.toFixed(2)}
            </button>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
              <ShieldCheck size={14} className="text-green-500" />
              Your data is protected by AES-256 encryption
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
