import { NavLink } from "react-router-dom";
import { LayoutDashboard, Target, History, TrendingUp, Utensils } from "lucide-react";

export default function Sidebar() {
  const sections = [
    {
      title: "Core",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { to: "/log", label: "Add Meal", icon: <Utensils size={18} /> },
      ]
    },
    {
      title: "Analytics & Strategy",
      items: [
        { to: "/my-goal", label: "My Goals", icon: <Target size={18} /> },
        { to: "/history", label: "History", icon: <History size={18} /> },
        { to: "/progress", label: "Progress", icon: <TrendingUp size={18} /> },
      ]
    }
  ];

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar__brand">
        <div className="dash-sidebar__logo">GS</div>
        <span className="dash-sidebar__name">GymScan</span>
      </div>
      <nav className="dash-sidebar__nav">
        {sections.map((section, idx) => (
          <div key={idx} className="dash-sidebar__section">
            <h3 className="dash-sidebar__section-title">{section.title}</h3>
            <div className="dash-sidebar__section-items">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `dash-sidebar__link ${isActive ? "dash-sidebar__link--active" : ""}`
                  }
                >
                  <span className="dash-sidebar__link-icon">{item.icon}</span>
                  <span className="dash-sidebar__link-text">{item.label}</span>
                  <span className="dash-sidebar__link-indicator" />
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

