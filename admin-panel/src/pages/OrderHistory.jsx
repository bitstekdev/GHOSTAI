
import { useMemo, useState, useEffect } from "react";
import { Search, RotateCw } from "lucide-react";
import cover from "../assets/coverpage.png";
import api from "../services/axiosInstance";

/* ---------------- STATUS BADGE ---------------- */

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    processing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${
        styles[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function OrderHistory() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All Orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -------- FETCH ORDERS -------- */

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/orders/allOrders");
      if (data?.success) setOrders(data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* -------- TRANSFORM API → UI MODEL -------- */

  const transformedOrders = useMemo(() => {
    return orders.map((order) => {
      const item = order.items?.[0] || {};
      const story = item.story || {};

      /* Date formatting */
      const orderDate = new Date(order.createdAt);
      const dateStr = orderDate.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const expectedDate = new Date(orderDate);
      expectedDate.setDate(expectedDate.getDate() + 7);
      const expectedStr = expectedDate.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "short",
      });

      /* Status text */
      const statusText =
        order.status === "completed"
          ? "Delivered"
          : order.status === "shipped"
          ? "Shipped"
          : "Processing";

      return {
        id: order._id,

        /* STORY */
        title: story.title || "Untitled Story",
        genre: story.genres?.[0] || "Family",
        pages: story.numOfPages || 0,

        /* IMAGE (✅ FIXED) */
        image:
          typeof story.coverImageUrl === "string"
            ? story.coverImageUrl
            : cover,

        /* ORDER */
        quantity: item.quantity || 1,
        price: item.totalPrice || order.amount,
        rawStatus: order.status,
        status: statusText,

        /* META */
        date: `On ${dateStr}`,
        expected:
          order.status === "completed"
            ? `Delivered on ${expectedStr}`
            : `Expected delivery on ${expectedStr}`,

        address: `${order.shippingAddress?.city}, ${order.shippingAddress?.state}, ${order.shippingAddress?.country}`,
      };
    });
  }, [orders]);

  /* -------- FILTERING -------- */

  const filteredOrders = useMemo(() => {
    return transformedOrders.filter((order) => {
      const matchesStatus =
        filter === "All Orders" || order.status === filter;
      const matchesQuery =
        !query ||
        order.title.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [filter, query, transformedOrders]);

  /* -------- UI STATES -------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-red-500 flex items-center justify-center">
        {error}
      </div>
    );
  }

  /* -------- RENDER -------- */

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>

        {/* SEARCH */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order"
            className="w-full bg-[#1a1a1a] border border-purple-600 rounded-lg pl-10 py-2 text-sm"
          />
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 mb-6">
          {["All Orders", "Delivered", "Processing", "Shipped"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm ${
                filter === s
                  ? "bg-purple-600/20 border border-purple-600"
                  : "bg-[#1a1a1a] border border-gray-800 text-gray-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* ORDERS */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <article
              key={order.id}
              className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800"
            >
              <div className="flex gap-4">
                <img
                  src={order.image}
                  alt={order.title}
                  className="w-24 h-24 rounded object-cover"
                />

                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h3 className="text-purple-400 font-semibold truncate">
                      {order.title}
                    </h3>
                    <StatusBadge status={order.rawStatus} />
                  </div>

                  <p className="text-xs text-gray-500 mb-2">{order.date}</p>

                  <div className="text-sm text-gray-300 grid grid-cols-2 gap-2">
                    <div>Genre: {order.genre}</div>
                    <div>Pages: {order.pages}</div>
                    <div>Quantity: {order.quantity}</div>
                    <div>Price: ₹{order.price}</div>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    {order.address}
                  </p>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-800">
                    <p className="text-sm text-purple-400">
                      {order.expected}
                    </p>

                    {order.status === "Delivered" && (
                      <button className="flex items-center gap-1 bg-purple-600 px-3 py-1.5 rounded text-sm">
                        <RotateCw className="w-4 h-4" />
                        Re-order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
