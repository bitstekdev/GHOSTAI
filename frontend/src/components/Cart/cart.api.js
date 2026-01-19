import api from "../../services/axiosInstance";

export const addToCartApi = (data) =>
  api.post("/api/v1/cart/add", data);

export const getCartApi = () =>
  api.get("/api/v1/cart");

export const updateCartApi = (data) =>
  api.patch("/api/v1/cart/update", data);

export const removeCartApi = (data) =>
  api.delete("/api/v1/cart/remove", { data });

export const clearCartApi = () =>
  api.delete("/api/v1/cart/clear");