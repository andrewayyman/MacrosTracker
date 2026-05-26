import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authClient";
import AuthCard from "../features/auth/AuthCard";
import RegisterForm from "../features/auth/RegisterForm";
import { useAuthStore } from "../store/authStore";
import { parseServiceErrors } from "../utils/serviceErrors";

function RegisterPage() {
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
      const response = await registerUser(payload);
      setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const parsedErrors = parseServiceErrors(error, "We couldn't create your account right now.");
      setErrorMessage(parsedErrors.errorMessage);
      setFieldErrors(parsedErrors.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Authentication"
      title="Start tracking with a real account"
      description="Create your GymScan account, save your progress, and step straight into your private dashboard."
      alternateLabel="Already have an account?"
      alternateTo="/login"
    >
      <RegisterForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
      />
    </AuthCard>
  );
}

export default RegisterPage;
