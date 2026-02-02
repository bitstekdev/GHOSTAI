import { useEffect, useMemo, useState } from "react";
import { Search, Download, Loader2, AlertCircle } from "lucide-react";
import cover from "../assets/coverpage.png";
import api from "../services/axiosInstance";

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    processing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${
        styles[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
      }`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

/* ================= STORY STATUS INDICATOR ================= */

function StoryStatusIndicator({ status, step }) {
  const getStatusInfo = () => {
    if (status === 'completed') {
      return { color: 'text-emerald-400', text: 'Ready', icon: '✓' };
    }
    if (status === 'generating') {
      return { color: 'text-blue-400', text: 'Generating', icon: '⏳' };
    }
    if (status === 'failed') {
      return { color: 'text-red-400', text: 'Failed', icon: '✗' };
    }
    return { color: 'text-yellow-400', text: `Draft (${step}/4)`, icon: '⚠' };
  };

  const info = getStatusInfo();

  return (
    <span className={`text-xs ${info.color} flex items-center gap-1`}>
      <span>{info.icon}</span>
      <span>Story: {info.text}</span>
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
  const [downloadingPdf, setDownloadingPdf] = useState(null);

  /* ================= FETCH ORDERS ================= */

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await api.get("/api/v1/orders/allOrders");

        if (data?.success) {
          setOrders(data.orders || []);
        } else {
          setError("Failed to load orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ================= TRANSFORM DATA ================= */

  const transformedOrders = useMemo(() => {
    return orders.map((order) => {
      const item = order.items?.[0] || {};
      const story = item.story || {};

      const orderDate = new Date(order.createdAt);
      const expectedDate = new Date(orderDate);
      expectedDate.setDate(expectedDate.getDate() + 7);

      const storyStatus = story.status || 'draft';
      const storyStep = story.step || 1;

      return {
        id: order._id,
        storyId: story?._id || null,
        title: story?.title || "Untitled Story",
        genre: story?.genres?.[0] || "Family",
        pages: story?.numOfPages || 0,

        image:
          typeof story?.coverImageUrl === "string"
            ? story.coverImageUrl
            : cover,

        quantity: item?.quantity || 1,
        price: item?.totalPrice || order.amount,

        rawStatus: order.status,
        storyStatus,
        storyStep,

        statusLabel:
          order.status === "completed"
            ? "Delivered"
            : order.status === "shipped"
            ? "Shipped"
            : "Processing",

        // ✅ ALWAYS ALLOW PDF DOWNLOAD FOR ADMIN
        canDownloadPdf: Boolean(story?._id),

        date: `On ${orderDate.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`,

        expected:
          order.status === "completed"
            ? `Delivered on ${expectedDate.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "short",
              })}`
            : `Expected delivery on ${expectedDate.toLocaleDateString(
                "en-GB",
                {
                  weekday: "long",
                  day: "2-digit",
                  month: "short",
                }
              )}`,

        address: `${order.shippingAddress?.city || ""}, ${
          order.shippingAddress?.state || ""
        }, ${order.shippingAddress?.country || ""}`.replace(/^, |, $/g, ""),
      };
    });
  }, [orders]);

  /* ================= PDF DOWNLOAD ================= */

  const handleDownloadPdf = async (storyId, title) => {
    if (!storyId) {
      alert("Story ID not found. Cannot generate PDF.");
      return;
    }

    try {
      setDownloadingPdf(storyId);

      console.log(`Generating PDF for story: ${storyId}`);

      const response = await api.post(
        "/api/v1/pdf/generate-pdf",
        { storyId },
        {
          responseType: "blob",
          timeout: 90000, // 90 seconds for large PDFs
        }
      );

      // ✅ CREATE BLOB AND DOWNLOAD
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `${(title || "storybook").replace(
        /[^a-z0-9\-_. ]/gi,
        ""
      )}.pdf`;

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log("✅ PDF downloaded successfully");
    } catch (err) {
      console.error("PDF download error:", err);

      let errorMessage = "Failed to download PDF";

      if (err.response?.status === 404) {
        errorMessage = "Story not found";
      } else if (err.response?.data) {
        try {
          // Try to parse error response
          const text = await err.response.data.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          errorMessage = err.message || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(`PDF Download Failed: ${errorMessage}`);
    } finally {
      setDownloadingPdf(null);
    }
  };

  /* ================= FILTER ================= */

  const filteredOrders = useMemo(() => {
    return transformedOrders.filter((order) => {
      const matchStatus =
        filter === "All Orders" || order.statusLabel === filter;
      const matchQuery =
        !query || order.title.toLowerCase().includes(query.toLowerCase());

      return matchStatus && matchQuery;
    });
  }, [transformedOrders, filter, query]);

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order History</h1>
          <div className="text-sm text-gray-400">
            Total Orders: {filteredOrders.length}
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

        {/* FILTER */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["All Orders", "Processing", "Shipped", "Delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                filter === s
                  ? "bg-purple-600/20 border border-purple-600 text-white"
                  : "bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No orders found</p>
            <p className="text-gray-600 text-sm">
              {query
                ? "Try adjusting your search query"
                : "Orders will appear here"}
            </p>
          </div>
        )}

        {/* ORDERS */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <article
              key={order.id}
              className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex gap-4">
                <img
                  src={order.image}
                  alt={order.title}
                  className="w-24 h-24 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src = cover;
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div>
                      <h3 className="text-purple-400 font-semibold truncate">
                        {order.title}
                      </h3>
                      <StoryStatusIndicator
                        status={order.storyStatus}
                        step={order.storyStep}
                      />
                    </div>
                    <StatusBadge status={order.rawStatus} />
                  </div>

                  <p className="text-xs text-gray-500 mb-2">{order.date}</p>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <div>Genre: {order.genre}</div>
                    <div>Pages: {order.pages}</div>
                    <div>Quantity: {order.quantity}</div>
                    <div>Price: ₹{order.price}</div>
                  </div>

                  {order.address && (
                    <p className="text-xs text-gray-400 mt-2 truncate">
                      📍 {order.address}
                    </p>
                  )}

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-800 gap-2">
                    <p className="text-sm text-purple-400 truncate">
                      {order.expected}
                    </p>

                    <button
                      disabled={
                        !order.canDownloadPdf ||
                        downloadingPdf === order.storyId
                      }
                      onClick={() =>
                        handleDownloadPdf(order.storyId, order.title)
                      }
                      className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 flex-shrink-0 transition-colors ${
                        !order.canDownloadPdf
                          ? "bg-gray-700 cursor-not-allowed opacity-50"
                          : downloadingPdf === order.storyId
                          ? "bg-purple-600 cursor-wait"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {downloadingPdf === order.storyId ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download PDF
                        </>
                      )}
                    </button>
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