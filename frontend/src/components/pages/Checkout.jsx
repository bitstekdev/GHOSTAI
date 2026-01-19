import React, { useEffect, useState } from "react";
import {
  CreditCard,
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Package,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import api from "../../services/axiosInstance";
import { useCart } from "../../context/CartContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const Checkout = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, totalPrice, clearCart } = useCart();

  // Determine checkout mode: 'single' or 'cart'
  const checkoutMode = storyId ? "single" : "cart";

  /* ------------------ SINGLE ORDER STATE ------------------ */
  const [story, setStory] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [quantity, setQuantity] = useState(1);

  /* ------------------ ADDRESS STATE ------------------ */
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    houseNumber: "",
    streetName: "",
    city: "",
    state: "",
    zipCode: "",
  });

  /* ------------------ LOADING & PAYMENT ------------------ */
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  /* ------------------ FETCH STORY & PLANS (Single Mode) ------------------ */
  useEffect(() => {
    if (checkoutMode === "single" && storyId) {
      const fetchStoryAndPlans = async () => {
        try {
          setLoading(true);
          const [storyRes, plansRes] = await Promise.all([
            api.get(`/api/v1/story/${storyId}`),
            api.get("/api/v1/subscriptions/plans/byShowOnContext?context=purchase"),
          ]);

          const storyData = storyRes.data.story || storyRes.data.data || storyRes.data.result;
          setStory(storyData.story || storyData);
          setPlans(plansRes.data.plans || []);
          
          // Auto-select first plan
          if (plansRes.data.plans?.length > 0) {
            setSelectedPlan(plansRes.data.plans[0]);
          }
        } catch (err) {
          console.error("Error fetching story/plans:", err);
          alert("Failed to load story details");
        } finally {
          setLoading(false);
        }
      };

      fetchStoryAndPlans();
    }
  }, [checkoutMode, storyId]);

  /* ------------------ FETCH ADDRESSES ------------------ */
  useEffect(() => {
    api
      .get("/api/v1/address")
      .then((res) => {
        setAddresses(res.data.data || []);
      })
      .catch((err) => {
        console.error("Error fetching addresses:", err);
      });
  }, []);

  /* ------------------ ADDRESS SELECT ------------------ */
  const handleAddressSelect = (address) => {
    if (selectedAddressId === address._id) {
      setSelectedAddressId(null);
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        houseNumber: "",
        streetName: "",
        city: "",
        state: "",
        zipCode: "",
      });
      return;
    }

    setSelectedAddressId(address._id);
    setFormData({
      fullName: address.fullName || "",
      email: address.email || "",
      phoneNumber: address.phoneNumber || "",
      houseNumber: address.houseNumber || "",
      streetName: address.streetName || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
    });
  };

  /* ------------------ CALCULATE TOTAL ------------------ */
  const calculateTotal = () => {
    if (checkoutMode === "single" && selectedPlan) {
      return selectedPlan.price * quantity;
    }
    return totalPrice;
  };

  /* ------------------ RAZORPAY PAYMENT ------------------ */
  const initiatePayment = async () => {

    // Validate address
    const { fullName, email, phoneNumber, houseNumber, streetName, city, state, zipCode } = formData;
    
    if (!fullName || !email || !phoneNumber || !houseNumber || !streetName || !city || !state || !zipCode) {
      alert("Please fill in all address fields");
      return;
    }
    

    // Validate plan for single mode
    if (checkoutMode === "single" && !selectedPlan) {
      alert("Please select a plan");
      return;
    }

    try {
      setProcessingPayment(true);

      let orderResponse;
      
      // Call different API based on checkout mode
      if (checkoutMode === "single") {
        orderResponse = await api.post("/api/v1/purchase/order/single", {
          storyId: story._id || story.story._id,
          planId: selectedPlan._id,
          quantity,
          shippingAddress: formData,
        });
      } else {
        orderResponse = await api.post("/api/v1/purchase/order/cart", {
          shippingAddress: formData,
        });
      }

      const { razorpayOrder, orderId } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Ghostverse.ai",
        description: checkoutMode === "single" ? "Story Purchase" : "Cart Purchase",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post("/api/v1/order/verify", {
              orderId: razorpayOrder.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              // Clear cart if cart checkout
              if (checkoutMode === "cart") {
                clearCart();
              }
              
              // Navigate to success page
              navigate("/payment-success", {
                state: {
                  orderId,
                  amount: razorpayOrder.amount / 100,
                  mode: checkoutMode,
                },
              });
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phoneNumber,
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

            if (!window.Razorpay) {
              alert("Payment SDK not loaded");
              setProcessingPayment(false);
              return;
            }


      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert("Payment failed. Please try again.");
        setProcessingPayment(false);
      });
      
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert(err.response?.data?.message || "Payment initialization failed");
      setProcessingPayment(false);
    }
  };

  /* ------------------ STYLES ------------------ */
  const inputClasses =
    "w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-gray-600";

  const labelClasses =
    "text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ---------------- LEFT ---------------- */}
        <div className="lg:col-span-2">
          <button
            onClick={() => navigate(checkoutMode === "single" ? -1 : "/cart")}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft size={20} /> Back
          </button>

          {/* PLAN SELECTION (Single Mode Only) */}
          {checkoutMode === "single" && story && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4">Select Your Plan</h2>
              
              {/* Story Preview */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6 flex gap-4">
                <img
                  src={story.coverImage?.s3Url}
                  alt={story.title}
                  className={`rounded-xl object-cover border border-gray-700 ${
                    story.orientation === "Landscape"
                      ? "w-32 h-24"
                      : story.orientation === "Portrait"
                      ? "w-24 h-32"
                      : "w-28 h-28"
                  }`}
                />
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {story.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {story.numOfPages} pages • {story.orientation}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {story.genre}
                  </p>
                </div>
              </div>

              {/* Plans Grid - Similar to AddToCartPage */}
              {plans.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No plans available</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {plans.map((plan) => (
                    <div
                      key={plan._id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`cursor-pointer border rounded-2xl p-5 transition-all ${
                        selectedPlan?._id === plan._id
                          ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                          : "border-gray-800 bg-gray-900/50 hover:border-gray-600"
                      }`}
                    >
                      {/* Plan Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-1">
                            {plan.name}
                          </h3>
                          <p className="text-3xl font-bold text-purple-400">
                            ₹{plan.price}
                          </p>
                        </div>
                        {selectedPlan?._id === plan._id && (
                          <div className="bg-purple-500 rounded-full p-1.5">
                            <Check size={16} className="text-white" />
                          </div>
                        )}
                      </div>

                      {/* Plan Description */}
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {plan.description}
                      </p>

                      {/* Plan Features */}
                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-1.5">
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                              <span className="text-purple-400 mt-0.5">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-xs text-purple-400">
                              +{plan.features.length - 3} more features
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
                <label className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Package size={18} className="text-purple-400" />
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-full border-2 border-gray-700 hover:border-purple-500 text-white flex items-center justify-center transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-white font-bold text-2xl min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-full border-2 border-gray-700 hover:border-purple-500 text-white flex items-center justify-center transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CART PREVIEW (Cart Mode Only) */}
          {checkoutMode === "cart" && cart.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4">Your Items</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="min-w-[140px] bg-gray-900/60 border border-gray-800 rounded-xl p-3"
                  >
                    <img
                      src={item.storyId.coverImage?.s3Url}
                      alt={item.storyId.title}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <p className="text-sm font-semibold text-white truncate">
                      {item.storyId.title}
                    </p>
                    <p className="text-xs text-purple-400">
                      {item.planId.name} • Qty {item.quantity}
                    </p>
                    <p className="text-xs text-gray-400">
                      • per book {item.planId.price} INR 
                    </p>
                    <p className="text-xs text-gray-400">
                      • total {item.planId.price * item.quantity} INR
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SAVED ADDRESSES */}
          {addresses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4">
                Saved Addresses
              </h2>

              <div className="grid gap-4">
                {addresses.map((address) => {
                  const selected = selectedAddressId === address._id;

                  return (
                    <div
                      key={address._id}
                      onClick={() => handleAddressSelect(address)}
                      className={`cursor-pointer border rounded-xl p-4 transition-all
                        ${
                          selected
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-gray-800 bg-gray-900/50 hover:border-gray-600"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={18}
                          className={selected ? "text-purple-400" : "text-gray-400"}
                        />
                        <div className="flex-1">
                          <p className="text-white font-semibold mb-1">
                            {address.fullName}
                          </p>
                          <p className="text-sm text-gray-400">
                            {address.email}
                          </p>
                          <p className="text-sm text-gray-400">
                            {address.phoneNumber}
                          </p>
                          <p className="text-sm text-gray-400 mt-2">
                            {address.houseNumber} {address.streetName}
                          </p>
                          <p className="text-sm text-gray-400">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                        </div>
                      </div>

                      {selected && (
                        <p className="text-xs text-purple-400 mt-3 flex items-center gap-1">
                          ✓ Selected • Click again to deselect
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ADDRESS FORM */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">
              Shipping Details
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className={labelClasses}>
                  <User size={14} /> Full Name
                </label>
                <input
                  className={inputClasses}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>
                    <Mail size={14} /> Email
                  </label>
                  <input
                    type="email"
                    className={inputClasses}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    <Phone size={14} /> Phone Number
                  </label>
                  <input
                    type="tel"
                    className={inputClasses}
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>
                    <Home size={14} /> House Number
                  </label>
                  <input
                    className={inputClasses}
                    value={formData.houseNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        houseNumber: e.target.value,
                      })
                    }
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    <MapPin size={14} /> Street Name
                  </label>
                  <input
                    className={inputClasses}
                    value={formData.streetName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        streetName: e.target.value,
                      })
                    }
                    placeholder="Main Street"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClasses}>
                    <MapPin size={14} /> City
                  </label>
                  <input
                    className={inputClasses}
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        city: e.target.value,
                      })
                    }
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    <MapPin size={14} /> State
                  </label>
                  <input
                    className={inputClasses}
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        state: e.target.value,
                      })
                    }
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    <MapPin size={14} /> Zip Code
                  </label>
                  <input
                    className={inputClasses}
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        zipCode: e.target.value,
                      })
                    }
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- RIGHT - ORDER SUMMARY ---------------- */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-green-400">FREE</span>
              </div>

              <div className="h-px bg-gray-800" />

              <div className="flex justify-between text-xl font-bold text-white">
                <span>Total</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={initiatePayment}
              disabled={processingPayment}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingPayment ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard size={20} />
                  Pay ₹{calculateTotal().toFixed(2)}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Secure 256-bit SSL encrypted payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;