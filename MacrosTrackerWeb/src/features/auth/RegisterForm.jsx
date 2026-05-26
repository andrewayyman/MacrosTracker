import { useState } from "react";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

function RegisterForm({ onSubmit, isSubmitting, errorMessage, fieldErrors }) {
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
        First name
        <input name="firstName" value={formState.firstName} onChange={handleChange} autoComplete="given-name" />
        {fieldErrors.firstName ? <span className="field-error">{fieldErrors.firstName}</span> : null}
      </label>
      <label>
        Last name
        <input name="lastName" value={formState.lastName} onChange={handleChange} autoComplete="family-name" />
      </label>
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
          autoComplete="new-password"
        />
        {fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}
      </label>
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      <button className="button-primary auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

export default RegisterForm;
