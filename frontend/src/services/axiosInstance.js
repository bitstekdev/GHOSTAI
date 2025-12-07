import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // IMPORTANT FOR COOKIES
});

// ---- TOKEN REFRESH HANDLER ----
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    // If API returned 401 (access token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // prevent infinite loop

      try {
        // Call refresh-token
        const refreshRes = await api.post("/api/auth/refresh-token", {}, { withCredentials: true });


        console.log("Access token refreshed successfully" + refreshRes.data);

        // Retry original failed request
        return api(originalRequest);

      } catch (refreshError) {
        console.log("Refresh token failed → logging out");

        // Destroy any client-side cached auth data
        localStorage.removeItem("auth");

        // Redirect user to login
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
