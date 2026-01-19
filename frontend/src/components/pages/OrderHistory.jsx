// import { useMemo, useState } from "react";
// import { Search, RotateCw } from "lucide-react";
// import cover from "../../assets/images/coverpage.png";

// const sampleOrders = [
//   {
//     id: 1,
//     title: "Rainbow Adventure",
//     status: "Ordered",
//     genre: "Family",
//     length: "3-5 Pages",
//     quantity: 2,
//     price: 200,
//     expected: "Expected Delivery on Sunday 09 Nov",
//     address:
//       "Greenland Colony, Madhava Reddy Colony, Gachibowli, Hyderabad, Telangana 500032",
//     date: "On Mon, 03 Nov 2025",
//     image: cover,
//   },
//   {
//     id: 2,
//     title: "Sunday Surprise",
//     status: "Delivered",
//     genre: "Family",
//     length: "3-5 Pages",
//     quantity: 2,
//     price: 200,
//     expected: "Delivered on Thursday 06 Nov",
//     address:
//       "Greenland Colony, Madhava Reddy Colony, Gachibowli, Hyderabad, Telangana 500032",
//     date: "On Mon, 03 Nov 2025",
//     image: cover,
//   },
//   {
//     id: 3,
//     title: "Forest of Wonders",
//     status: "Shipped",
//     genre: "Family",
//     length: "3-5 Pages",
//     quantity: 1,
//     price: 200,
//     expected: "Delivered on Thursday 06 Nov",
//     address:
//       "Greenland Colony, Madhava Reddy Colony, Gachibowli, Hyderabad, Telangana 500032",
//     date: "On Mon, 03 Nov 2025",
//     image: cover,
//   },
// ];

// function StatusBadge({ status }) {
//   const styles = {
//     Ordered: "bg-purple-500/20 text-purple-400 border-purple-500/30",
//     Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
//     Shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
//     Processing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
//   };

//   return (
//     <span
//       className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${
//         styles[status] ||
//         "bg-gray-500/20 text-gray-400 border-gray-500/30"
//       }`}
//     >
//       {status}
//     </span>
//   );
// }

// export default function OrderHistory() {
//   const [query, setQuery] = useState("");
//   const [filter, setFilter] = useState("All Orders");

//   const filtered = useMemo(() => {
//     return sampleOrders.filter((order) => {
//       const matchesFilter = filter === "All Orders" || order.status === filter;
//       const matchesQuery =
//         !query || order.title.toLowerCase().includes(query.toLowerCase());
//       return matchesFilter && matchesQuery;
//     });
//   }, [query, filter]);

//   const handleReorder = (id) => console.log("Reorder:", id);

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-white">
//       <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
//         {/* Title */}
//         <h1 className="text-2xl font-bold mb-6">Order History</h1>

//         {/* Search */}
//         <div className="mb-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search Order"
//               className="w-full bg-[#1a1a1a] border border-purple-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500"
//             />
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="flex flex-wrap gap-2 mb-6">
//           {["All Orders", "Delivered", "Processing", "Shipped"].map((status) => {
//             const active = filter === status;
//             return (
//               <button
//                 key={status}
//                 onClick={() => setFilter(status)}
//                 className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
//                   active
//                     ? "border border-purple-600 bg-purple-600/20 text-white"
//                     : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222] border border-gray-800"
//                 }`}
//               >
//                 {status}
//               </button>
//             );
//           })}
//         </div>

//         {/* Order List */}
//         <div className="space-y-4">
//           {filtered.length === 0 ? (
//             <div className="text-center py-10 text-gray-500">
//               No orders found
//             </div>
//           ) : (
//             filtered.map((order) => (
//               <article
//                 key={order.id}
//                 className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800"
//               >
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   {/* IMAGE */}
//                   <div className="flex-shrink-0 mx-auto sm:mx-0">
//                     <img
//                       src={order.image}
//                       alt={order.title}
//                       className="w-28 h-28 sm:w-20 sm:h-20 rounded object-cover"
//                     />
//                   </div>

//                   {/* DETAILS */}
//                   <div className="flex-1 min-w-0">
//                     {/* Title + Status + Date */}
//                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-1">
//                       <div className="flex items-center gap-2 min-w-0">
//                         <h3 className="text-purple-400 font-semibold text-base truncate">
//                           {order.title}
//                         </h3>
//                         <StatusBadge status={order.status} />
//                       </div>
//                       <span className="text-gray-500 text-xs sm:whitespace-nowrap">
//                         {order.date}
//                       </span>
//                     </div>

//                     {/* Info Grid */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm">
//                       <div className="flex gap-2">
//                         <span className="text-gray-500">Genre:</span>
//                         <span className="text-gray-300">{order.genre}</span>
//                       </div>

//                       <div className="flex gap-2">
//                         <span className="text-gray-500">Story Length:</span>
//                         <span className="text-gray-300">{order.length}</span>
//                       </div>

//                       <div className="flex gap-2">
//                         <span className="text-gray-500">Quantity:</span>
//                         <span className="text-gray-300">{order.quantity}</span>
//                       </div>

//                       <div className="flex gap-2">
//                         <span className="text-gray-500">Price:</span>
//                         <span className="text-gray-300">
//                           ₹{order.price}.0
//                         </span>
//                       </div>

//                       {/* Address - FULL WIDTH MOBILE */}
//                       <div className="sm:col-span-2 text-xs text-gray-300 leading-relaxed mt-2">
//                         <div className="text-gray-500 mb-1">
//                           Delivery Address
//                         </div>
//                         {order.address}
//                       </div>
//                     </div>

//                     {/* Footer */}
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-800">
//                       <p
//                         className={`text-sm ${
//                           order.status === "Delivered"
//                             ? "text-emerald-400"
//                             : order.status === "Shipped"
//                             ? "text-blue-400"
//                             : "text-purple-400"
//                         }`}
//                       >
//                         {order.expected}
//                       </p>

//                       {order.status === "Delivered" && (
//                         <button
//                           onClick={() => handleReorder(order.id)}
//                           className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-all w-full sm:w-auto"
//                         >
//                           <RotateCw className="w-4 h-4" />
//                           Re-order
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </article>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// ==========================================================================================================
// import { useMemo, useState, useContext } from "react";
// import { Search, RotateCw } from "lucide-react";
// import { AppContext } from "../../context/AppContext";


// // API Data
// const apiData = {
//   "success": true,
//   "count": 2,
//   "orders": [
//     {
//       "_id": "696e43eb906fb8026ea52deb",
//       "user": {
//         "_id": "693c20d9cef2f9280426f66d",
//         "name": "Naveed Hussaini",
//         "email": "syed.naveedullahusaini@gmail.com"
//       },
//       "type": "purchase",
//       "items": [
//         {
//           "story": {
//             "_id": "693d24c7cef2f9280426f7a9",
//             "title": "Parents Lead Way",
//             "numOfPages": 10,
//             "backCoverImage": "69680ec9580ddff94274b2d6",
//             "coverImage": "69680ec4580ddff94274b2d4",
//             "genres": [],
//             "coverImageUrl": "https://ghostverse-images.s3.amazonaws.com/stories/693d24c7cef2f9280426f7a9/covers/66560ca0-a054-4490-8ea9-2309c04ae882-cover.png",
//             "backCoverImageUrl": "https://ghostverse-images.s3.amazonaws.com/stories/693d24c7cef2f9280426f7a9/covers/3c4c184e-dff3-4bc4-8d63-34ee1cb49265-back-cover.png"
//           },
//           "plan": {
//             "_id": "696cc7e053ff8ece3a1c5e41",
//             "code": "PRINT_SOFT_SPARK",
//             "name": "Softcover · Spark",
//             "price": 499,
//             "currency": "INR",
//             "description": "Softcover book · Spark edition",
//             "type": "purchase",
//             "limits": {
//               "maxPages": 0,
//               "maxBooks": 0,
//               "faceSwaps": 0,
//               "regenerations": 0,
//               "edits": 0,
//               "erases": 0
//             },
//             "printType": "softcover",
//             "printSubType": "Spark",
//             "displayOrder": 1,
//             "isPopular": false,
//             "badge": "Softcover",
//             "showOnContext": [
//               "purchase"
//             ],
//             "validityDays": 0,
//             "isActive": true,
//             "isArchived": false,
//             "createdAt": "2026-01-18T11:45:36.702Z",
//             "updatedAt": "2026-01-18T11:45:36.702Z",
//             "__v": 0
//           },
//           "quantity": 1,
//           "unitPrice": 499,
//           "totalPrice": 499
//         }
//       ],
//       "shippingAddress": {
//         "city": "Hyderabad",
//         "state": "Telangana",
//         "country": "India"
//       },
//       "amount": 499,
//       "currency": "INR",
//       "status": "delivered",
//       "razorpay": {
//         "orderId": "order_S5m8HGQstqClqQ"
//       },
//       "createdAt": "2026-01-19T14:47:07.928Z",
//       "updatedAt": "2026-01-19T14:47:07.928Z",
//       "__v": 0
//     },
//     {
//       "_id": "696d39031d6c4ed5c5003768",
//       "user": {
//         "_id": "693c20d9cef2f9280426f66d",
//         "name": "Naveed Hussaini",
//         "email": "syed.naveedullahusaini@gmail.com"
//       },
//       "type": "purchase",
//       "items": [
//         {
//           "story": {
//             "_id": "696753a3c7693c36ff908ec3",
//             "genres": [
//               "Family"
//             ],
//             "numOfPages": 4,
//             "title": "Side By Side",
//             "backCoverImage": "6968332506a53e64d22d72b5",
//             "coverImage": "6968331e06a53e64d22d729e",
//             "coverImageUrl": "https://ghostverse-images.s3.amazonaws.com/stories/696753a3c7693c36ff908ec3/covers/0fc461d9-1a91-4222-83a0-07e7a7e2cec1-cover.png",
//             "backCoverImageUrl": "https://ghostverse-images.s3.amazonaws.com/stories/696753a3c7693c36ff908ec3/covers/1fca20aa-8225-410b-93d0-05fdae9b2c37-back-cover.png"
//           },
//           "plan": {
//             "_id": "696cc7e053ff8ece3a1c5e41",
//             "code": "PRINT_SOFT_SPARK",
//             "name": "Softcover · Spark",
//             "price": 499,
//             "currency": "INR",
//             "description": "Softcover book · Spark edition",
//             "type": "purchase",
//             "limits": {
//               "maxPages": 0,
//               "maxBooks": 0,
//               "faceSwaps": 0,
//               "regenerations": 0,
//               "edits": 0,
//               "erases": 0
//             },
//             "printType": "softcover",
//             "printSubType": "Spark",
//             "displayOrder": 1,
//             "isPopular": false,
//             "badge": "Softcover",
//             "showOnContext": [
//               "purchase"
//             ],
//             "validityDays": 0,
//             "isActive": true,
//             "isArchived": false,
//             "createdAt": "2026-01-18T11:45:36.702Z",
//             "updatedAt": "2026-01-18T11:45:36.702Z",
//             "__v": 0
//           },
//           "quantity": 1,
//           "unitPrice": 499,
//           "totalPrice": 499
//         }
//       ],
//       "shippingAddress": {
//         "city": "Hyderabad",
//         "state": "Telangana",
//         "country": "India"
//       },
//       "amount": 499,
//       "currency": "INR",
//       "status": "pending",
//       "razorpay": {
//         "orderId": "order_S5SjIY0quqe5IC"
//       },
//       "createdAt": "2026-01-18T19:48:19.499Z",
//       "updatedAt": "2026-01-18T19:48:19.499Z",
//       "__v": 0
//     }
//   ]
// };

// // Transform API data to UI format
// const transformOrders = (apiOrders) => {
//   return apiOrders.map((order) => {
//     const item = order.items[0];
//     const story = item.story;
    
//     // Format date
//     const orderDate = new Date(order.createdAt);
//     const dateStr = orderDate.toLocaleDateString('en-US', { 
//       weekday: 'short', 
//       day: '2-digit', 
//       month: 'short', 
//       year: 'numeric' 
//     });
    
//     // Calculate expected delivery (example: 7 days from order date)
//     const deliveryDate = new Date(orderDate);
//     deliveryDate.setDate(deliveryDate.getDate() + 7);
//     const deliveryStr = deliveryDate.toLocaleDateString('en-US', {  
//       weekday: 'long', 
//       day: '2-digit', 
//       month: 'short' 
//     });
    
//     // Map status
//     const statusMap = {
//       'pending': 'Ordered',
//       'processing': 'Processing',
//       'shipped': 'Shipped',
//       'delivered': 'Delivered'
//     };
    
//     // Get page range
//     const pages = story.numOfPages;
//     let pageRange;
//     if (pages <= 5) pageRange = '3-5 Pages';
//     else if (pages <= 10) pageRange = '6-10 Pages';
//     else if (pages <= 15) pageRange = '11-15 Pages';
//     else pageRange = '15+ Pages';
    
//     return {
//       id: order._id,
//       title: story.title,
//       status: statusMap[order.status] || 'Ordered',
//       genre: story.genres.length > 0 ? story.genres[0] : 'General',
//       length: pageRange,
//       quantity: item.quantity,
//       price: order.amount,
//       expected: order.status === 'delivered' 
//         ? `Delivered on ${deliveryStr}` 
//         : `Expected Delivery on ${deliveryStr}`,
//       address: `${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country}`,
//       date: `On ${dateStr}`,
//       image: story.coverImageUrl
//     };
//   });
// };

// const sampleOrders = transformOrders(apiData.orders);

// function StatusBadge({ status }) {
//   const styles = {
//     Ordered: "bg-purple-500/20 text-purple-400 border-purple-500/30",
//     Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
//     Shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
//     Processing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
//   };

//   return (
//     <span
//       className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${
//         styles[status] ||
//         "bg-gray-500/20 text-gray-400 border-gray-500/30"
//       }`}
//     >
//       {status}
//     </span>
//   );
// }

// export default function OrderHistory() {
//   const [query, setQuery] = useState("");
//   const [filter, setFilter] = useState("All Orders");
//   const { navigateTo } = useContext(AppContext);


//   const filtered = useMemo(() => {
//     return sampleOrders.filter((order) => {
//       const matchesFilter = filter === "All Orders" || order.status === filter;
//       const matchesQuery =
//         !query || order.title.toLowerCase().includes(query.toLowerCase());
//       return matchesFilter && matchesQuery;
//     });
//   }, [query, filter]);

//   const handleReorder = (storyId) => {
//     navigateTo(`/checkout/${storyId}`);
//   };

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-white">
//       <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
//         {/* Title */}
//         <h1 className="text-2xl font-bold mb-6">Order History</h1>

//         {/* Search */}
//         <div className="mb-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search Order"
//               className="w-full bg-[#1a1a1a] border border-purple-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500"
//             />
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="flex flex-wrap gap-2 mb-6">
//           {["All Orders", "Delivered", "Processing", "Shipped"].map((status) => {
//             const active = filter === status;
//             return (
//               <button
//                 key={status}
//                 onClick={() => setFilter(status)}
//                 className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
//                   active
//                     ? "border border-purple-600 bg-purple-600/20 text-white"
//                     : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222] border border-gray-800"
//                 }`}
//               >
//                 {status}
//               </button>
//             );
//           })}
//         </div>

//         {/* Order List */}
//         <div className="space-y-4">
//           {filtered.length === 0 ? (
//             <div className="text-center py-10 text-gray-500">
//               No orders found
//             </div>
//           ) : (
//             filtered.map((order) => (
//               <article
//                 key={order.id}
//                 className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800"
//               >
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   {/* IMAGE */}
//                   <div className="flex-shrink-0 mx-auto sm:mx-0">
//                     <img
//                       src={order.image}
//                       alt={order.title}
//                       className="w-28 h-28 sm:w-20 sm:h-20 rounded object-cover"
//                     />
//                   </div>

//                   {/* DETAILS */}
//                   <div className="flex-1 min-w-0">
//                     {/* Title + Status + Date */}
//                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-1">
//                       <div className="flex items-center gap-2 min-w-0">
//                         <h3 className="text-purple-400 font-semibold text-base truncate">
//                           {order.title}
//                         </h3>
//                         <StatusBadge status={order.status} />
//                       </div>
//                       <span className="text-gray-500 text-xs sm:whitespace-nowrap">
//                         {order.date}
//                       </span>
//                     </div>

//                     {/* Info Grid */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm">
//                       <div className="flex gap-2">
//                         <span className="text-gray-500">Genre:</span>
//                         <span className="text-gray-300">{order.genre}</span>
//                       </div>

//                       <div className="flex gap-2">
//                         <span className="text-gray-500">Story Length:</span>
//                         <span className="text-gray-300">{order.length}</span>
//                       </div>

//                       <div className="flex gap-2">
//                         <span className="text-gray-500">Quantity:</span>
//                         <span className="text-gray-300">{order.quantity}</span>
//                       </div>

//                       <div className="flex gap-2">
//                         <span className="text-gray-500">Price:</span>
//                         <span className="text-gray-300">
//                           ₹{order.price}.0
//                         </span>
//                       </div>

//                       {/* Address - FULL WIDTH MOBILE */}
//                       <div className="sm:col-span-2 text-xs text-gray-300 leading-relaxed mt-2">
//                         <div className="text-gray-500 mb-1">
//                           Delivery Address
//                         </div>
//                         {order.address}
//                       </div>
//                     </div>

//                     {/* Footer */}
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-800">
//                       <p
//                         className={`text-sm ${
//                           order.status === "Delivered"
//                             ? "text-emerald-400"
//                             : order.status === "Shipped"
//                             ? "text-blue-400"
//                             : "text-purple-400"
//                         }`}
//                       >
//                         {order.expected}
//                       </p>

//                       {order.status === "Delivered" && (
//                         <button
//                           onClick={() => handleReorder(order.storyId)}
//                           className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-all w-full sm:w-auto"
//                         >
//                           <RotateCw className="w-4 h-4" />
//                           Re-order
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </article>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// ?////////////////////////////////////////////////////////////////////////////////////////////////

import { useMemo, useState, useContext, useEffect } from "react";
import { Search, RotateCw, Package } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import api from "../../services/axiosInstance";

// Transform API data to UI format
const transformOrders = (apiOrders) => {
  return apiOrders.map((order) => {
    // Format date
    const orderDate = new Date(order.createdAt);
    const dateStr = orderDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    
    // Calculate expected delivery (example: 7 days from order date)
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const deliveryStr = deliveryDate.toLocaleDateString('en-US', {  
      weekday: 'long', 
      day: '2-digit', 
      month: 'short' 
    });
    
    // Map status
    const statusMap = {
      'pending': 'Ordered',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered'
    };
    
    // Transform all items
    const transformedItems = order.items.map(item => {
      const story = item.story;
      const pages = story.numOfPages;
      let pageRange;
      if (pages <= 5) pageRange = '3-5 Pages';
      else if (pages <= 10) pageRange = '6-10 Pages';
      else if (pages <= 15) pageRange = '11-15 Pages';
      else pageRange = '15+ Pages';
      
      return {
        storyId: story._id,
        title: story.title,
        genre: story.genres.length > 0 ? story.genres[0] : 'General',
        length: pageRange,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        image: story.coverImageUrl,
        planName: item.plan.name
      };
    });
    
    return {
      id: order._id,
      items: transformedItems,
      status: statusMap[order.status] || 'Ordered',
      totalAmount: order.amount,
      expected: order.status === 'delivered' 
        ? `Delivered on ${deliveryStr}` 
        : `Expected Delivery on ${deliveryStr}`,
      address: `${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country}`,
      date: `On ${dateStr}`,
    };
  });
};

function StatusBadge({ status }) {
  const styles = {
    Ordered: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Processing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${
        styles[status] ||
        "bg-gray-500/20 text-gray-400 border-gray-500/30"
      }`}
    >
      {status}
    </span>
  );
}

export default function OrderHistory() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All Orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { navigateTo } = useContext(AppContext);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/v1/order/myOrders");
        
        if (response.data.success) {
          const transformedOrders = transformOrders(response.data.orders);
          setOrders(transformedOrders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter = filter === "All Orders" || order.status === filter;
      const matchesQuery = !query || order.items.some(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      return matchesFilter && matchesQuery;
    });
  }, [query, filter, orders]);

  const handleReorder = (storyId) => {
    navigateTo(`/checkout/${storyId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-6">Order History</h1>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Order"
              className="w-full bg-[#1a1a1a] border border-purple-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["All Orders", "Delivered", "Processing", "Shipped", "Ordered"].map((status) => {
            const active = filter === status;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "border border-purple-600 bg-purple-600/20 text-white"
                    : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222] border border-gray-800"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Order List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {query ? "No orders match your search" : "No orders found"}
            </div>
          ) : (
            filtered.map((order) => (
              <article
                key={order.id}
                className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">Order #{order.id.slice(-8)}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <span className="text-gray-500 text-xs">{order.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">₹{order.totalAmount}</div>
                    <div className="text-xs text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-4 pb-3 last:pb-0 border-b border-gray-800/50 last:border-0"
                    >
                      {/* IMAGE */}
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-28 h-28 sm:w-20 sm:h-20 rounded object-cover"
                        />
                      </div>

                      {/* ITEM DETAILS */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-purple-400 font-semibold text-base mb-2">
                          {item.title}
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                          <div className="flex gap-2">
                            <span className="text-gray-500">Plan:</span>
                            <span className="text-gray-300">{item.planName}</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="text-gray-500">Genre:</span>
                            <span className="text-gray-300">{item.genre}</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="text-gray-500">Length:</span>
                            <span className="text-gray-300">{item.length}</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="text-gray-500">Qty:</span>
                            <span className="text-gray-300">{item.quantity}</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="text-gray-500">Unit Price:</span>
                            <span className="text-gray-300">₹{item.unitPrice}</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="text-gray-500">Subtotal:</span>
                            <span className="text-gray-300 font-semibold">₹{item.totalPrice}</span>
                          </div>
                        </div>

                        {/* Re-order button for individual item */}
                        {order.status === "Delivered" && (
                          <button
                            onClick={() => handleReorder(item.storyId)}
                            className="mt-3 flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-all border border-purple-600/30"
                          >
                            <RotateCw className="w-3 h-3" />
                            Re-order this item
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="mt-4 pt-3 border-t border-gray-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          order.status === "Delivered"
                            ? "text-emerald-400"
                            : order.status === "Shipped"
                            ? "text-blue-400"
                            : "text-purple-400"
                        }`}
                      >
                        {order.expected}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="text-gray-400">Delivery to:</span> {order.address}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}