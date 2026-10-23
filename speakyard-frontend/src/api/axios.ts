import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

// const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Shared QueryClient instance — imported by other modules that need cache access
export let sharedQueryClient: QueryClient | null = null;
export const setSharedQueryClient = (qc: QueryClient) => {
  sharedQueryClient = qc;
};

// Track whether a token refresh is already in flight so concurrent
// requests don't each trigger their own refresh call.
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

const flushQueue = (error?: unknown) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt a refresh for 401 errors that haven't been retried yet,
    // and skip the refresh endpoint itself to avoid an infinite loop.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      if (isRefreshing) {
        // Another request already kicked off a refresh — wait for it.
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh-token");
        flushQueue();
        return api(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError);
        // Clear all cached data so the UI instantly reflects logged-out state
        sharedQueryClient?.clear();
        // Redirect to login — use window.location so it works outside React Router
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
