import axios from "axios";
import { getAccessToken } from "../utils/storage";

const authTransport = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
});

export async function registerUser(payload) {
  const response = await authTransport.post("/api/auth/register", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await authTransport.post("/api/auth/login", payload);
  return response.data;
}

export async function refreshSession(refreshToken) {
  const response = await authTransport.post("/api/auth/refresh", { refreshToken });
  return response.data;
}

export async function logoutUser(refreshToken, accessToken) {
  const response = await authTransport.post(
    "/api/auth/logout",
    refreshToken ? { refreshToken } : {},
    accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  );

  return response.data;
}

export async function getCurrentUser() {
  const response = await authTransport.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  return response.data;
}
