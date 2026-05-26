import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useAuthStore } from "../store/authStore";

function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <PageShell
      eyebrow="Authenticated"
      title={`Welcome${user?.firstName ? `, ${user.firstName}` : ""}`}
      description="Your account is active. Use the cards below to review or update your setup."
    >
      <div className="status-grid">
        <article>
          <h2>Setup status</h2>
          <p>{user?.setupStatus ?? "Unknown"}</p>
        </article>
        <article>
          <h2>Account email</h2>
          <p>{user?.email ?? "Unavailable"}</p>
        </article>
        <article>
          <h2>Profile</h2>
          <p>Review or update your body metrics.</p>
          <Link className="button-secondary" to="/profile-setup" style={{ marginTop: 12 }}>Edit Profile</Link>
        </article>
        <article>
          <h2>Daily Goals</h2>
          <p>Review or update your nutrition targets.</p>
          <Link className="button-secondary" to="/goal-setup" style={{ marginTop: 12 }}>Edit Goals</Link>
        </article>
      </div>
    </PageShell>
  );
}

export default DashboardPage;
