import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Single-promise refresh to prevent race conditions
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      // If a refresh is already in progress, wait for it
      if (refreshPromise) {
        try {
          await refreshPromise;
          return api(originalRequest);
        } catch {
          return Promise.reject(error);
        }
      }

      // Start a new refresh
      refreshPromise = api
        .post("/auth/refresh")
        .then(() => {})
        .catch((refreshError) => {
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });

      try {
        await refreshPromise;
        return api(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
