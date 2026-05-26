import { Link } from "react-router-dom";
import { logoutUser } from "../api/authClient";
import { useAuthStore } from "../store/authStore";

function PageShell({ eyebrow, title, description, children }) {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await logoutUser(refreshToken, accessToken);
    } catch {
      // The session may already be invalid on the server.
    } finally {
      clearAuth();
      window.location.assign("/login");
    }
  };

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="description">{description}</p>
        {isAuthenticated && user ? (
          <div className="account-strip">
            <span>{user.firstName}</span>
            <span>{user.setupStatus}</span>
            <button className="button-secondary button-inline" type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : null}
        <nav className="quick-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/scan">Scan</Link>
          <Link to="/history">History</Link>
          {!isAuthenticated ? <Link to="/login">Login</Link> : null}
        </nav>
      </section>
      <section className="content-card">{children}</section>
    </main>
  );
}

export default PageShell;
