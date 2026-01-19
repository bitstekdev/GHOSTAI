import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import api from "../../services/axiosInstance";
import PlansGrid  from "./PlansGrid";

const UpgradePlansPage = () => {
  const { getPlansByContext, navigateTo, fetchUsageLeft, getProfile } = useContext(AppContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlansByContext("upgrade");
        console.log("Fetched plans:", data);
        setPlans(data);
      } catch (err) {
        console.error("Failed to load plans", err);
      } finally {
        setLoading(false);
      }
    };

      const fetchProfile = async () => {
      try {
       const  profileData = await getProfile();
       console.log("Fetched profile:", profileData);
       setProfile({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
        });
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    
    fetchPlans();
    fetchProfile();
  }, [getPlansByContext]);

   // Razorpay payment processing state--------------------------
 const handlePlanAction = async (plan) => {
    console.log("Selected plan:", plan);
    
    if (processingPayment) return;

    try {
      setProcessingPayment(true);

      // Step 1: Create Razorpay order
      const orderResponse = await api.post("/api/v1/subscriptions/order", {
        planId: plan._id,
        isUpgrade: true,
      });

      const { order, subscriptionId } = orderResponse.data;

      // Step 2: Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "Ghostverse.ai",
        description: `${plan.name} Subscription`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Step 3: Verify payment
            const verifyResponse = await api.post("/api/v1/subscriptions/verify", {
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              subscriptionId: subscriptionId,
              planId: plan._id,
              isUpgrade: true, // Set to true if upgrading existing subscription
            });

            if (verifyResponse.data.success) {
              // Navigate to success page
              fetchUsageLeft();
              navigateTo("/dashboard");
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert(error.response?.data?.message || "Payment verification failed. Please contact support.");
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: profile.name, 
          email: profile.email,
          contact: profile.phone,
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
            console.log("Payment cancelled by user");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setProcessingPayment(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      alert(err.response?.data?.message || "Failed to initiate payment");
      setProcessingPayment(false);
    }
  };

  if (loading) return <div>Loading plans...</div>;

  return (
    <>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white text-center mb-4">
          UPGRADE YOUR PLAN
        </h1>
        <p className="text-white/60 text-center mb-12">
          Simple pricing. No hidden charges.
        </p>

        <PlansGrid
          plans={plans}
          context="upgrade"
          onAction={handlePlanAction}
        />
      </div>
    </>
  );
};

export default UpgradePlansPage;
