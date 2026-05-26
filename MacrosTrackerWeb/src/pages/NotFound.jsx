import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="state-shell">
      <div className="state-card">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="description">The route does not exist yet, but the app shell is healthy.</p>
        <Link className="button-primary" to="/">
          Back home
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
