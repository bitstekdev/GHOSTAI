import { useMemo, useState, useContext, useEffect } from "react";
import { Search, RotateCw, Package } from "lucide-react";
import { AppContext } from "../context/AppContext";
import api from "../services/axiosInstance";

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
    const a = order.shippingAddress || {};
    
    return {
      id: order._id,
      items: transformedItems,
      status: statusMap[order.status] || 'Ordered',
      totalAmount: order.amount,
      expected: order.status === 'delivered' 
        ? `Delivered on ${deliveryStr}` 
        : `Expected Delivery on ${deliveryStr}`,
      address: [a.name,a.phone,a.addressLine1,a.addressLine2,a.city,a.state,a.postalCode,a.country].filter(Boolean).join(", "),
      date: `On ${dateStr}`,
      userName: order.user?.name || "Unknown User",
      userEmail: order.user?.email || ""
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
  const { backendUrl } = useContext(AppContext);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/v1/order/all-orders");
        
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

  // Handlers for invoice and download=========================================
const handleViewInvoice = (orderId) => {
  const url = `${backendUrl}/api/v1/purchase/order/${orderId}/invoice/view`;
  window.open(url, "_blank"); // opens PDF in new tab
};

const handleDownloadInvoice = (orderId) => {
  const url = `${backendUrl}/api/v1/purchase/order/${orderId}/invoice/download`;
  window.open(url); // browser download
};
// ==========================================================================


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

                        {/* PDF DOWNLOAD button for individual item */}
                        {/* ACTION BUTTONS -------------------------------*/}
                        <div className="mt-3 flex flex-wrap justify-end gap-3">
                          <button
                            onClick={() => handleDownload(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                      bg-blue-600/20 text-blue-400 border border-blue-600/30
                                      rounded-lg hover:bg-blue-600/30 transition"
                          >
                            📥 Download PDF
                          </button>

                            <div className="inline-flex rounded-lg overflow-hidden border border-purple-600/30">
                              {/* VIEW */}
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

                              {/* DOWNLOAD */}
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
{/* -------------------------------------------------- */}
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