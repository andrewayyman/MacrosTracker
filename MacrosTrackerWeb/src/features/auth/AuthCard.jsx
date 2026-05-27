import { Link } from "react-router-dom";

function AuthCard({ eyebrow, title, description, alternateLabel, alternateTo, children }) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        {eyebrow && <span className="auth-eyebrow">{eyebrow}</span>}
        <h1 className="auth-title">{title}</h1>
        <p className="auth-description">{description}</p>
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
