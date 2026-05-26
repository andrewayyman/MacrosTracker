import { create } from "zustand";
import { clearStoredAuth, getAccessToken, getRefreshToken, getStoredUser, setStoredAuth } from "../utils/storage";

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  isAuthenticated: Boolean(getAccessToken()),
  isBootstrapping: true,
  setAuth: (user, accessToken, refreshToken = null) => {
    setStoredAuth({ accessToken, refreshToken, user });
    set({ user, accessToken, refreshToken, isAuthenticated: true, isBootstrapping: false });
  },
  beginBootstrap: () => set({ isBootstrapping: true }),
  finishBootstrap: () => set({ isBootstrapping: false }),
  clearAuth: () => {
    clearStoredAuth();
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isBootstrapping: false });
  },
}));
