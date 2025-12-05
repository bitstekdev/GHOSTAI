// import React from 'react';
// import GhostSidebar from './GhostSidebar';
// import { useNavigate } from 'react-router-dom';

// export default function CheckoutShipping() {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-[#0b0b0d] text-white p-10">
//       <div className="mx-auto" style={{ maxWidth: '1200px' }}>
//         {/* Top progress */}
//         <div className="flex flex-col items-center mb-8">
//           <img src="/src/assets/logo.png" alt="logo" className="mb-4 h-10" />
//           <div className="w-full flex items-center justify-center gap-6">
//             <div className="flex items-center gap-6 w-full max-w-3xl">
//               <div className="flex-1">
//                 <div className="flex items-center gap-4">
//                   <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">1</div>
//                   <div className="text-sm text-gray-300">Ordering</div>
//                 </div>
//               </div>

//               <div className="flex-1">
//                 <div className="flex items-center gap-4">
//                   <div className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center">2</div>
//                   <div className="text-sm text-gray-400">Shipping</div>
//                 </div>
//               </div>

//               <div className="flex-1">
//                 <div className="flex items-center gap-4">
//                   <div className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center">3</div>
//                   <div className="text-sm text-gray-400">Payment</div>
//                 </div>
//               </div>

//               <div className="flex-1">
//                 <div className="flex items-center gap-4">
//                   <div className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center">4</div>
//                   <div className="text-sm text-gray-400">Confirmation</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-start gap-8">
//           {/* Left preview */}
//           <div className="flex-1 bg-[#161618] rounded-2xl p-10 shadow-lg">
//             <div className="bg-[#1f1f23] rounded-xl p-8 flex items-center justify-center" style={{ height: 520 }}>
//               <div className="w-80 h-96 bg-[#2b2b2e] rounded-md flex items-center justify-center overflow-hidden">
//                 <img src="/src/assets/coverpage.png" alt="cover" className="object-cover w-full h-full" />
//               </div>
//             </div>
//           </div>

//           {/* Right form panel */}
//           <div className="w-[520px] bg-[#161618] rounded-2xl p-8 shadow-lg">
//             <h3 className="text-2xl font-bold mb-4">Where should we send your book?</h3>
//             <p className="text-gray-400 mb-6">Enter your shipping and billing information</p>

//             <div className="space-y-4 max-h-[520px] overflow-auto pr-2">
//               <div>
//                 <label className="block text-sm text-gray-300 mb-2">Full Name</label>
//                 <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="Enter your full name" />
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-300 mb-2">Address Line 1</label>
//                 <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="Street address, sector, village, area" />
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-300 mb-2">Address Line 2</label>
//                 <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="Flat, House no, building" />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm text-gray-300 mb-2">City name</label>
//                   <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="city" />
//                 </div>
//                 <div>
//                   <label className="block text-sm text-gray-300 mb-2">State</label>
//                   <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="state" />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm text-gray-300 mb-2">ZIP/Postal code</label>
//                   <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="ZIP/Postal code" />
//                 </div>
//                 <div>
//                   <label className="block text-sm text-gray-300 mb-2">Country</label>
//                   <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="country" />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-300 mb-2">Phone Number</label>
//                 <input className="w-full bg-[#0f0f11] border border-gray-700 rounded-md p-3 text-white" placeholder="Phone number" />
//               </div>

//               <div className="mt-6">
//                 <button onClick={() => navigate('/checkout/payment')} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-3 text-lg font-semibold">Proceed to Payment</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
