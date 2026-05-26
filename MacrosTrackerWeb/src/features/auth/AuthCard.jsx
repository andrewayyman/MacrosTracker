import { Link } from "react-router-dom";

function AuthCard({ eyebrow, title, description, alternateLabel, alternateTo, children }) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="description">{description}</p>
        {children}
        <p className="auth-switch">
          <span>{alternateLabel}</span>
          <Link to={alternateTo}>{alternateTo === "/login" ? "Sign in" : "Create account"}</Link>
        </p>
      </section>
    </main>
  );
}

export default AuthCard;
