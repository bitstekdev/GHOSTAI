import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api, { setupAxiosInterceptors } from "../services/axiosInstance";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";

export const AppContext = createContext();

function AppContextProvider(props) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const nav = useNavigate();

//-------------------
//   Global States
//-------------------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [storyId, setStoryId] = useState("");
  const [loading, setLoading] = useState(true);
  
  // console.log("User Data in Context:", userData);

    // Check if user is logged in on mount
  useEffect(() => {
    checkAuthStatus();
    
    // Setup axios interceptors for token refresh
    const cleanup = setupAxiosInterceptors(() => {
      setIsAuthenticated(false);
      setUserData(null);
      nav('/signin');
    });
    
    return cleanup;
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/auth/is-logged-in`);
      
      if (response.data.loggedIn) {
        setIsAuthenticated(true);
        setUserData(response.data.user);
      } else {
        setIsAuthenticated(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Google Sign-in (frontend-only for now) -------------------
  const googleSignin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Send idToken to backend to create/verify session and set cookies
      const res = await api.post(
        '/api/auth/google',
        { idToken },
        { withCredentials: true }
      );

      if (res?.data?.success) {
        setIsAuthenticated(true);
        setUserData(res.data.user);
        nav('/generatestory');
        return { success: true };
      }
      return { success: false, message: res?.data?.message };
    } catch (err) {
      console.error('Google sign-in error:', err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

const navigateTo = (path, opts) => {
  try {
    if (opts && opts.state) {
      nav(path, { state: opts.state });
    } else {
      nav(path);
    }
  } catch (e) {
    // fallback
    nav(path);
  }

  window.scrollTo({
    top: 10,
    behavior: "smooth",
  });
};



//----------------get profile---------------------
const getProfile = async () => {
  try {
    const res = await api.get(`/api/auth/me`);
    setUserData(res.data.data);
    return res.data.data;
  } catch (err) {
    console.error("Profile fetch failed:", err);
    return null;
  }
};



//------------------update profile--------------------
const updateProfile = async (profile) => {
  try {
    const res = await api.put(
      `/api/auth/update-profile`,
      profile
    );
    setUserData(res.data.data);
    return res.data;
  } catch (err) {
    return err.response?.data?.message || "Failed to update profile";
  }
};

//----------------change password---------------------
const changePassword = async (security) => {
  try {
    const res = await api.post(
      `/api/auth/change-password`,
      {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      },
      { withCredentials: true }
    );
    return { success: true, message: res.data.message };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Password update failed",
    };
  }
};

//----------------ADDRESS MANAGEMENT---------------------
const [addresses, setAddresses] = useState([]);
const [loadingAddresses, setLoadingAddresses] = useState(false);
const [addressError, setAddressError] = useState("");

const fetchAddresses = async () => {
  try {
    setLoadingAddresses(true);
    setAddressError("");
    const { data } = await api.get(`/api/v1/address`);
    if (data.success) {
      // console.log("Fetched addresses:", data.data);
      setAddresses(data.data);
      return { success: true, data: data.data };
    }
  } catch (error) {
    console.error("Error fetching addresses:", error);
    const errorMsg = error.response?.data?.message || "Failed to load addresses";
    setAddressError(errorMsg);
    return { success: false, message: errorMsg };
  } finally {
    setLoadingAddresses(false);
  }
};

const createAddress = async (addressData) => {
  try {
    const { data } = await api.post(`/api/v1/address`, {
      fullName: addressData.fullName,
      email: addressData.email,
      phoneNumber: addressData.phoneNumber,
      houseNumber: addressData.houseNumber,
      streetName: addressData.streetName,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
    });
    if (data.success) {
      setAddresses([...addresses, data.data]);
      return { success: true, data: data.data };
    }
  } catch (error) {
    console.error("Error creating address:", error);
    const errorMsg = error.response?.data?.message || "Failed to save address";
    return { success: false, message: errorMsg };
  }
};

//--------------logout---------------------
  const logout = async () => {
    try {
      await api.post(`/api/auth/logout`, {});
      setIsAuthenticated(false);
      setUserData(null);
      nav('/signin');
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if API call fails
      setIsAuthenticated(false);
      setUserData(null);
      nav('/signin');
      return { success: false };
    }
  };


  //subscription plans api 
  const getPlansByContext = async (context = "all") => {
  const res = await api.get(`/api/v1/subscriptions/plans/byShowOnContext?context=${context}`);
  return res.data.plans;
};



// -------------------
// Subscription States
// -------------------
const [subscriptionStatus, setSubscriptionStatus] = useState(null);
const [activeSubscription, setActiveSubscription] = useState(null);
const [usageLeft, setUsageLeft] = useState(null);
const [subscriptionHistory, setSubscriptionHistory] = useState([]);
const [loadingSubscription, setLoadingSubscription] = useState(false);

// fetch subscription status
const fetchSubscriptionStatus = async () => {
  console.log("Fetching subscription status...");
  try {
    setLoadingSubscription(true);
    const { data } = await api.get("/api/v1/user-subscriptions/status");
    setSubscriptionStatus(data);
    return data;
  } catch (err) {
    console.error("Failed to fetch subscription status", err);
    setSubscriptionStatus(null);
    return null;
  } finally {
    setLoadingSubscription(false);
  }
};
// fetch active subscription
const fetchActiveSubscription = async () => {
  try {
    const { data } = await api.get("/api/v1/user-subscriptions/active");
    setActiveSubscription(data);
    return data;
  } catch (err) {
    console.error("Failed to fetch active subscription", err);
    setActiveSubscription(null);
    return null;
  }
};
// fetch usage left
const fetchUsageLeft = async () => {
  try {
    const { data } = await api.get("/api/v1/user-subscriptions/usage");
    setUsageLeft(data);
    return data;
  } catch (err) {
    console.error("Failed to fetch usage left", err);
    setUsageLeft(null);
    return null;
  }
};
// fetch subscription history
const fetchSubscriptionHistory = async () => {
  try {
    const { data } = await api.get("/api/v1/user-subscriptions/history");
    if (data.success) {
      setSubscriptionHistory(data.history);
      return data.history;
    }
  } catch (err) {
    console.error("Failed to fetch subscription history", err);
    setSubscriptionHistory([]);
    return [];
  }
};

// On mount, check if user is logged in and fetch subscription data
// useEffect(() => {
// if (!isAuthenticated && !userData) {
//   // fetch subscription data
//   fetchSubscriptionStatus();
//   fetchActiveSubscription();
//   fetchUsageLeft();
//   fetchSubscriptionHistory();
// }
// }, [isAuthenticated, userData]);






  //-------------------exporting values------------------- 
  const value = {
    backendUrl,
    navigateTo,
    googleSignin,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    userData,
    setUserData,
    loading,
    isAuthenticated,
    setIsAuthenticated,
    storyId,
    setStoryId,    
    fetchAddresses,
    createAddress,
    addresses,
    loadingAddresses,
    addressError,
    getPlansByContext,
    //subscription----
    subscriptionStatus,
    activeSubscription,
    usageLeft,
    subscriptionHistory,
    loadingSubscription,
    fetchSubscriptionStatus,
    fetchActiveSubscription,
    fetchUsageLeft,
    fetchSubscriptionHistory,

  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
}

export default AppContextProvider;
