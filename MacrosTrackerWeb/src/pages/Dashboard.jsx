import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useAuthStore } from "../store/authStore";

function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <PageShell>
      <div className="dash-greeting">
        <span className="dash-greeting__eyebrow">Welcome back</span>
        <h1 className="dash-greeting__name">{user?.firstName || "there"}</h1>
        <p className="dash-greeting__sub">What are you eating today?</p>
      </div>

      <div className="dash-actions">
        <Link to="/scan" className="dash-action dash-action--primary">
          <span className="dash-action__label">Scan Food</span>
          <span className="dash-action__sub">Identify your meal with AI</span>
        </Link>
        <Link to="/log" className="dash-action">
          <span className="dash-action__label">Log Manually</span>
          <span className="dash-action__sub">Search and add any food item</span>
        </Link>
        <Link to="/history" className="dash-action">
          <span className="dash-action__label">Meal History</span>
          <span className="dash-action__sub">See past days and trends</span>
        </Link>
        <Link to="/goal-setup" className="dash-action">
          <span className="dash-action__label">My Goals</span>
          <span className="dash-action__sub">Review your nutrition targets</span>
        </Link>
      </div>

      <div className="dash-meta">
        <Link to="/profile-setup" className="dash-meta__link">Edit profile</Link>
        <Link to="/goal-setup" className="dash-meta__link">Nutrition goals</Link>
      </div>
    </PageShell>
  );
}

export default DashboardPage;
