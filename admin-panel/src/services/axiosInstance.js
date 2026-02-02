import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/* =========================
   Request Interceptor
========================= */
api.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   Refresh Token Handling
========================= */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

/* =========================
   Response Interceptor
========================= */
export const setupAxiosInterceptors = (onLogout) => {
  const interceptor = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => api(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await api.post("/api/auth/refresh-token");
          processQueue();
          isRefreshing = false;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          isRefreshing = false;
          onLogout?.();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return () => {
    api.interceptors.response.eject(interceptor);
  };
};

export default api;
