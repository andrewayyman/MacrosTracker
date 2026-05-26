import { useEffect } from "react";
import { getCurrentUser, refreshSession } from "../api/authClient";
import { useAuthStore } from "../store/authStore";

export function useAuthBootstrap() {
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const { accessToken, refreshToken, user, beginBootstrap, finishBootstrap, setAuth, clearAuth } =
        useAuthStore.getState();

      beginBootstrap();

      if (!refreshToken && !accessToken) {
        finishBootstrap();
        return;
      }

      try {
        if (accessToken && user) {
          const currentUserResponse = await getCurrentUser();

          if (!cancelled) {
            setAuth(currentUserResponse.data, accessToken, refreshToken);
          }

          return;
        }

        if (!refreshToken) {
          throw new Error("Missing refresh token.");
        }

        const refreshResponse = await refreshSession(refreshToken);

        if (!cancelled) {
          setAuth(
            refreshResponse.data.user,
            refreshResponse.data.accessToken,
            refreshResponse.data.refreshToken,
          );
        }
      } catch {
        if (!cancelled) {
          clearAuth();
        }
      } finally {
        if (!cancelled) {
          finishBootstrap();
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);
}
