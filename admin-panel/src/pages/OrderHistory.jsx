import { useMemo, useState } from "react";
import { Search, RotateCw } from "lucide-react";
import cover from "../assets/coverpage.png";

const sampleOrders = [
  {
    id: 1,
    title: "Rainbow Adventure",
    status: "Ordered",
    genre: "Family",
    length: "3-5 Pages",
    quantity: 2,
    price: 200,
    expected: "Expected Delivery on Sunday 09 Nov",
    address:
      "Greenland Colony, Madhava Reddy Colony, Gachibowli, Hyderabad, Telangana 500032",
    date: "On Mon, 03 Nov 2025",
    image: cover,
  },
  {
    id: 2,
    title: "Sunday Surprise",
    status: "Delivered",
    genre: "Family",
    length: "3-5 Pages",
    quantity: 2,
    price: 200,
    expected: "Delivered on Thursday 06 Nov",
    address:
      "Greenland Colony, Madhava Reddy Colony, Gachibowli, Hyderabad, Telangana 500032",
    date: "On Mon, 03 Nov 2025",
    image: cover,
  },
  {
    id: 3,
    title: "Forest of Wonders",
    status: "Shipped",
    genre: "Family",
    length: "3-5 Pages",
    quantity: 1,
    price: 200,
    expected: "Delivered on Thursday 06 Nov",
    address:
      "Greenland Colony, Madhava Reddy Colony, Gachibowli, Hyderabad, Telangana 500032",
    date: "On Mon, 03 Nov 2025",
    image: cover,
  },
];

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

  const filtered = useMemo(() => {
    return sampleOrders.filter((order) => {
      const matchesFilter = filter === "All Orders" || order.status === filter;
      const matchesQuery =
        !query || order.title.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  const handleReorder = (id) => console.log("Reorder:", id);

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
          {["All Orders", "Delivered", "Processing", "Shipped"].map((status) => {
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
              No orders found
            </div>
          ) : (
            filtered.map((order) => (
              <article
                key={order.id}
                className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* IMAGE */}
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <img
                      src={order.image}
                      alt={order.title}
                      className="w-28 h-28 sm:w-20 sm:h-20 rounded object-cover"
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 min-w-0">
                    {/* Title + Status + Date */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-purple-400 font-semibold text-base truncate">
                          {order.title}
                        </h3>
                        <StatusBadge status={order.status} />
                      </div>
                      <span className="text-gray-500 text-xs sm:whitespace-nowrap">
                        {order.date}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex gap-2">
                        <span className="text-gray-500">Genre:</span>
                        <span className="text-gray-300">{order.genre}</span>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-gray-500">Story Length:</span>
                        <span className="text-gray-300">{order.length}</span>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-gray-500">Quantity:</span>
                        <span className="text-gray-300">{order.quantity}</span>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-gray-500">Price:</span>
                        <span className="text-gray-300">
                          ₹{order.price}.0
                        </span>
                      </div>

                      {/* Address - FULL WIDTH MOBILE */}
                      <div className="sm:col-span-2 text-xs text-gray-300 leading-relaxed mt-2">
                        <div className="text-gray-500 mb-1">
                          Delivery Address
                        </div>
                        {order.address}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-800">
                      <p
                        className={`text-sm ${
                          order.status === "Delivered"
                            ? "text-emerald-400"
                            : order.status === "Shipped"
                            ? "text-blue-400"
                            : "text-purple-400"
                        }`}
                      >
                        {order.expected}
                      </p>

                      {order.status === "Delivered" && (
                        <button
                          onClick={() => handleReorder(order.id)}
                          className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-all w-full sm:w-auto"
                        >
                          <RotateCw className="w-4 h-4" />
                          Re-order
                        </button>
                      )}
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
