import React, { useState } from 'react';
import { 
  CreditCard, ChevronLeft, User, Mail, Phone, MapPin
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Checkout = ({ onNavigate }) => {
  const { totalPrice } = useCart();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    houseNumber: '',
    streetName: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNavigate('payment');
  };

  const inputClasses = "w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-600";
  const labelClasses = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2";

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => onNavigate('cart')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Cart
        </button>

        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">Order Details</h1>
          <p className="text-gray-400 mb-8">Tell us where to send your premium AI storybook.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClasses}><User size={14} /> Full Name</label>
                <input 
                  required 
                  type="text" 
                  placeholder="John Doe" 
                  className={inputClasses}
                  value={formData.fullName} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                />
              </div>
              <div>
                <label className={labelClasses}><Mail size={14} /> Email Address</label>
                <input 
                  required 
                  type="email" 
                  placeholder="john@example.com" 
                  className={inputClasses}
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div>
                <label className={labelClasses}><Phone size={14} /> Phone Number</label>
                <input 
                  required 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  className={inputClasses}
                  value={formData.phoneNumber} 
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                />
              </div>
            </div>

            <div className="h-px bg-gray-800 my-4" />

            <div>
              <label className={`${labelClasses} mb-4`}><MapPin size={14} /> Shipping Address</label>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="text-[10px] text-gray-600 uppercase mb-1 block">House / Apt No.</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="123" 
                      className={inputClasses}
                      value={formData.houseNumber} 
                      onChange={(e) => setFormData({...formData, houseNumber: e.target.value})} 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-gray-600 uppercase mb-1 block">Street Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Innovation Drive" 
                      className={inputClasses}
                      value={formData.streetName} 
                      onChange={(e) => setFormData({...formData, streetName: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-600 uppercase mb-1 block">City</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Neo Kyoto" 
                      className={inputClasses}
                      value={formData.city} 
                      onChange={(e) => setFormData({...formData, city: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 uppercase mb-1 block">State / Region</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="California" 
                      className={inputClasses}
                      value={formData.state} 
                      onChange={(e) => setFormData({...formData, state: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 uppercase mb-1 block">Zip Code</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="90210" 
                      className={inputClasses}
                      value={formData.zipCode} 
                      onChange={(e) => setFormData({...formData, zipCode: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-600/20 active:scale-[0.98]"
              >
                <CreditCard size={20} />
                Continue to Payment (${totalPrice.toFixed(2)})
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
