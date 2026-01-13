import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/axiosInstance";



export const AppContext = createContext();

const AppContextProvider = (props) => {
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

const navigateTo = (path) => {
  nav(path);
  window.scrollTo({
    top: 10,
    behavior: "smooth",
  });
};



//------FUNCTIONS--------
//   -------------------Signup-------------------
// const signup = async (data) => {
//   try {
//     // setLoading(true);
//     const response = await api.post(`${backendUrl}/api/auth/signup`, data);
//     return { success: true, message: response.data.message };
//   } catch (error) {
//     return {
//       success: false,
//       message: error.response?.data?.message || "Something went wrong!",
//     };
//   } finally {
//     // setLoading(false);
//   }
// };

//   -------------------Signin-------------------

const signin = async (data) => {
  try {
    setLoading(true);
    const response = await api.post(`${backendUrl}/api/auth/login`, data);

    setIsAuthenticated(true);
    setUserData(response.data.data.user);

    return { success: true, message: response.data.message };
  } catch (error) {
    console.log("Signin error:", error);
    setIsAuthenticated(false);
    return {
      success: false,
      message: error.response?.data?.message || "Something went wrong!",
    };
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




//--------------logout---------------------
  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {});
      setIsAuthenticated(false);
      setUserData(null);
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if API call fails
      setIsAuthenticated(false);
      setUserData(null);
      return { success: false };
    }
  };









  //-------------------exporting values------------------- 
  const value = {
    backendUrl,
    navigateTo,
    // signup,
    signin,
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
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
