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
import MyGoalPage from "./pages/MyGoal";
import NotFoundPage from "./pages/NotFound";
import ProfileSetupPage from "./pages/ProfileSetup";
import ProgressPage from "./pages/Progress";
import RegisterPage from "./pages/Register";
import ScanPage from "./pages/Scan";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";

function App() {
  useAuthBootstrap();

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="/goal-setup" element={<GoalSetupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-goal" element={<MyGoalPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/log" element={<ManualLogPage />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Route>

      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
