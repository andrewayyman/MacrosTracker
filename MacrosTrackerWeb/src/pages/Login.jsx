import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authClient";
import AuthCard from "../features/auth/AuthCard";
import LoginForm from "../features/auth/LoginForm";
import { useAuthStore } from "../store/authStore";
import { parseServiceErrors } from "../utils/serviceErrors";

function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  if (isAuthenticated && !isBootstrapping) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      const response = await loginUser(payload);
      setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const parsedErrors = parseServiceErrors(error, "We couldn't sign you in right now.");
      setErrorMessage(parsedErrors.errorMessage);
      setFieldErrors(parsedErrors.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Authentication"
      title="Welcome back to GymScan"
      description="Sign in to restore your protected workspace and keep tracking without extra friction."
      alternateLabel="Need an account?"
      alternateTo="/register"
    >
      <LoginForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
      />
    </AuthCard>
  );
}

export default LoginPage;
