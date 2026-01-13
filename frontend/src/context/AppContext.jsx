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





//   -------------------Signin-------------------

const signin = async (data) => {
  try {
    setLoading(true);
    const response = await api.post(`/api/auth/login`, data);

    setIsAuthenticated(true);
    setUserData(response.data.data.user);

    return { success: true, message: response.data.message };
  } catch (error) {
    setIsAuthenticated(false);
    const status = error.response?.status;
    const payload = error.response?.data;
    if (status === 403 && payload?.requiresEmailVerification) {
      return {
        success: false,
        requiresEmailVerification: true,
        message: payload.message || "Please verify your email before logging in.",
      };
    }
    const errors = payload?.errors;
    const message =
      (Array.isArray(errors) && errors[0]?.msg) ||
      payload?.message ||
      "Something went wrong!";
    return { success: false, message };
  } finally {
    setLoading(false);
  }
};



//----------------get profile---------------------
const getProfile = async () => {
  try {
    const res = await api.get(`${backendUrl}/api/auth/me`);
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
      `${backendUrl}/api/auth/update-profile`,
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
      `${backendUrl}/api/auth/change-password`,
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
    const { data } = await api.get(`${backendUrl}/api/address`);
    if (data.success) {
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
    const { data } = await api.post(`${backendUrl}/api/address`, {
      recipientName: addressData.name,
      phone: addressData.phone,
      address: addressData.address,
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
      await api.post(`${backendUrl}/api/auth/logout`, {});
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









  //-------------------exporting values------------------- 
  const value = {
    backendUrl,
    navigateTo,
    signin,
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
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
}

export default AppContextProvider;
