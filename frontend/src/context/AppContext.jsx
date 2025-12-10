import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
// axios.defaults.withCredentials = true;  

import api from "../services/axiosInstance";



export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const nav = useNavigate();

//-------------------
//   Global States
//-------------------
const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
const [userData, setUserData] = useState(null);
const [storyId, setStoryId] = useState("");

// console.log("User Data in Context:", userData);
const [loading, setLoading] = useState(false);



const navigateTo = (path) => {
  nav(path);
  window.scrollTo({
    top: 10,
    behavior: "smooth",
  });
};



//------FUNCTIONS--------
//   -------------------Signup-------------------
const signup = async (data) => {
  try {
    setLoading(true);
    const response = await api.post(`${backendUrl}/api/auth/signup`, data);
    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Something went wrong!",
    };
  } finally {
    setLoading(false);
  }
};

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
  await api.post(`${backendUrl}/api/auth/logout`, {});

  setIsAuthenticated(false);
  setUserData(null);

  navigateTo("/signin");
};



// ------------------- Check Login -------------------
const checkLogin = async () => {
  try {
    const res = await api.get(`${backendUrl}/api/auth/is-logged-in`);

    if (res.data.loggedIn) {
      setIsAuthenticated(true);
      setUserData(res.data.user);
      return true;
    } else {
      setIsAuthenticated(false);
      setUserData(null);
      return false;
    }
  } catch (err) {
    setIsAuthenticated(false);
    setUserData(null);
    return false;
  }
};

useEffect(() => {
  checkLogin();
}, []);


// useEffect(() => {
//   const checkSession = async () => {
//     try {
//       const res = await api.get("/api/auth/me");
//       setUserData(res.data.data);
//     } catch (err) {
//       setUserData(null);
//     }
//   };

//   checkSession();
// }, []);








  //-------------------exporting values------------------- 
  const value = {
    backendUrl,
    navigateTo,
    signup,
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
