import { Link } from "react-router-dom";
import { useAppShell } from "../hooks/useAppShell";

function HomePage() {
  const { appName, tagline } = useAppShell();

  return (
    <main className="landing-shell">
      <div className="landing-hero">
        <span className="landing-eyebrow">Built for Egyptian cuisine</span>
        <h1 className="landing-title">{appName}</h1>
        <p className="landing-tagline">{tagline}</p>
        <div className="landing-cta">
          <Link className="button-primary" to="/register">Start tracking</Link>
          <Link className="button-ghost" to="/login">Sign in</Link>
        </div>
        <div className="landing-features">
          <span className="landing-feature">AI photo scan</span>
          <span className="landing-feature">Egyptian meals</span>
          <span className="landing-feature">Daily macros</span>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
