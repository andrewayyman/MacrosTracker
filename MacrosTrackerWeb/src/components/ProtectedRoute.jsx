import { Navigate, useLocation } from "react-router-dom";
import LoadingPage from "../pages/Loading";
import { useAuthStore } from "../store/authStore";
import { getSetupStep } from "../utils/setupStatus";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const user = useAuthStore((state) => state.user);

  if (isBootstrapping) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const step = getSetupStep(user?.setupStatus);
  const onSetupPage = location.pathname === "/profile-setup" || location.pathname === "/goal-setup";

  if (step === "profile" && location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }

  if (step === "goals" && location.pathname !== "/goal-setup") {
    return <Navigate to="/goal-setup" replace />;
  }

  if (step === "complete" && onSetupPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
