import { Link } from "react-router-dom";
import { useAppShell } from "../hooks/useAppShell";

function HomePage() {
  const { appName, tagline } = useAppShell();

  return (
    <main className="landing-shell">
      <div className="landing-hero">
        <span className="landing-eyebrow">Nutrition tracking</span>
        <h1 className="landing-title">{appName}</h1>
        <p className="landing-tagline">{tagline}</p>
        <div className="landing-cta">
          <Link className="button-primary" to="/register">Start tracking</Link>
          <Link className="button-secondary" to="/login">Sign in</Link>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
