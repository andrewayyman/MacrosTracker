import axios from "axios";
import { refreshSession } from "./authClient";
import { getAccessToken, getRefreshToken } from "../utils/storage";
import { useAuthStore } from "../store/authStore";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://localhost:7159",
});

let activeRefreshPromise = null;

client.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          originalRequest._retry = true;
          activeRefreshPromise ??= refreshSession(refreshToken);
          const response = await activeRefreshPromise;
          activeRefreshPromise = null;

          useAuthStore.getState().setAuth(
            response.data.user,
            response.data.accessToken,
            response.data.refreshToken,
          );

          originalRequest.headers ??= {};
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return client(originalRequest);
        } catch {
          activeRefreshPromise = null;
        }
      }

      useAuthStore.getState().clearAuth();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default client;
