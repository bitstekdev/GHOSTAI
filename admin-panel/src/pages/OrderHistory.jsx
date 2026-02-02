// import { useMemo, useState, useContext, useEffect } from "react";
// import { Search, RotateCw, Package } from "lucide-react";
// import { AppContext } from "../context/AppContext";
// import api from "../services/axiosInstance";

// // Transform API data to UI format
// const transformOrders = (apiOrders) => {
//   return apiOrders.map((order) => {
//     // Format date
//     const orderDate = new Date(order.createdAt);
//     const dateStr = orderDate.toLocaleDateString("en-US", {
//       weekday: "short",
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });

//     // Calculate expected delivery (example: 7 days from order date)
//     const deliveryDate = new Date(orderDate);
//     deliveryDate.setDate(deliveryDate.getDate() + 7);
//     const deliveryStr = deliveryDate.toLocaleDateString("en-US", {
//       weekday: "long",
//       day: "2-digit",
//       month: "short",
//     });

//     // Map status
//     const statusMap = {
//       pending: "Pending",
//       processing: "Processing",
//       shipped: "Shipped",
//       delivered: "Delivered",
//       failed: "Failed",
//     };

//     // Transform all items
//     const transformedItems = order.items.map((item) => {
//       const story = item.story;

//       return {
//         storyId: story._id,
//         title: story.title,
//         genre: story.genres.length > 0 ? story.genres[0] : "General",
//         length: story.numOfPages,
//         quantity: item.quantity,
//         unitPrice: item.unitPrice,
//         totalPrice: item.totalPrice,
//         image: story.coverImageUrl,
//         planName: item.plan.name,
//       };
//     });
//     const a = order.shippingAddress || {};

//     return {
//       id: order._id,
//       items: transformedItems,
//       status: statusMap[order.status] || "Pending",
//       totalAmount: order.amount,
//       expected:
//         order.status === "delivered"
//           ? `Delivered on ${deliveryStr}`
//           : `Expected Delivery on ${deliveryStr}`,
//       address: [
//         a.name,
//         a.phone,
//         a.addressLine1,
//         a.addressLine2,
//         a.city,
//         a.state,
//         a.postalCode,
//         a.country,
//       ]
//         .filter(Boolean)
//         .join(", "),
//       date: `On ${dateStr}`,
//       userName: order.user?.name || "Unknown User",
//       userEmail: order.user?.email || "",
//     };
//   });
// };

// function StatusBadge({ status }) {
//   const styles = {
//     Ordered: "bg-purple-500/20 text-purple-400 border-purple-500/30",
//     Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
//     Shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
//     Processing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
//     Failed: "bg-red-500/20 text-red-400 border-red-500/30",
//   };

//   return (
//     <span
//       className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${
//         styles[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
//       }`}>
//       {status}
//     </span>
//   );
// }

// /* ================= STORY STATUS INDICATOR ================= */

// function StoryStatusIndicator({ status, step }) {
//   const getStatusInfo = () => {
//     if (status === 'completed') {
//       return { color: 'text-emerald-400', text: 'Ready', icon: '✓' };
//     }
//     if (status === 'generating') {
//       return { color: 'text-blue-400', text: 'Generating', icon: '⏳' };
//     }
//     if (status === 'failed') {
//       return { color: 'text-red-400', text: 'Failed', icon: '✗' };
//     }
//     return { color: 'text-yellow-400', text: `Draft (${step}/4)`, icon: '⚠' };
//   };

//   const info = getStatusInfo();

//   return (
//     <span className={`text-xs ${info.color} flex items-center gap-1`}>
//       <span>{info.icon}</span>
//       <span>Story: {info.text}</span>
//     </span>
//   );
// }

// /* ================= MAIN COMPONENT ================= */

// export default function OrderHistory() {
//   const [orders, setOrders] = useState([]);
//   const [query, setQuery] = useState("");
//   const [filter, setFilter] = useState("All Orders");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [downloadingPdf, setDownloadingPdf] = useState(null);

//   /* ================= FETCH ORDERS ================= */

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const { data } = await api.get("/api/v1/orders/allOrders");

//         if (data?.success) {
//           setOrders(data.orders || []);
//         } else {
//           setError("Failed to load orders");
//         }
//       } catch (err) {
//         console.error("Error fetching orders:", err);
//         setError(err.response?.data?.message || "Failed to load orders");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   /* ================= TRANSFORM DATA ================= */

//   const transformedOrders = useMemo(() => {
//     return orders.map((order) => {
//       const item = order.items?.[0] || {};
//       const story = item.story || {};

//       const orderDate = new Date(order.createdAt);
//       const expectedDate = new Date(orderDate);
//       expectedDate.setDate(expectedDate.getDate() + 7);

//       const storyStatus = story.status || 'draft';
//       const storyStep = story.step || 1;

//       return {
//         id: order._id,
//         storyId: story?._id || null,
//         title: story?.title || "Untitled Story",
//         genre: story?.genres?.[0] || "Family",
//         pages: story?.numOfPages || 0,

//         image:
//           typeof story?.coverImageUrl === "string"
//             ? story.coverImageUrl
//             : cover,

//         quantity: item?.quantity || 1,
//         price: item?.totalPrice || order.amount,

//         rawStatus: order.status,
//         storyStatus,
//         storyStep,

//         statusLabel:
//           order.status === "completed"
//             ? "Delivered"
//             : order.status === "shipped"
//             ? "Shipped"
//             : "Processing",

//         // ✅ ALWAYS ALLOW PDF DOWNLOAD FOR ADMIN
//         canDownloadPdf: Boolean(story?._id),

//         date: `On ${orderDate.toLocaleDateString("en-GB", {
//           weekday: "short",
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         })}`,

//         expected:
//           order.status === "completed"
//             ? `Delivered on ${expectedDate.toLocaleDateString("en-GB", {
//                 weekday: "long",
//                 day: "2-digit",
//                 month: "short",
//               })}`
//             : `Expected delivery on ${expectedDate.toLocaleDateString(
//                 "en-GB",
//                 {
//                   weekday: "long",
//                   day: "2-digit",
//                   month: "short",
//                 }
//               )}`,

//         address: `${order.shippingAddress?.city || ""}, ${
//           order.shippingAddress?.state || ""
//         }, ${order.shippingAddress?.country || ""}`.replace(/^, |, $/g, ""),
//       };
//     });
//   }, [orders]);

//   /* ================= PDF DOWNLOAD ================= */

//   const handleDownloadPdf = async (storyId, title) => {
//     if (!storyId) {
//       alert("Story ID not found. Cannot generate PDF.");
//       return;
//     }

//     try {
//       setDownloadingPdf(storyId);

//       console.log(`Generating PDF for story: ${storyId}`);

//       const response = await api.post(
//         "/api/v1/pdf/generate-pdf",
//         { storyId },
//         {
//           responseType: "blob",
//           timeout: 90000, // 90 seconds for large PDFs
//         }
//       );

//       // ✅ CREATE BLOB AND DOWNLOAD
//       const blob = new Blob([response.data], { type: "application/pdf" });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");

//       a.href = url;
//       a.download = `${(title || "storybook").replace(
//         /[^a-z0-9\-_. ]/gi,
//         ""
//       )}.pdf`;

//       document.body.appendChild(a);
//       a.click();

//       setTimeout(() => {
//         document.body.removeChild(a);
//         window.URL.revokeObjectURL(url);
//       }, 100);

//       console.log("✅ PDF downloaded successfully");
//     } catch (err) {
//       console.error("PDF download error:", err);

//       let errorMessage = "Failed to download PDF";

//       if (err.response?.status === 404) {
//         errorMessage = "Story not found";
//       } else if (err.response?.data) {
//         try {
//           // Try to parse error response
//           const text = await err.response.data.text();
//           const errorData = JSON.parse(text);
//           errorMessage = errorData.error || errorData.details || errorMessage;
//         } catch {
//           errorMessage = err.message || errorMessage;
//         }
//       } else if (err.message) {
//         errorMessage = err.message;
//       }

//       alert(`PDF Download Failed: ${errorMessage}`);
//     } finally {
//       setDownloadingPdf(null);
//     }
//   };

//   /* ================= FILTER ================= */

//   const filteredOrders = useMemo(() => {
//     return transformedOrders.filter((order) => {
//       const matchStatus =
//         filter === "All Orders" || order.statusLabel === filter;
//       const matchQuery =
//         !query || order.title.toLowerCase().includes(query.toLowerCase());

//       return matchStatus && matchQuery;
//     });
//   }, [transformedOrders, filter, query]);

//   /* ================= UI STATES ================= */
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [updatingOrderId, setUpdatingOrderId] = useState(null);
//   const { backendUrl } = useContext(AppContext);

//   // Fetch orders from API
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         const response = await api.get("/api/v1/order/all-orders");

//         if (response.data.success) {
//           const transformedOrders = transformOrders(response.data.orders);
//           setOrders(transformedOrders);
//         }
//       } catch (err) {
//         console.error("Error fetching orders:", err);
//         setError("Failed to load orders. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   const filtered = useMemo(() => {
//     return orders.filter((order) => {
//       const matchesFilter = filter === "All Orders" || order.status === filter;
//       const matchesQuery =
//         !query ||
//         order.items.some((item) =>
//           item.title.toLowerCase().includes(query.toLowerCase()),
//         );
//       return matchesFilter && matchesQuery;
//     });
//   }, [query, filter, orders]);

//   // Handlers for invoice and download=========================================
//   const handleViewInvoice = (orderId) => {
//     const url = `${backendUrl}/api/v1/purchase/order/${orderId}/invoice/view`;
//     window.open(url, "_blank"); // opens PDF in new tab
//   };

//   const handleDownloadInvoice = (orderId) => {
//     const url = `${backendUrl}/api/v1/purchase/order/${orderId}/invoice/download`;
//     window.open(url); // browser download
//   };
//   // ==========================================================================

//   const handleStatusChange = async (orderId, newStatus) => {
//     const confirm = window.confirm(
//       `Are you sure you want to mark this order as "${newStatus.toUpperCase()}"?`,
//     );

//     if (!confirm) return;

//     try {
//       setUpdatingOrderId(orderId);

//       const res = await api.patch(`/api/v1/order/status/${orderId}`, {
//         status: newStatus,
//       });

//       if (res.data.success) {
//         setOrders((prev) =>
//           prev.map((order) =>
//             order.id === orderId
//               ? {
//                   ...order,
//                   status:
//                     newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
//                 }
//               : order,
//           ),
//         );
//       }
//     } catch (err) {
//       console.error("Status update failed:", err);
//       alert("Failed to update order status");
//     } finally {
//       setUpdatingOrderId(null);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
//           <p className="text-gray-400">Loading orders...</p>
//           <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-400">Loading your orders...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
//         <div className="text-center max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
//           <p className="text-gray-400 mb-4">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
//           >
//         <div className="text-center">
//           <p className="text-red-400 mb-4">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   /* ================= RENDER ================= */

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-white">
//       <div className="max-w-5xl mx-auto px-4 py-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Order History</h1>
//           <div className="text-sm text-gray-400">
//             Total Orders: {filteredOrders.length}
//           </div>
//         </div>

//         {/* SEARCH */}
//         <div className="relative mb-4">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search by story title..."
//             className="w-full bg-[#1a1a1a] border border-purple-600 rounded-lg pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         {/* Filters */}
//         <div className="flex flex-wrap gap-2 mb-6">
//           {["All Orders", "Pending", "Processing", "Shipped", "Delivered", "Failed"].map(
//             (status) => {
//               const active = filter === status;
//               return (
//                 <button
//                   key={status}
//                   onClick={() => setFilter(status)}
//                   className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
//                     active
//                       ? "border border-purple-600 bg-purple-600/20 text-white"
//                       : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222] border border-gray-800"
//                   }`}>
//                   {status}
//                 </button>
//               );
//             },
//           )}
//         </div>

//         {/* FILTER */}
//         <div className="flex gap-2 mb-6 flex-wrap">
//           {["All Orders", "Processing", "Shipped", "Delivered"].map((s) => (
//             <button
//               key={s}
//               onClick={() => setFilter(s)}
//               className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
//                 filter === s
//                   ? "bg-purple-600/20 border border-purple-600 text-white"
//                   : "bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:border-gray-700"
//               }`}
//             >
//               {s}
//             </button>
//           ))}
//         </div>

//         {/* EMPTY STATE */}
//         {filteredOrders.length === 0 && (
//           <div className="text-center py-12">
//             <p className="text-gray-500 text-lg mb-2">No orders found</p>
//             <p className="text-gray-600 text-sm">
//               {query
//                 ? "Try adjusting your search query"
//                 : "Orders will appear here"}
//             </p>
//           </div>
//         )}

//         {/* ORDERS */}
//         <div className="space-y-4">
//           {filteredOrders.map((order) => (
//             <article
//               key={order.id}
//               className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
//             >
//               <div className="flex gap-4">
//                 <img
//                   src={order.image}
//                   alt={order.title}
//                   className="w-24 h-24 rounded object-cover flex-shrink-0"
//                   onError={(e) => {
//                     e.target.src = cover;
//                   }}
//                 />

//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between items-start gap-2 mb-1">
//                     <div>
//                       <h3 className="text-purple-400 font-semibold truncate">
//                         {order.title}
//                       </h3>
//                       <StoryStatusIndicator
//                         status={order.storyStatus}
//                         step={order.storyStep}
//                       />
//                     </div>
//                     <StatusBadge status={order.rawStatus} />
//                   </div>

//                   <p className="text-xs text-gray-500 mb-2">{order.date}</p>

//                   <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
//                     <div>Genre: {order.genre}</div>
//                     <div>Pages: {order.pages}</div>
//                     <div>Quantity: {order.quantity}</div>
//                     <div>Price: ₹{order.price}</div>
//                   </div>

//                   {order.address && (
//                     <p className="text-xs text-gray-400 mt-2 truncate">
//                       📍 {order.address}
//                     </p>
//                   )}

//                   <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-800 gap-2">
//                     <p className="text-sm text-purple-400 truncate">
//                       {order.expected}
//                     </p>

//                     <button
//                       disabled={
//                         !order.canDownloadPdf ||
//                         downloadingPdf === order.storyId
//                       }
//                       onClick={() =>
//                         handleDownloadPdf(order.storyId, order.title)
//                       }
//                       className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 flex-shrink-0 transition-colors ${
//                         !order.canDownloadPdf
//                           ? "bg-gray-700 cursor-not-allowed opacity-50"
//                           : downloadingPdf === order.storyId
//                           ? "bg-purple-600 cursor-wait"
//                           : "bg-emerald-600 hover:bg-emerald-700"
//                       }`}
//                     >
//                       {downloadingPdf === order.storyId ? (
//                         <>
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                           Generating...
//                         </>
//                       ) : (
//                         <>
//                           <Download className="w-4 h-4" />
//                           Download PDF
//                         </>
//                       )}
//                     </button>
//           {filtered.length === 0 ? (
//             <div className="text-center py-10 text-gray-500">
//               {query ? "No orders match your search" : "No orders found"}
//             </div>
//           ) : (
//             filtered.map((order) => (
//               <article
//                 key={order.id}
//                 className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
//                 {/* Order Header */}
//                 <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
//                   <div className="flex items-center gap-3">
//                     <Package className="w-5 h-5 text-purple-400" />
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <span className="text-white font-semibold">
//                           Order #{order.id.slice(-8)}
//                         </span>
//                         <StatusBadge status={order.status} />
//                       </div>
//                       <span className="text-gray-500 text-xs">
//                         {order.date}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-white font-bold">
//                       ₹{order.totalAmount}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {order.items.length} item
//                       {order.items.length > 1 ? "s" : ""}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Order Items */}
//                 <div className="space-y-3">
//                   {order.items.map((item, index) => (
//                     <div
//                       key={index}
//                       className="flex flex-col sm:flex-row gap-4 pb-3 last:pb-0 border-b border-gray-800/50 last:border-0">
//                       {/* IMAGE */}
//                       <div className="flex-shrink-0 mx-auto sm:mx-0">
//                         <img
//                           src={item.image}
//                           alt={item.title}
//                           className="w-28 h-28 sm:w-20 sm:h-20 rounded object-cover"
//                         />
//                       </div>

//                       {/* ITEM DETAILS */}
//                       <div className="flex-1 min-w-0">
//                         <h3 className="text-purple-400 font-semibold text-base mb-2">
//                           {item.title}
//                         </h3>

//                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
//                           <div className="flex gap-2">
//                             <span className="text-gray-500">Plan:</span>
//                             <span className="text-gray-300">
//                               {item.planName}
//                             </span>
//                           </div>

//                           <div className="flex gap-2">
//                             <span className="text-gray-500">Genre:</span>
//                             <span className="text-gray-300">{item.genre}</span>
//                           </div>

//                           <div className="flex gap-2">
//                             <span className="text-gray-500">Length:</span>
//                             <span className="text-gray-300">{item.length} Pages (per book)</span>
//                           </div>

//                           <div className="flex gap-2">
//                             <span className="text-gray-500">Qty:</span>
//                             <span className="text-gray-300">
//                               {item.quantity}
//                             </span>
//                           </div>

//                           <div className="flex gap-2">
//                             <span className="text-gray-500">Unit Price:</span>
//                             <span className="text-gray-300">
//                               ₹{item.unitPrice}
//                             </span>
//                           </div>

//                           <div className="flex gap-2">
//                             <span className="text-gray-500">Subtotal:</span>
//                             <span className="text-gray-300 font-semibold">
//                               ₹{item.totalPrice}
//                             </span>
//                           </div>
//                         </div>

//                         {/* PDF DOWNLOAD button for individual item */}
//                         {/* ACTION BUTTONS -------------------------------*/}
//                         <div className="mt-3 flex flex-wrap justify-end gap-3">
//                           <button
//                             onClick={() => handleDownload(item)}
//                             className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
//                                       bg-blue-600/20 text-blue-400 border border-blue-600/30
//                                       rounded-lg hover:bg-blue-600/30 transition">
//                             ⬇ Download PDF
//                           </button>
//                         </div>
//                         {/* -------------------------------------------------- */}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Order Footer */}
//                 <div className="mt-4 pt-3 border-t border-gray-800">
//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                     <div>
//                       <p
//                         className={`text-sm font-medium ${
//                           order.status === "Delivered"
//                             ? "text-emerald-400"
//                             : order.status === "Shipped"
//                               ? "text-blue-400"
//                               : "text-purple-400"
//                         }`}>
//                         {order.expected}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         <span className="text-gray-400">User:</span>{" "}
//                         <span className="text-white">{order.userName}</span>
//                       </p>

//                       <p className="text-xs text-gray-500 mt-1">
//                         <span className="text-gray-400">Email:</span>{" "}
//                         <span className="text-gray-300">{order.userEmail}</span>
//                       </p>

//                       <p className="text-xs text-gray-500 mt-1">
//                         <span className="text-gray-400">Delivery to:</span>{" "}
//                         {order.address}
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       <select
//                         value={order.status.toLowerCase() === "pending" ? "ordered" : order.status.toLowerCase()}
//                         disabled={updatingOrderId === order.id}
//                         onChange={(e) =>
//                           handleStatusChange(order.id, e.target.value)
//                         }
//                         className="bg-[#1a1a1a] border border-purple-600/30 text-sm
//                           text-purple-400 rounded-lg px-3 py-1.5
//                           focus:outline-none focus:border-purple-500
//                           disabled:opacity-50">
//                         <option value="pending">Pending</option>    
//                         <option value="processing">Processing</option>
//                         <option value="shipped">Shipped</option>
//                         <option value="delivered">Delivered</option>
//                         <option value="failed">Failed</option>
//                       </select>

//                       <div className="inline-flex rounded-lg overflow-hidden border border-purple-600/30">
//                         {/* VIEW */}
//                         <button
//                           onClick={() => handleViewInvoice(order.id)}
//                           className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
//                                           bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition"
//                           title="View Invoice">
//                           Invoice
//                           <div className="w-px bg-purple-600/30" />
//                           👁
//                         </button>

//                         {/* DIVIDER */}
//                         <div className="w-px bg-purple-600/30" />

//                         {/* DOWNLOAD */}
//                         <button
//                           onClick={() => handleDownloadInvoice(order.id)}
//                           className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
//                                           bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition"
//                           title="Download Invoice">
//                           ⬇
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </article>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useMemo, useState, useContext, useEffect } from "react";
import { Search, Package, Loader2, Download, AlertCircle } from "lucide-react";
import { AppContext } from "../context/AppContext";
import api from "../services/axiosInstance";

// Placeholder image for missing covers
const cover = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23333' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Processing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Failed: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${
        styles[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
      }`}
    >
      {status}
    </span>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All Orders");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const { backendUrl } = useContext(AppContext);

  /* ================= FETCH ORDERS ================= */

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/api/v1/order/all-orders");

        if (response.data?.success) {
          setOrders(response.data.orders || []);
        } else {
          setError("Failed to load orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ================= TRANSFORM DATA ================= */

  const transformedOrders = useMemo(() => {
    return orders.map((order) => {
      // Format date
      const orderDate = new Date(order.createdAt);
      const dateStr = orderDate.toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // Calculate expected delivery (7 days from order date)
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + 7);
      const deliveryStr = deliveryDate.toLocaleDateString("en-US", {
        weekday: "long",
        day: "2-digit",
        month: "short",
      });

      // Map status
      const statusMap = {
        pending: "Pending",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        failed: "Failed",
      };

      // Transform items
      const transformedItems = (order.items || []).map((item) => {
        const story = item.story || {};

        return {
          storyId: story._id,
          title: story.title || "Untitled Story",
          genre: story.genres?.length > 0 ? story.genres[0] : "General",
          length: story.numOfPages || 0,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || 0,
          image: story.coverImageUrl || cover,
          planName: item.plan?.name || "Standard",
        };
      });

      // Get shipping address
      const a = order.shippingAddress || {};
      const address = [
        a.name,
        a.phone,
        a.addressLine1,
        a.addressLine2,
        a.city,
        a.state,
        a.postalCode,
        a.country,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        id: order._id,
        items: transformedItems,
        status: statusMap[order.status] || "Pending",
        totalAmount: order.amount || 0,
        expected:
          order.status === "delivered"
            ? `Delivered on ${deliveryStr}`
            : `Expected Delivery on ${deliveryStr}`,
        address: address,
        date: `On ${dateStr}`,
        userName: order.user?.name || "Unknown User",
        userEmail: order.user?.email || "",
      };
    });
  }, [orders]);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return transformedOrders.filter((order) => {
      const matchesFilter = filter === "All Orders" || order.status === filter;
      const matchesQuery =
        !query ||
        order.items.some((item) =>
          item.title.toLowerCase().includes(query.toLowerCase())
        );
      return matchesFilter && matchesQuery;
    });
  }, [query, filter, transformedOrders]);

  /* ================= HANDLERS ================= */

  const handleViewInvoice = (orderId) => {
    const url = `${backendUrl}/api/v1/purchase/order/${orderId}/invoice/view`;
    window.open(url, "_blank");
  };

  const handleDownloadInvoice = (orderId) => {
    const url = `${backendUrl}/api/v1/purchase/order/${orderId}/invoice/download`;
    window.open(url);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const confirmChange = window.confirm(
      `Are you sure you want to mark this order as "${newStatus.toUpperCase()}"?`
    );

    if (!confirmChange) return;

    try {
      setUpdatingOrderId(orderId);

      const res = await api.patch(`/api/v1/order/status/${orderId}`, {
        status: newStatus,
      });

      if (res.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /* ================= LOADING STATE ================= */

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

  /* ================= ERROR STATE ================= */

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
          <p className="text-gray-400 mb-4">{error}</p>
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

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order History</h1>
          <div className="text-sm text-gray-400">
            Total Orders: {filtered.length}
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by story title..."
            className="w-full bg-[#1a1a1a] border border-purple-600 rounded-lg pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            "All Orders",
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Failed",
          ].map((status) => {
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

        {/* EMPTY STATE */}
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {query ? "No orders match your search" : "No orders found"}
          </div>
        ) : (
          /* ORDERS LIST */
          <div className="space-y-4">
            {filtered.map((order) => (
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
                        <span className="text-white font-semibold">
                          Order #{order.id.slice(-8)}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <span className="text-gray-500 text-xs">
                        {order.date}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      ₹{order.totalAmount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </div>
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
                          onError={(e) => {
                            e.target.src = cover;
                          }}
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
                            <span className="text-gray-300">
                              {item.planName}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <span className="text-gray-500">Genre:</span>
                            <span className="text-gray-300">{item.genre}</span>
                          </div>

                          <div className="flex gap-2">
                            <span className="text-gray-500">Length:</span>
                            <span className="text-gray-300">
                              {item.length} Pages (per book)
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <span className="text-gray-500">Qty:</span>
                            <span className="text-gray-300">
                              {item.quantity}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <span className="text-gray-500">Unit Price:</span>
                            <span className="text-gray-300">
                              ₹{item.unitPrice}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <span className="text-gray-500">Subtotal:</span>
                            <span className="text-gray-300 font-semibold">
                              ₹{item.totalPrice}
                            </span>
                          </div>
                        </div>
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
                        <span className="text-gray-400">User:</span>{" "}
                        <span className="text-white">{order.userName}</span>
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        <span className="text-gray-400">Email:</span>{" "}
                        <span className="text-gray-300">{order.userEmail}</span>
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        <span className="text-gray-400">Delivery to:</span>{" "}
                        {order.address}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <select
                        value={
                          order.status.toLowerCase() === "pending"
                            ? "pending"
                            : order.status.toLowerCase()
                        }
                        disabled={updatingOrderId === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="bg-[#1a1a1a] border border-purple-600/30 text-sm
                          text-purple-400 rounded-lg px-3 py-1.5
                          focus:outline-none focus:border-purple-500
                          disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="failed">Failed</option>
                      </select>

                      <div className="inline-flex rounded-lg overflow-hidden border border-purple-600/30">
                        {/* VIEW INVOICE */}
                        <button
                          onClick={() => handleViewInvoice(order.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                            bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition"
                          title="View Invoice"
                        >
                          Invoice
                          <div className="w-px bg-purple-600/30" />
                          👁
                        </button>

                        {/* DIVIDER */}
                        <div className="w-px bg-purple-600/30" />

                        {/* DOWNLOAD INVOICE */}
                        <button
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                            bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition"
                          title="Download Invoice"
                        >
                          ⬇
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}