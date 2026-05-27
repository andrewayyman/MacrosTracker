import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/Dashboard";
import GoalSetupPage from "./pages/GoalSetup";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap";
import HistoryPage from "./pages/History";
import HomePage from "./pages/Home";
import LoadingPage from "./pages/Loading";
import LoginPage from "./pages/Login";
import ManualLogPage from "./pages/ManualLog";
import NotFoundPage from "./pages/NotFound";
import ProfileSetupPage from "./pages/ProfileSetup";
import ProgressPage from "./pages/Progress";
import RegisterPage from "./pages/Register";
import ScanPage from "./pages/Scan";

function App() {
  useAuthBootstrap();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute>
            <ProfileSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/goal-setup"
        element={
          <ProtectedRoute>
            <GoalSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan"
        element={
          <ProtectedRoute>
            <ScanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/log"
        element={
          <ProtectedRoute>
            <ManualLogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
