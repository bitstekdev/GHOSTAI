import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logo.gif';

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Ordering, 2: Shipping, 3: Payment, 4: Confirmation
  const [title, setTitle] = useState('The Happy Face');
  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi'

  const orderCost = 29.99;
  const shipping = 9.99;
  const tax = 9.07;
  const coupon = 5.07;
  const total = (orderCost + shipping + tax - coupon).toFixed(2);

  const steps = [
    { id: 1, title: 'Ordering' },
    { id: 2, title: 'Shipping' },
    { id: 3, title: 'Payment' },
    { id: 4, title: 'Confirmation' }
  ];

  const progressPercent = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white p-10">
      <div className="mx-auto" style={{ maxWidth: '1200px' }}>
        {/* Top progress with animated purple line */}
        <div className="flex flex-col items-center mb-8">
           <div className="flex items-center gap-3 p-6 border-b border-[#1c1c1c]">
                   <img src={Logo} alt="GHOST.ai Logo" className="h-12 rounded-md" />
                   <h1 className="text-3xl font-bold text-white tracking-wide">GHOST.ai</h1>
                 </div>
          <div className="w-full flex items-center justify-center">
            <div className="w-full max-w-3xl">
              <div className="flex items-center justify-between mb-3 relative z-20">
                {steps.map(s => (
                  <div key={s.id} className="flex flex-col items-center text-center w-1/4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${step >= s.id ? 'bg-purple-600 text-white' : 'border border-gray-600 text-gray-300'}`}>
                      {s.id}
                    </div>
                    <div className={`mt-2 text-xs ${step >= s.id ? 'text-white' : 'text-gray-400'}`}>{s.title}</div>
                  </div>
                ))}
              </div>

              {/* Track */}
              <div className="relative h-1 bg-gray-700 rounded-full">
                <div
                  className="absolute left-0 top-0 h-1 bg-purple-600 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-8">
          {/* Left preview / Order review or cover preview on Shipping step */}
          <div className="flex-1 bg-[#161618] rounded-2xl p-8 shadow-lg">
            {step === 2 ? (
              <div className="bg-[#1f1f23] rounded-xl p-8 flex items-center justify-center" style={{ minHeight: 520 }}>
                <div className="w-80 h-96 bg-[#2b2b2e] rounded-md flex items-center justify-center overflow-hidden">
                  {/* Replace with actual cover image path if available */}
                  <img src="/src/assets/coverpage.png" alt="cover" className="object-cover w-full h-full" />
                </div>
              </div>
            ) : (
              <div className="bg-[#1f1f23] rounded-xl p-8" style={{ minHeight: 520 }}>
                <h2 className="text-2xl font-bold mb-6">Order Review</h2>

                <div className="text-sm text-purple-400 mb-1">Shipping To</div>
                <div className="mb-4 text-gray-300">Alex Jhonson</div>

                <div className="text-sm text-purple-400 mb-1">Shipping Address</div>
                <div className="mb-4 text-gray-300">H.no - 10-H, Greenland colony, Gachibowli, 50002</div>

                <div className="text-sm text-purple-400 mb-1">Items</div>
                <div className="mb-4 text-gray-300">{title}</div>

                <div className="text-sm text-purple-400 mb-3">Order Summary</div>

                <div className="bg-[#1a1a1d] rounded-md p-4">
                  <div className="flex justify-between text-gray-300 mb-2"><div>Order cost</div><div>${orderCost.toFixed(2)}</div></div>
                  <div className="flex justify-between text-gray-300 mb-2"><div>Shipping cost</div><div>${shipping.toFixed(2)}</div></div>
                  <div className="flex justify-between text-gray-300 mb-2"><div>Tax</div><div>${tax.toFixed(2)}</div></div>
                  <div className="border-t border-gray-700 pt-3 flex justify-between font-semibold text-white"><div>Total cost</div><div>${total}</div></div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel (step content) */}
          <div className="w-[560px] bg-[#161618] rounded-2xl p-8 shadow-lg">
            {step === 1 && (
              <>
                <h3 className="text-2xl font-bold mb-4">Your AI-Generated Storybook</h3>

                <label className="block text-sm text-gray-300 mb-2">Book Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 mb-4 text-white" />

                <label className="block text-sm text-gray-300 mb-2">Quantity</label>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-8 h-8 rounded-full bg-[#2b2b2e] flex items-center justify-center">-</button>
                  <div className="text-lg font-semibold">{qty}</div>
                  <button onClick={() => setQty(q => q+1)} className="w-8 h-8 rounded-full bg-[#2b2b2e] flex items-center justify-center">+</button>
                </div>

                <div className="bg-[#0f0f11] border border-gray-700 rounded-md p-4 space-y-2 mb-6 mt-6">
                  <div className="flex justify-between text-gray-300"> <div>Order cost</div> <div>${orderCost.toFixed(2)}</div> </div>
                  <div className="flex justify-between text-gray-300"> <div>Shipping cost</div> <div>${shipping.toFixed(2)}</div> </div>
                  <div className="flex justify-between text-gray-300"> <div>Tax</div> <div>${tax.toFixed(2)}</div> </div>
                  <div className="border-t border-gray-700 pt-3 flex justify-between font-semibold"> <div>Total cost</div> <div>${total}</div> </div>
                </div>

                <button onClick={() => setStep(2)} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-3 text-lg font-semibold">Proceed to Shipping</button>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-2xl font-bold mb-4">Shipping</h3>
                <p className="text-gray-400 mb-6">Enter your shipping and billing information</p>

                <div className="space-y-4 max-h-[420px] overflow-auto pr-2">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                    <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="Enter your full name" />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Address</label>
                    <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="Street address, sector, village, area" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">City</label>
                      <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="city" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Postal code</label>
                      <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="ZIP/Postal code" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Phone</label>
                    <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="Phone number" />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="flex-1 bg-gray-700 rounded-md px-4 py-2">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2">Proceed to Payment</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-2xl font-bold mb-4">Secure Payment</h3>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 rounded-lg py-2 transition-colors ${paymentMethod === 'card' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    Debit/Credit card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 rounded-lg py-2 transition-colors ${paymentMethod === 'upi' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    UPI
                  </button>
                </div>

                {/* UPI header snippet when UPI is selected */}
                                {paymentMethod === 'upi' && (
                                  <div className="mb-4 rounded-md overflow-hidden border border-[#1c1c1c]">
                            
                                    <div className="p-6 bg-[#0f0f11]">
                                      <label className="block text-sm text-gray-400 mb-2">UPI Id</label>
                                      <input className="w-full bg-[#0b0b0d] border border-gray-700 rounded-md p-3 mb-4 text-white" placeholder="yourid@bank or 1234567890@upi" />
                                       <div className="flex gap-3 mb-4">
                                  <div className="flex-1 bg-[#0f0f11] border border-gray-700 rounded-md p-3 flex items-center justify-center">PayPal</div>
                                  <div className="flex-1 bg-[#0f0f11] border border-gray-700 rounded-md p-3 flex items-center justify-center">Paytm</div>
                                  <div className="flex-1 bg-[#0f0f11] border border-gray-700 rounded-md p-3 flex items-center justify-center">GPay</div>
                                </div>
                                    </div>
                                  </div>
                                )}

                                {/* Card form when card selected */}
                {paymentMethod === 'card' && (
                  <>
                    <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 mb-3 text-white" placeholder="1234 4567 7894 1234" />

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <input className="col-span-2 bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="Expiry date" />
                      <input className="bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="CVV" />
                    </div>

                    <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 mb-4 text-white" placeholder="Card holder name" />
                  </>
                )}


                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 bg-gray-700 rounded-md px-4 py-2">Back</button>
                  <button onClick={() => setStep(4)} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2">Proceed to Confirmation</button>
                </div>
              </>
            )}

            {step === 4 && (
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Thank You For Your Order!</h1>
                <p className="text-gray-400 mb-8">Your unique story, "{title}", is on its way to becoming a beautiful keepsake. A confirmation email has been sent to your email</p>

                <div className="mx-auto bg-[#2a2a2d] rounded-md p-6 w-3/4 mb-6">
                  <div className="flex justify-between text-gray-300 mb-2"><div>Order Number:</div><div className="font-semibold text-white">#GHOST-12345</div></div>
                  <div className="flex justify-between text-gray-300"><div>Estimated Delivery:</div><div className="font-semibold text-white">November 15, 2025<br/>Saturday</div></div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button onClick={() => navigate('/generate')} className="bg-purple-600 px-6 py-2 rounded-full">Create another story</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
