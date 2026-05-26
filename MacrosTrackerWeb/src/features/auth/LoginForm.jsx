import { useState } from "react";

const initialState = {
  email: "",
  password: "",
};

function LoginForm({ onSubmit, isSubmitting, errorMessage, fieldErrors }) {
  const [formState, setFormState] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formState);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>
        Email
        <input name="email" type="email" value={formState.email} onChange={handleChange} autoComplete="email" />
        {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          value={formState.password}
          onChange={handleChange}
          autoComplete="current-password"
        />
        {fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}
      </label>
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      <button className="button-primary auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default LoginForm;
