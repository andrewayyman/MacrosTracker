import { Link } from "react-router-dom";
import { useAppShell } from "../hooks/useAppShell";

function HomePage() {
  const { appName, tagline } = useAppShell();

  return (
    <main className="landing-shell">
      <section className="landing-panel">
        <p className="eyebrow">Phase 0 Foundation</p>
        <h1>{appName}</h1>
        <p className="description">{tagline}</p>
        <div className="cta-row">
          <Link className="button-primary" to="/register">
            Start tracking
          </Link>
          <Link className="button-secondary" to="/login">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
