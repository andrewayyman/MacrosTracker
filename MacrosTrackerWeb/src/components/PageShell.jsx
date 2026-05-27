import { Link, useLocation } from "react-router-dom";
import { logoutUser } from "../api/authClient";
import { useAuthStore } from "../store/authStore";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/scan", label: "Scan" },
  { to: "/history", label: "History" },
];

function PageShell({ eyebrow, title, description, children }) {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logoutUser(refreshToken, accessToken);
    } catch {
      // session may already be invalid on the server
    } finally {
      clearAuth();
      window.location.assign("/login");
    }
  };

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <Link to="/" className="app-nav__brand">GymScan</Link>

        <div className="app-nav__links">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`app-nav__link${location.pathname === to ? " app-nav__link--active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="app-nav__user">
          {isAuthenticated && user ? (
            <>
              <span className="app-nav__username">{user.firstName}</span>
              <button
                className="button-secondary btn--sm"
                type="button"
                onClick={handleLogout}
                style={{ minHeight: 34, padding: "0 12px", fontSize: "0.8125rem", borderRadius: 6 }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="button-secondary"
              style={{ minHeight: 34, padding: "0 12px", fontSize: "0.8125rem", borderRadius: 6 }}
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      <main className="page-content">
        {(eyebrow || title || description) && (
          <header className="page-header">
            {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
            {title && <h1 className="page-title">{title}</h1>}
            {description && <p className="page-description">{description}</p>}
          </header>
        )}
        {children}
      </main>
    </div>
  );
}

export default PageShell;
